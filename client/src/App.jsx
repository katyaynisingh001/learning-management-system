import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AddCourse from './pages/educator/AddCourse'
import Dashboard from './pages/educator/Dashboard'
import Educator from './pages/educator/Educator'
import MyCourses from './pages/educator/MyCourses'
import StudentsEnrolled from './pages/educator/StudentsEnrolled'
import CourseDetails from './pages/student/CourseDetails'
import CoursesList from './pages/student/CoursesList'
import Home from './pages/student/Home'
import MyEnrollments from './pages/student/MyEnrollments'
import Player from './pages/student/Player'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/course-list' element={<CoursesList />} />
      <Route path='/course-list/:input' element={<CoursesList />} />
      <Route path='/course/:id' element={<CourseDetails />} />
      <Route path='/player/:courseId' element={<Player />} />
      <Route path='/my-enrollments' element={<MyEnrollments />} />
      <Route path='/educator' element={<Educator />} />
      <Route path='/educator/dashboard' element={<Dashboard />} />
      <Route path='/educator/add-course' element={<AddCourse />} />
      <Route path='/educator/my-courses' element={<MyCourses />} />
      <Route path='/educator/students-enrolled' element={<StudentsEnrolled />} />
    </Routes>
  )
}

export default App