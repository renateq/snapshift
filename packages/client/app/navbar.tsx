import Image from 'next/image'
import { TermsOfUse } from './terms-of-use'
import { Github } from 'lucide-react'

export function Navbar() {
  return (
    <nav className="flex h-20 items-center justify-between px-[10%]">
      <h1 className="flex items-center gap-0.5 text-xl">
        <span>Snapshift</span>
        <Image src={'/logo.png'} height={20} width={20} alt="Logo" />
      </h1>
      <div className="flex items-center gap-12">
        <TermsOfUse />
        <a href="https://github.com/renateq/snapshift" target="_blank">
          <Github />
        </a>
      </div>
    </nav>
  )
}
