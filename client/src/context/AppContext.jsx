import { createContext , useState, useEffect } from 'react';
import { dummyCourses } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import humanizeDuration from 'humanize-duration'

export const AppContext = createContext()

export const AppContextProvider = (props) => {

	const currency = import.meta.env.VITE_CURRENCY 
	const navigate = useNavigate()

	const [allCourses, setAllCourses] = useState([])
	const [isEducator, setIsEducator] = useState(true)
	 // Assuming the user is an educator for demonstration purposes. In a real application, this would be determined by the user's role or permissions.

	//Fetch all courses 
	const fetchAllCourses = async () => {
		setAllCourses(dummyCourses)
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

	useEffect(() => {
		fetchAllCourses()
	}, [])

	const value = {
		currency, allCourses, navigate, calculateRating, isEducator, setIsEducator,calculateNoOfLectures, calculateCourseDuration, calculateChapterTime
    }

	return (
		<AppContext.Provider value={value}>
			{props.children}
		</AppContext.Provider>
	)
}
