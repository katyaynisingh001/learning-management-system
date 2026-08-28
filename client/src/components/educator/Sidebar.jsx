import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext';

const Sidebar = () => {

  const { isEducator } = useContext(AppContext)

  const menuItems = [
    { label: 'Dashboard', path: '/educator', icon: assets.home_icon },
    { label: 'Add Course', path: '/educator/add-course', icon: assets.add_icon },
    { label: 'My Courses', path: '/educator/my-courses', icon: assets.my_course_icon },
    { label: 'Students Enrolled', path: '/educator/students-enrolled', icon: assets.person_tick_icon },
  ];

  return isEducator && (
    <div className='md:w-64 w-16 border-r min-h-screen text-base border py-2 flex flex-col'>
      {menuItems.map((item) => (
          <NavLink
            to={item.path}
            key={item.label}
            end={item.path === '/educator'}
            className={({ isActive }) => `flex items-center md:flex-row flex-col md:justify-start justify-center gap-3 md:px-10 py-3.5 ${isActive ? 'bg-indigo-50 border-r-[6px] border-indigo-500/90' : 'border-r-[6px] border-white hover:border-gray-100/90'}`}>
          <img src={item.icon} alt='' className='h-6 w-6' />
          <p className='md:block hidden text-center'>{item.label}</p>
          </NavLink>
        ))}
        </div>
      )
      }

      export default Sidebar