import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/educator/Sidebar'
import Navbar from '../../components/educator/Navbar'

const Educator = () => {
  return (
    <div className='text-default min-h-screen bg-white'>
      <Navbar />
      <div className='flex'>
        <Sidebar />
        <div className=' flex-1' >
          {<Outlet />}
        </div>
      </div>
    </div>
  )
}

export default Educator