import { Webhook } from "svix";
import User from "../models/User.js";
import Stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";

export const clerkWebhook = async (req, res) => {
    if (!Buffer.isBuffer(req.body)) {
        return res.status(400).json({ success: false, message: 'Missing raw webhook payload.' });
    }

    if (!process.env.CLERK_WEBHOOK_SECRET) {
        console.error('CLERK_WEBHOOK_SECRET is not configured.');
        return res.status(500).json({ success: false, message: 'Clerk webhook is not configured.' });
    }

    let event;
    try {
        const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        event = webhook.verify(req.body.toString('utf8'), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        });
    } catch (error) {
        console.error('Clerk webhook signature verification failed:', error.message);
        return res.status(400).json({ success: false, message: 'Invalid Clerk webhook signature.' });
    }

    try {
        switch (event.type) {
            case 'user.created':
            case 'user.updated': {
                const { data } = event;
                const primaryEmail = data.email_addresses?.find(
                    email => email.id === data.primary_email_address_id
                )?.email_address || data.email_addresses?.[0]?.email_address;

                if (!primaryEmail) {
                    return res.status(422).json({
                        success: false,
                        message: 'The Clerk user does not have an email address.'
                    });
                }

                const name = [data.first_name, data.last_name].filter(Boolean).join(' ')
                    || data.username
                    || primaryEmail;

                await User.findByIdAndUpdate(
                    data.id,
                    { $set: { email: primaryEmail, name, imageUrl: data.image_url } },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                break;
            }
            case 'user.deleted':
                await User.findByIdAndDelete(event.data.id);
                break;
            default:
                console.info(`Ignoring Clerk webhook event: ${event.type}`);
        }

        return res.status(200).json({ received: true });
    } catch (error) {
        console.error('Failed to process Clerk webhook:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to process Clerk webhook.' });
    }
};

export const stripeWebhooks = async (req, res) => {
    if (!Buffer.isBuffer(req.body)) {
        return res.status(400).json({ success: false, message: 'Missing raw webhook payload.' });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error('STRIPE_WEBHOOK_SECRET is not configured.');
        return res.status(500).json({ success: false, message: 'Stripe webhook is not configured.' });
    }

    let event;
    try {
        event = Stripe.webhooks.constructEvent(
            req.body,
            req.headers['stripe-signature'],
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error('Stripe webhook signature verification failed:', error.message);
        return res.status(400).json({ success: false, message: 'Invalid Stripe webhook signature.' });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed':
            case 'checkout.session.async_payment_succeeded': {
                const session = event.data.object;
                if (session.payment_status !== 'paid') break;

                const purchaseId = session.metadata?.purchaseId;
                if (!purchaseId) {
                    console.error('Paid Stripe checkout session is missing its purchase ID.');
                    break;
                }

                const purchase = await Purchase.findById(purchaseId);
                if (!purchase) {
                    throw new Error(`Purchase ${purchaseId} was not found.`);
                }

                const [course, user] = await Promise.all([
                    Course.findById(purchase.courseId),
                    User.findById(purchase.userId)
                ]);
                if (!course || !user) {
                    throw new Error(`Purchase ${purchaseId} references a missing course or user.`);
                }

                await Promise.all([
                    Course.updateOne({ _id: course._id }, { $addToSet: { enrolledStudents: user._id } }),
                    User.updateOne({ _id: user._id }, { $addToSet: { enrolledCourses: course._id } }),
                    Purchase.updateOne({ _id: purchase._id }, { $set: { status: 'completed' } })
                ]);
                break;
            }
            case 'checkout.session.async_payment_failed':
            case 'checkout.session.expired': {
                const purchaseId = event.data.object.metadata?.purchaseId;
                if (purchaseId) {
                    await Purchase.updateOne(
                        { _id: purchaseId, status: 'pending' },
                        { $set: { status: 'failed' } }
                    );
                }
                break;
            }
            default:
                console.info(`Ignoring Stripe webhook event: ${event.type}`);
        }

        return res.status(200).json({ received: true });
    } catch (error) {
        console.error('Failed to process Stripe webhook:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to process Stripe webhook.' });
    }
};
