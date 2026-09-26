import { clerkClient, getAuth } from '@clerk/express';
import Course from '../models/Course.js';
import { v2 as cloudinary } from 'cloudinary';
import { Purchase } from '../models/Purchase.js';

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

//Add New Course
export const addNewCourse = async (req, res) => {
    try {
        const { courseData } = req.body;
        const imageFile = req.file
        const educatorId = req.auth.userId

        if (!imageFile) {
            return res.json({
                success: false,
                message: 'Please upload a course thumbnail.'
            })
        }

        const parsedCourseData = await JSON.parse(courseData)
        parsedCourseData.educator = educatorId
        const imageUpload = await cloudinary.uploader.upload(imageFile.path)
        parsedCourseData.courseThumbnail = imageUpload.secure_url
        const newCourse = await Course.create(parsedCourseData)

        res.status(201).json({ success: true, course: newCourse })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

//Get Educator Courses
export const getEducatorCourses = async(req, res)=>{
    try {
        const educator = req.auth.userId
        const courses = await Course.find({educator})
        res.json({success: true, courses})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

//Get Educator Dashboard Data(Total Earning, Enrolled Students, No. of Courses)

export const educatorDashboardData = async (req, res)=>{
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({educator});
        const totalCourses = courses.map(course => course._id);

        //Calculate total earnings from purchases
        const purchases = await Purchase.find({
            courseId: {$in: courseIds},
            status: 'completed'
        });
        
        const totalEarnings = purchases.reduce((sum, purchase)=> sum + purchase.amount, 0);

        // Collect unique enrolled student IDs with their course titles
const enrolledStudentsData = [];

for (const course of courses) {
    const students = await User.find({
        _id: { $in: course.enrolledStudents }
    }, '-name imageUrl1');

    students.forEach(student => {
        enrolledStudentsData.push({
            courseTitle: course.courseTitle,
            student
        });
    });
}
res.json({
    success: true,
    dashboardData: {
        totalEarnings, enrolledStudentsData, totalCourses
    }
})
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

//Get enrolled students data with purchase data
export const getEnrolledStudentsData = async(req, res) => {
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({educator});
        const courseIds = courses.map(course => course._id);

        const purchases = await Purchase.find({
            courseId: {$in: courseIds},
            status: 'completed'
        }).purchase('userId', 'name imageUrl').populate('courseId', 'courseITitle')

        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userIds,
            courseTitle: purchase.courseId.courseTitle,
            purchaseData: purchase.createdAt
        }));
        res.json({success: true, enrolledStudents})
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}
