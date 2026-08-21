import React from 'react'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'

const Navbar = () => {

  const isCourseListPage = location.pathname.includes('/course-list/');

  const{openSignIn} = useClerk()
  const{user} = useUser()

  return (
    <div className={`flex items-center justify-between px-4 py-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 ${isCourseListPage ? 'bg-white' : 'bg-cyan-100/70'}`}>
      
      <img src={assets.logo} alt='logo' className='w-28 lg:w-32 cursor-pointer' />

      <div className='hidden items-center gap-5 md:flex text-gray-500'>
           <div className='flex items-center gap-5'> 
            { user && 
            <>
                  <button>Become an Educator</button>
                |<Link to='/my-enrollments'>My Enrollments</Link>              
            </>
            }
           </div>

           {user ? <UserButton /> :
             <button onClick={()=> openSignIn()} className='rounded-full bg-blue-600 px-5 py-2 text-white'>Create Account</button>}

      </div>

      {/* For Phone Screen */}
      <div className='flex items-center gap-2 md:hidden sm:gap-5 text-gray-500'>
        <div className='flex items-center gap-1 sm:gap-2 max-sm:text-xs'>
          { user && 
            <>
                  <button>Become an Educator</button>
                |<Link to='/my-enrollments'>My Enrollments</Link>              
            </>
            }
        </div>
        {
          user ? <UserButton />
          : <button onClick={()=> openSignIn()}><img src="{assets.user_icon}" alt="" /></button>
        }   
      </div>

      <button className='rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white md:hidden'>Menu</button>
    </div>
  )
}

export default Navbar