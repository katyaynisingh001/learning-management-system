import express from 'express'
import { requireAuth } from '@clerk/express'
import { addUserRating, confirmCoursePurchase, getUserData, userEnrolledCourses, purchaseCourse, updateUserCourseProgress, getCourseProgress, syncUser } from '../controllers/userController.js'

const userRouter = express.Router()

userRouter.use(requireAuth())

userRouter.post('/sync', syncUser)
userRouter.get('/data', getUserData)
userRouter.get('/enrolled-courses', userEnrolledCourses)
userRouter.post('/purchase', purchaseCourse)
userRouter.post('/confirm-purchase', confirmCoursePurchase)

userRouter.post('/update-course-progress', updateUserCourseProgress)
userRouter.post('/get-course-progress', getCourseProgress)
userRouter.post('/add-rating', addUserRating)

export default userRouter;