import { clerkClient, getAuth } from "@clerk/express";

//Middleware ( Proctect Educator Routes )

export const protectEducator = async(req, res, next)=>{
    let userId
    try{
        userId = getAuth(req).userId
    } catch (error) {
        console.error('Failed to read Clerk authentication:', error.message)
        return res.status(401).json({
            success: false,
            message: 'Your sign-in session is invalid. Please sign in again.'
        })
    }

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: 'You must be signed in to access educator features.'
        })
    }

    try {
        const user = await clerkClient.users.getUser(userId)
        if (user.publicMetadata.role !== 'educator') {
            return res.status(403).json({
                success: false,
                message: 'Your account does not have educator access.'
            })
        }

        return next()
    } catch (error) {
        console.error('Failed to verify educator role with Clerk:', error.message)
        return res.status(503).json({
            success: false,
            message: 'Unable to verify educator access right now. Please try again.'
        })
    }
}