import { Webhook } from "svix";
import User from "../models/User.js";

//API Controller Function to manage clerk user with database

export const clerkWebhook = async (req, res) => {
    let event

    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        event = whook.verify(req.body, {
            "svix-id" : req.headers["svix-id"],
            "svix-timestamp" : req.headers["svix-timestamp"],
            "svix-signature" : req.headers["svix-signature"]
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