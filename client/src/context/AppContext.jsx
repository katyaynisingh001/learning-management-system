import { createContext , useState, useEffect } from 'react';
import { dummyCourses } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import humanizeDuration from 'humanize-duration'
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const AppContext = createContext()

export const AppContextProvider = (props) => {

	const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

	const currency = import.meta.env.VITE_CURRENCY 
	const navigate = useNavigate()

	const {getToken, isLoaded, isSignedIn} = useAuth()

	const [allCourses, setAllCourses] = useState([])
	const [isEducator, setIsEducator] = useState(true)
	const [enrolledCourses, setIsEnrolledCourses] = useState([])

	 // Assuming the user is an educator for demonstration purposes. In a real application, this would be determined by the user's role or permissions.

	//Fetch all courses 
	const fetchAllCourses = async () => {
		try{
			const {data} = await axios.get(backendUrl + '/api/course/all');

			if(data.success){
				setAllCourses(data.courses)
			}
			else{
				toast.error(data.message)
			}
		}catch(error){
			toast.error(error.message)
		}
	}

	//Function to calculate average rating of a course
	const calculateRating = (course) => {
		if(course.courseRatings.length === 0){
			return 0;
		} 
		let totalRating = 0;
		course.courseRatings.forEach(rating => {
			totalRating += rating.rating;
		})
		return totalRating / course.courseRatings.length;
	}

	//Function to calculate course Chapter Time
	const calculateChapterTime = (chapter)=>{
		const time = (chapter?.chapterContent ?? []).reduce(
			(total, lecture) => total + (Number(lecture.lectureDuration) || 0),
			0
		)
		return humanizeDuration(time * 60 * 1000, {units: ["h", "m"]})
	}

	//Function to calculate course Duration
	const calculateCourseDuration = (course) => {
		const time = (course?.courseContent ?? []).reduce(
			(total, chapter) => total + (chapter?.chapterContent ?? []).reduce(
				(chapterTotal, lecture) => chapterTotal + (Number(lecture.lectureDuration) || 0),
				0
			),
			0
		)
		return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] })
	}

	//Function calculate to No. of Lectures in the course
	const calculateNoOfLectures = (course)=>{
		let totalLectures =0;
		course.courseContent.forEach(chapter => {
			if(Array.isArray(chapter.chapterContent)){
				totalLectures += chapter.chapterContent.length;
			}
		});
		return totalLectures;
	}

	//Fetch User Enrolled Courses
	const fetchUserEnrolledCourses = async ()=>{
		setIsEnrolledCourses(dummyCourses)
	}

	useEffect(() => {
		fetchAllCourses()
		fetchUserEnrolledCourses()
	}, [])

	useEffect(() => {
		if (!isLoaded) return

		if (!isSignedIn) {
			console.log('No Clerk token: user is not signed in')
			return
		}

		const logToken = async () => {
			try {
				const token = await getToken()
				if (!token) {
					throw new Error('Clerk did not provide a session token.')
				}
				const response = await fetch(`${backendUrl}/api/user/sync`, {
					method: 'POST',
					headers: { Authorization: `Bearer ${token}` },
				})
				const result = await response.json()
				if (!response.ok || !result.success) {
					throw new Error(result.message || 'Unable to sync user with the server.')
				}
			} catch (error) {
				console.error('Unable to sync user with the server:', error)
			}
		}

		logToken()
	}, [backendUrl, getToken, isLoaded, isSignedIn])


	const value = {
		currency, allCourses, navigate, calculateRating, isEducator, setIsEducator,calculateNoOfLectures, calculateCourseDuration, calculateChapterTime, enrolledCourses, fetchUserEnrolledCourses
    }

	return (
		<AppContext.Provider value={value}>
			{props.children}
		</AppContext.Provider>
	)
}
