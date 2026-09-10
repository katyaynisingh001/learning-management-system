import { Webhook } from "svix";
import User from "../models/User.js";

// API controller function to manage Clerk users in the database
export const clerkWebhook = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        const payload = req.body.toString();

        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        const event = whook.verify(payload, headers);

        const { data, type } = event;

        switch (type) {
            case "user.created": {
                const userData = {
                    _id: data.id,
                    name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
                    email: data.email_addresses[0].email_address,
                    imageUrl: data.image_url,
                };

                await User.create(userData);

                return res.status(200).json({
                    success: true,
                    message: "User created successfully",
                });
            }

            case "user.updated": {
                const userData = {
                    name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
                    email: data.email_addresses[0].email_address,
                    imageUrl: data.image_url,
                };

                await User.findByIdAndUpdate(data.id, userData);

                return res.status(200).json({
                    success: true,
                    message: "User updated successfully",
                });
            }

            case "user.deleted": {
                await User.findByIdAndDelete(data.id);

                return res.status(200).json({
                    success: true,
                    message: "User deleted successfully",
                });
            }

            default:
                return res.status(200).json({
                    success: true,
                    message: "Event received",
                });
        }
    } catch (error) {
        console.error("Clerk webhook error:", error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};