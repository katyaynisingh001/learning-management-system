import React from 'react'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <footer className='text-left w-full mt-10 md:px-36 bg-gray-900'>
      <div className='flex flex-col md:flex-row items-start px-8 md:px-0 justify-between gap-10 md:gap-32   py-10 border-b border-white/30'>
        <div className='flex flex-col md:items-start items-center w-full'>
          <img src={assets.logo_dark} alt="logo" />
          <p className='mt-6 text-center md:text-left text-sm text-white/80'>Learn at your own pace with expert-led courses, interactive content, and practical resources designed to help you build the skills you need for your personal and professional growth.</p>
        </div>
        <div className='flex flex-col md:items-start items-center w-full'>
          <h2 className='font-semibold text-white mb-5'>Company</h2>
          <ul className='flex md:flex-col w-full justify-between text-sm text-white/80 md:space-y-2'>
            <li><a href="#">Home</a></li>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Contact us</a></li>
            <li><a href="#">Privacy Policy</a></li>
          </ul>
        </div>
        <div className='hidden md:flex flex-col  items-start w-full'>
          <h2 className='font-semibold text-white mb-5'>Subscribe to our newsletter</h2>
          <p className='text-sm text-white/80'>Stay updated with our latest courses, resources, and special offers. Subscribe to our newsletter and never miss out on valuable learning opportunities.</p>
          <div className='flex items-center gap-2 pt-4'>
            <input type="email" placeholder='Enter your email'  className='border border-gray-500/30 bg-gray-800 text-gray-500 placeholder-gray-500 outline-none w-64 h-9 rounded px-2 text-sm' />
            <button className='bg-blue-600 w-24 h-9 text-white rounded'>Subscribe</button>
          </div>
        </div>
      </div>
      <p className='text-center text-xs md:text-sm text-white/60 py-4'>Copyright 2026 © Learning Management System. All rights reserved.</p>
    </footer>
  )
}

export default Footer