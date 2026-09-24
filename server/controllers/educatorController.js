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
        const newCourse = await Course.create(parsedCourseData)
        const imageUpload =
        await cloudinary.uploader.upload(imageFile.path)
        newCourse.courseThumbnail = imageUpload.secure_url
        await newCourse.save()

        res.json({ success: true, message: 'Course added successfully!'})

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}
