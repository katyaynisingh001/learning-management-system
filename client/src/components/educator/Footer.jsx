import React from 'react'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <footer className='w-full border-t border-gray-500/20 bg-white px-4 py-4 md:px-8'>
      <div className='flex flex-col-reverse items-center justify-between gap-4 text-left md:flex-row'>
        <div className='flex items-center gap-4'>
          <img className='w-20' src={assets.logo} alt='logo' />
          <div className='hidden h-7 w-px bg-gray-500/60 md:block'></div>
          <p className='text-center text-xs text-gray-500 md:text-sm'>
            Copyright 2026 © Learning Management System. All rights reserved.
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <a href='#' aria-label='Facebook'>
            <img src={assets.facebook_icon} alt='facebook_icon' className='h-5 w-5' />
          </a>
          <a href='#' aria-label='Twitter'>
            <img src={assets.twitter_icon} alt='twitter_icon' className='h-5 w-5' />
          </a>
          <a href='#' aria-label='Instagram'>
            <img src={assets.instagram_icon} alt='instagram_icon' className='h-5 w-5' />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer