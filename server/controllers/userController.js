import User from '../models/User.js'
import { Purchase } from "../models/Purchase.js";
import Stripe from "stripe";
import Course from "../models/Course.js"
import { CourseProgress } from '../models/CourseProgress.js'
import { clerkClient, getAuth } from '@clerk/express'

export const syncUser = async (req, res) => {
    try {
        const userId = getAuth(req).userId

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'No authenticated Clerk user was found. Sign in and confirm the client and server Clerk keys belong to the same instance.'
            })
        }

        const clerkUser = await clerkClient.users.getUser(userId)
        const email = clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress

        if (!email) {
            return res.status(400).json({ success: false, message: 'Your Clerk account needs an email address.' })
        }

        const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || clerkUser.username || email
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { name, email, imageUrl: clerkUser.imageUrl } },
            { new: true, upsert: true }
        )

        res.json({ success: true, user })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}


//get user data
export const getUserData = async (req, res) => {
    try {
        const userId = getAuth(req).userId
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
        const userId = getAuth(req).userId
        const userData = await User.findById(userId).populate('enrolledCourses')

        res.json({success: true, enrolledCourses: userData.enrolledCourses})
    } catch (error) {
        res.json({success:false, message:error.message})
    }
}

//Purchase Course
export const purchaseCourse = async()=>{
    try {
        const { courseId } = req.body 
        const { origin } = req.headers
        const userId = getAuth(req).userId 
        const userData = await User.findById(userId)
        const courseData = await Course.findById(courseId)

        if(!userData || !courseData){
            return res.json({success:false, message: 'Data Not Found'})
        }

        const purchaseData = {
            courseId: courseData._id,userId,
            amount: (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2),
        }
        const newPurchase = await Purchase.create(purchaseData)

        //Stripe Gateway Initialize
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)

        const currency = process.env.CURRENCY.toLocaleLowerCase()

        //Creating line items to for Stripe
        const line_items = [{
            price_data:{
                currency, 
                product_data:{
                    name: courseData.courseTitle
                },
                unit_amount: Math.floor(newPurchase.amount) * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString()
            }
        })
        res.json({success:true, session_url: session_url})

    } catch (error) {
        res.json({success:false, message: error.message});
    }
}

//Update User Course Progress
export const updateUserCourseProgress = async(req, res) =>{
    try {
        const { courseId, lectureId } = req.body
        const userId = getAuth(req).userId
        const courseProgress = await CourseProgress.findOne({ userId, courseId })

        if (progressData){
            if(progressData.lectureCompleted.includes(lectureId)){
                return res.json({success:false, message: "Lecture Already Completed"})
            }
            progressData.lectureCompleted.push(lectureId)
            await progressData.save()
        }else{
            await CourseProgress.create({ 
                userId,
                courseId,
                lectureCompleted: [lectureId] 
            })
        }
        res.json({success:true, message: "Course Progress Updated"})
    } catch (error) {
        res.json({success:false, message: error.message})
    }
}

//Get User Course Progress
export const getCourseProgress = async(req, res) =>{
    try {
        const { courseId, lectureId } = req.body
        const userId = getAuth(req).userId
        const progressData = await CourseProgress.findOne({ userId, courseId })
        res.json({success:true, progressData})
    } catch (error) {
        res.json({success:false, message: error.message})
    }
}

//Add user Rating to Course
export const addUserRating = async(req, res) =>{
    const { courseId, rating } = req.body
    const userId = getAuth(req).userId

    if(!courseId || !userId || !rating || rating < 1 || rating > 5){
        return res.json({success:false, message: "Invalid Data"})
    }
    try{
        const course = await Course.findById(courseId)

        if(!course){
            return res.json({success:false, message: "Course Not Found"})
        }
        const user = await User.findById(userId)

        if(!user || !user.enrolledCourses.includes(courseId)){
            return res.json({success:false, message: "User has not purchased this course"});
        }
        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId)
         if(existingRatingIndex !== -1){
            course.courseRatings[existingRatingIndex].rating = rating;
        }else{
            course.courseRatings.push({ userId, rating });
        }
        await course.save();

        res.json({success:true, message: "Rating Added"})
    } catch(error){
        res.json({success:false, message: error.message})
    }
}
    