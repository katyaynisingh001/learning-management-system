import User from '../models/User.js'

//get user data
export const getUserData = async (req, res) => {
    try {
        const userId = req.auth.userId
        const user = await User.findById(userId)

        if(!user){
            return res.json({success: false, message: "User not Found"})
        }
        res.json({success:true, user})
    }catch(error){
        req.json({success:false, message: error.message})
    }
}

//Users Enrolled Courses With Lecture links
export const userEnrolledCourses = async(req, res) =>{
    try {
        const userId = req.auth.userId
        const userData = await User.findById(userId).populate('enrolledCourses')

        res.json({success: true, enrolledCourses: userData.enrolledCourses})
    } catch (error) {
        res.json({success:false, message:error.message})
    }
}