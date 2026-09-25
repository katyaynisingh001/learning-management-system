import { clerkClient, getAuth } from "@clerk/express";

//Middleware ( Proctect Educator Routes )

export const protectEducator = async(req, res, next)=>{
    try{
        const { userId } = getAuth(req)

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Missing or invalid Clerk authentication token.'
            })
        }

        const response = await clerkClient.users.getUser(userId)
    
        if(response.publicMetadata.role !== 'educator'){
            return res.status(403).json({success:false, message :'Unauthorized Access'}) 
            }
            next()
        }catch(error){
            res.status(401).json({success:false, message: error.message})
    }
}