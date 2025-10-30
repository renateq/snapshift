'use client'

import { useClientContext } from '@/context/client-context'
import { DisplayFiles } from './display-files'
import { Navbar } from './navbar'
import { Hero } from './hero'

export default function Home() {
  const { status } = useClientContext()

  return (
    <>
      <Navbar />
      <main className="px-[10%] pb-20">
        <div className={status !== 'idle' ? 'hidden' : ''}>
          <Hero />
        </div>
        <div className={status === 'idle' ? 'hidden' : ''}>
          <DisplayFiles />
        </div>
      </main>
    </>
  )
}
