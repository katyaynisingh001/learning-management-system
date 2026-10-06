import { useContext, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Line } from 'rc-progress'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AppContext } from '../../context/AppContext'
import Footer from '../../components/student/Footer'

const MyEnrollments = () => {
  const {
    enrolledCourses,
    calculateCourseDuration,
    navigate,
    userData,
    fetchUserEnrolledCourses,
    backendUrl,
    getToken,
    calculateNoOfLectures
  } = useContext(AppContext)
  const [progressArray, setProgressArray] = useState([])
  const [searchParams, setSearchParams] = useSearchParams()
  const handledSessionId = useRef(null)
  const checkoutSessionId = searchParams.get('session_id')

  useEffect(() => {
    if (userData && !checkoutSessionId && !handledSessionId.current) {
      fetchUserEnrolledCourses()
    }
  }, [userData, checkoutSessionId, fetchUserEnrolledCourses])

  useEffect(() => {
    if (!checkoutSessionId || !userData || handledSessionId.current === checkoutSessionId) return

    handledSessionId.current = checkoutSessionId
    const confirmPurchase = async () => {
      try {
        const token = await getToken()
        const { data } = await axios.post(
          `${backendUrl}/api/user/confirm-purchase`,
          { sessionId: checkoutSessionId },
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (!data.success) {
          throw new Error(data.message || 'Unable to confirm course enrollment.')
        }

        toast.success(data.message)
        await fetchUserEnrolledCourses()
      } catch (error) {
        handledSessionId.current = null
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : error instanceof Error ? error.message : 'Unable to confirm course enrollment.'
        toast.error(message)
      } finally {
        const params = new URLSearchParams(searchParams)
        params.delete('session_id')
        setSearchParams(params, { replace: true })
      }
    }

    confirmPurchase()
  }, [checkoutSessionId, userData, backendUrl, getToken, fetchUserEnrolledCourses, searchParams, setSearchParams])

  useEffect(() => {
    let cancelled = false

    const loadProgress = async () => {
      if (enrolledCourses.length === 0) {
        setProgressArray([])
        return
      }

      try {
        const token = await getToken()
        const progress = await Promise.all(enrolledCourses.map(async course => {
          const { data } = await axios.post(
            `${backendUrl}/api/user/get-course-progress`,
            { courseId: course._id },
            { headers: { Authorization: `Bearer ${token}` } }
          )

          if (!data.success) {
            throw new Error(data.message || `Unable to load progress for ${course.courseTitle}.`)
          }

          const totalLectures = calculateNoOfLectures(course)
          const lectureCompleted = data.progressData?.lectureCompleted?.length || 0
          return { totalLectures, lectureCompleted }
        }))

        if (!cancelled) setProgressArray(progress)
      } catch (error) {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : error instanceof Error ? error.message : 'Unable to load course progress.'
        toast.error(message)
        if (!cancelled) setProgressArray([])
      }
    }

    loadProgress()
    return () => { cancelled = true }
  }, [enrolledCourses, backendUrl, getToken, calculateNoOfLectures])

  return (
    <>
      <div className='md:px-36 px-8 pt-10'>
        <h1 className='text-2xl font-semibold'>My Enrollments</h1>
        {enrolledCourses.length === 0 ? (
          <p className='mt-6 text-gray-500'>You are not enrolled in any courses yet.</p>
        ) : (
          <table className='md:table-auto table-fixed w-full overflow-hidden border mt-10'>
            <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden'>
              <tr>
                <th className='px-4 py-3 font-semibold truncate'>Course</th>
                <th className='px-4 py-3 font-semibold truncate'>Duration</th>
                <th className='px-4 py-3 font-semibold truncate'>Completed</th>
                <th className='px-4 py-3 font-semibold truncate'>Status</th>
              </tr>
            </thead>
            <tbody className='text-gray-700'>
              {enrolledCourses.map((course, index) => {
                const progress = progressArray[index]
                const percent = progress?.totalLectures
                  ? (progress.lectureCompleted * 100) / progress.totalLectures
                  : 0
                const isComplete = progress?.totalLectures > 0 &&
                  progress.lectureCompleted >= progress.totalLectures

                return (
                  <tr key={course._id} className='border-b border-gray-500/20'>
                    <td className='md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3'>
                      <img src={course.courseThumbnail} alt='' className='w-14 sm:w-24 md:w-28' />
                      <div className='flex-1'>
                        <p className='mb-1 max-sm:text-sm'>{course.courseTitle}</p>
                        <Line
                          strokeWidth={2}
                          percent={percent}
                          className='bg-gray-300 rounded-full'
                          aria-label={`${Math.round(percent)}% complete`}
                        />
                      </div>
                    </td>
                    <td className='px-4 py-3 max-sm:hidden'>
                      {calculateCourseDuration(course)}
                    </td>
                    <td className='px-4 py-3 max-sm:hidden'>
                      {progress
                        ? `${progress.lectureCompleted} / ${progress.totalLectures}`
                        : '—'} <span>Lectures</span>
                    </td>
                    <td className='px-4 py-3 max-sm:text-right'>
                      <button
                        className='px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-600 max-sm:text-xs text-white'
                        onClick={() => navigate('/player/' + course._id)}
                      >
                        {progress?.totalLectures === 0 ? 'No lessons' : isComplete ? 'Completed' : 'On Going'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      <Footer />
    </>
  )
}

export default MyEnrollments
