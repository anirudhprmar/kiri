import React from 'react'
import Image from 'next/image'
import Container from './_components/container'
import Navbar from './_components/navbar'
import Hero from './_components/hero'
import Footer from './_components/footer'

export default function Home() {
  return (
     <div className="relative min-h-screen overflow-hidden bg-primary-foreground">
      <Image
        src="/hero.jpg"
        fill
        priority
        className="object-cover opacity-90 fixed"
        alt="hero image"
      />
      <div className="absolute inset-0 bg-black/50" />

      <Container>
        <Navbar />
        <main>
          <Hero />
          <Footer />
        </main>
      </Container>


    </div>
  )
}
