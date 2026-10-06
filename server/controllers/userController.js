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
export const purchaseCourse = async(req, res)=>{
    try {
        const { courseId } = req.body
        const origin = req.get('origin')
        const userId = getAuth(req).userId
        if (!userId || !courseId || !origin) {
            return res.status(400).json({success: false, message: 'Course, sign-in, or checkout origin is missing.'})
        }

        const userData = await User.findById(userId)
        const courseData = await Course.findById(courseId)

        if(!userData || !courseData){
            return res.status(404).json({success:false, message: 'User or course was not found.'})
        }
        if (userData.enrolledCourses.some(enrolledCourseId => String(enrolledCourseId) === String(courseData._id))) {
            return res.status(409).json({success: false, message: 'You are already enrolled in this course.'})
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
                unit_amount: Math.round(Number(newPurchase.amount) * 100)
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/my-enrollments?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/course/${courseData._id}`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString()
            }
        })
        res.json({success:true, session_url: session.url})

    } catch (error) {
        console.error('Failed to create course checkout session:', error.message)
        res.status(500).json({success:false, message: error.message});
    }
}

// Confirm a completed Checkout Session and grant course access.
export const confirmCoursePurchase = async(req, res) => {
    try {
        const { sessionId } = req.body
        const userId = getAuth(req).userId
        if (!userId || !sessionId) {
            return res.status(400).json({success: false, message: 'A signed-in user and checkout session are required.'})
        }

        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
        const session = await stripeInstance.checkout.sessions.retrieve(sessionId)
        if (session.payment_status !== 'paid') {
            return res.status(409).json({success: false, message: 'Payment has not been completed.'})
        }

        const purchaseId = session.metadata?.purchaseId
        const purchase = purchaseId ? await Purchase.findById(purchaseId) : null
        if (!purchase || purchase.userId !== userId) {
            return res.status(404).json({success: false, message: 'The completed purchase could not be found for this account.'})
        }

        const [course, user] = await Promise.all([
            Course.findById(purchase.courseId),
            User.findById(userId)
        ])
        if (!course || !user) {
            return res.status(404).json({success: false, message: 'The course or user record could not be found.'})
        }

        await Promise.all([
            Course.updateOne({ _id: course._id }, { $addToSet: { enrolledStudents: userId } }),
            User.updateOne({ _id: userId }, { $addToSet: { enrolledCourses: course._id } }),
            Purchase.updateOne({ _id: purchase._id }, { $set: { status: 'completed' } })
        ])

        res.json({success: true, message: 'Course enrollment confirmed.'})
    } catch (error) {
        console.error('Failed to confirm course purchase:', error.message)
        res.status(500).json({success: false, message: error.message})
    }
}

//Update User Course Progress
export const updateUserCourseProgress = async(req, res) =>{
    try {
        const { courseId, lectureId } = req.body
        const userId = getAuth(req).userId
        if (!courseId || !lectureId) {
            return res.status(400).json({success: false, message: 'Course and lecture are required.'})
        }

        const [user, course] = await Promise.all([
            User.findById(userId),
            Course.findById(courseId)
        ])
        if (!user?.enrolledCourses.some(enrolledCourseId => String(enrolledCourseId) === String(courseId))) {
            return res.status(403).json({success: false, message: 'You must be enrolled to update course progress.'})
        }
        const lectureExists = course?.courseContent.some(chapter =>
            chapter.chapterContent.some(lecture => lecture.lectureID === lectureId)
        )
        if (!lectureExists) {
            return res.status(404).json({success: false, message: 'Lecture was not found in this course.'})
        }

        await CourseProgress.findOneAndUpdate(
            { userId, courseId: String(courseId) },
            { $addToSet: { lectureCompleted: String(lectureId) } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        )
        res.json({success:true, message: "Course Progress Updated"})
    } catch (error) {
        console.error('Failed to update course progress:', error.message)
        res.status(500).json({success:false, message: error.message})
    }
}

//Get User Course Progress
export const getCourseProgress = async(req, res) =>{
    try {
        const { courseId } = req.body
        const userId = getAuth(req).userId
        if (!courseId) {
            return res.status(400).json({success: false, message: 'Course is required.'})
        }

        const user = await User.findById(userId)
        if (!user?.enrolledCourses.some(enrolledCourseId => String(enrolledCourseId) === String(courseId))) {
            return res.status(403).json({success: false, message: 'You must be enrolled to view course progress.'})
        }

        const progressData = await CourseProgress.findOne({ userId, courseId: String(courseId) })
        res.json({success:true, progressData})
    } catch (error) {
        console.error('Failed to get course progress:', error.message)
        res.status(500).json({success:false, message: error.message})
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
    