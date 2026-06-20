import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Hero() {

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
            <Link href={'https://github.com/anirudhprmar/kiri.git'}>
            Github
            </Link>
          </Button>

        </div>
      </div>


    </section>
  )
}
