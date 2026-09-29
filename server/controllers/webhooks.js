import { Webhook } from "svix";
import User from "../models/User.js";

//API Controller Function to manage clerk user with database

export const clerkWebhook = async (req, res) => {
    let event

    try {
        if (!req.body || !Buffer.isBuffer(req.body)) {
            return res.status(400).json({ success: false, message: 'Missing raw webhook payload.' })
        }

        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        event = whook.verify(req.body, {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message })
    }

    try {
        const { data, type } = event

        switch(type) {
            case "user.created":
            case "user.updated": {
                const email = data.email_addresses?.find(
                    ({ id }) => id === data.primary_email_address_id
                )?.email_address ?? data.email_addresses?.[0]?.email_address

                if (!email) {
                    return res.status(400).json({ success: false, message: 'Clerk user has no email address.' })
                }

                const userData = {
                    name: [data.first_name, data.last_name].filter(Boolean).join(' ') || email,
                    email,
                    imageUrl: data.image_url ?? '',
                }
                await User.findOneAndUpdate(
                    { _id: data.id },
                    { $set: userData },
                    { upsert: true, new: true, runValidators: true }
                )
                break;
            }
            case "user.deleted": {
                await User.findByIdAndDelete(data.id)
                break;
            }
            default: 
            break;
        }
        return res.json({ received: true })
    }catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}




// const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)

// export const stripeWebhooks = async (request, response) => {
//     const sig = request.headers['stripe-signature'];

//     let event;

//     try {
//         event = Stripe.webhhoks.constructEvent(request.body, sig, process.env.STRIPE_SECRET_KEY);
//     } catch (error) {
//         res.status(400).send(`Webhook error :$(err.message)`);
//     }

//     //Handle the event
//     switch(event.type){
//         case 'payment_intent.succeeded':{
//             const paymentIntent = event.data.object;
//             const paymentIntentId = paymentIntent.id;

//             const session = await stripeInstance.checkout.sessions.list({
//                 payment_intent: paymentIntentId
//             })
//             const { purchaseId } = session.data[0].metadata;

//             const purcahseData = await purchaseId.findById(purchaseId)
//             const userData = await User.findById(purcahseData.userId)
//             const courseData = await Course.findById(purcahseData.courseId.toString())

//             courseData.enrolledStudents.push(userData)

//             await courseData.save()

//             userData.enrolledCourses.push(courseData._id)
//             await userData.save()
        
//             purcahseData.status = 'completed'
//             await purcahseData.save()

//             break;
//         }
//         case 'payment_intent.payment_failed':{
//             const paymentIntent = event.data.object;
//             const paymentIntentId = paymentIntent.id;

//             const session = await stripeInstance.checkout.sessions.list({
//                 payment_intent: paymentIntentId
//             })
//             const { purchaseId } = session.data[0].metadata;
//             const purchaseData = await purchaseId.findById(purchaseId)
//             purchaseData.status = 'failed'
//             await purchaseData.save()

//             break;}
//             //...handle other event types
//             default:
//                 console.log(`Unhandled event type ${event.type}`);
//         }
//         // Return a response to acknowledge receipt of the event
//         response.json({received:true});
//     }