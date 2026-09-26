import { clerkClient, getAuth } from '@clerk/express'
import User from '../models/User.js'

export const syncUser = async (req, res) => {
    const { userId } = getAuth(req)

    if (!userId) {
        return res.status(401).json({ success: false, message: 'You must be signed in.' })
    }

    try {
        const clerkUser = await clerkClient.users.getUser(userId)
        const email = clerkUser.emailAddresses.find(
            ({ id }) => id === clerkUser.primaryEmailAddressId
        )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress

        if (!email) {
            return res.status(400).json({ success: false, message: 'Your account needs an email address.' })
        }

        const user = await User.findOneAndUpdate(
            { _id: userId },
            {
                $set: {
                    name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || email,
                    email,
                    imageUrl: clerkUser.imageUrl || '',
                },
            },
            { upsert: true, new: true, runValidators: true }
        )

        return res.json({ success: true, user })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}