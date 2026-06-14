"use client"
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import {Check, ChevronRight, Copy} from 'lucide-react'
import Link from 'next/link'

export default function Hero() {
  const [isCopied,setIsCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const handleClick = async() => {
    try {
      await navigator.clipboard.writeText("npm install kiri");
      setIsCopied(prev => !prev);
      setTimeout(() => {
        setIsCopied(prev => !prev)
      }, 700);
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <section>
      <div className='flex flex-col items-center justify-center space-y-6 min-h-screen max-w-6xl mx-auto'>
        <div className='flex flex-col space-y-4'>
          <h1 className='font-semibold text-6xl text-white drop-shadow-lg'>chat in your <span className='bg-primary  shadow-2xs'>terminal.</span></h1>
          <p className='text-white drop-shadow-md'>peer to peer terminal based chat app.</p>
        </div>

        <div className='flex items-center justify-center gap-2'>
          <Button
          variant={'default'}
          size={'lg'}
          className='h-10 cursor-pointer'
          >
            <Link href={'/docs'}>
            Read Docs
            </Link>
          </Button>

          <Button 
          variant={'secondary'}
          size={'lg'}
          className="flex items-center gap-2 rounded-md  px-4 py-2 font-mono text-sm cursor-pointer h-10"
          onMouseEnter={handleMouseEnter} 
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          >
            <span className='relative h-4 w-4'>
            <ChevronRight className={`${!isCopied && !isHovered ? "absolute text-muted-foreground transition-all duration-200": "opacity-0"  }`}/>
            <Copy className={` ${!isCopied && isHovered  ? "absolute text-muted-foreground transition-all duration-200 top-0": "opacity-0" }`} />
            <Check className={` ${isCopied ? "absolute text-muted-foreground transition-all duration-200 top-0": "opacity-0" }`}/> 
            </span>
            <code>npm install kiri</code>
        </Button>
        </div>
      </div>


    </section>
  )
}
