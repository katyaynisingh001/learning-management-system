import { clerkClient, getAuth } from '@clerk/express';

//Update role to educator
export const updateRoleToEducator = async (req, res) => {
    try {
        const { userId } = getAuth(req)

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'You must be signed in to become an educator.'
            })
        }

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: "educator"
            }
        })

        res.json({success: true, message: "You can publish your courses now!"})

    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}
