import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className='border-t border-white/20 mt-20 py-8'>
      <div className='flex flex-col items-center justify-center space-y-4'>
        <p className='text-white drop-shadow-md text-sm'>
          chat from your terminal.
        </p>
        <div className='flex gap-6 text-sm'>
          <Link href={'https://github.com/anirudhprmar/kiri'} className='text-white drop-shadow-md hover:opacity-80 transition'>
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  )
}
