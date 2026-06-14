import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function Navbar() {
  return (
    <header className='mt-2'>
      <nav className='flex items-center justify-between'>
        <div className='flex items-center gap-10'>
            <p className='font-bold text-2xl text-white drop-shadow-md'>
              <Link href={'/'}>
                Kiri.
              </Link>
            </p>
            <div>
              <p className='font-light text-lg text-white drop-shadow-md'>
                <Link href={'/docs'}>
                  Docs
                </Link>
              </p>
            </div>
        </div>
        <div>
            <ul className='flex items-center'>
                <li>
                    {/* light mode */}
                </li>
                <li>
                    <Link href={'https://github.com/anirudhprmar/kiri.git'}>
                      <Image
                      src={'/github.svg'}
                      width={20}
                      height={20}
                      className='w-8 h-8 brightness-0 invert'
                      alt='github logo'
                      />
                    </Link>
                </li>
            </ul>
        </div>
      </nav>
    </header>
  )
}
