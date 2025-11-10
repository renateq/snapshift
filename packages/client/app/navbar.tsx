'use client'

import Image from 'next/image'
import { TermsOfUse } from './terms-of-use'
import { Github } from 'lucide-react'
import { useState } from 'react'
import { useClientContext } from '@/context/client-context'
import ExitModal from './exit-modal'

export function Navbar() {
  const { status, sharedFiles } = useClientContext()
  const [showExitModal, setShowExitModal] = useState(false)

  function handleClick() {
    if (sharedFiles.length > 0) {
      setShowExitModal(true)
    } else {
      reloadPage()
    }
  }

  function reloadPage() {
    window.location.reload()
  }

  return (
    <>
      <nav className="flex h-20 items-center justify-between px-[10%]">
        <button
          onClick={handleClick}
          disabled={status === 'idle'}
          className="cursor-pointer disabled:cursor-default"
        >
          <h1 className="flex items-center gap-0.5 text-base sm:text-xl">
            <span>Snapshift</span>
            <Image src={'/logo.png'} height={20} width={20} alt="Logo" />
          </h1>
        </button>
        <div className="flex items-center gap-12">
          <TermsOfUse />
          <a
            href="https://github.com/renateq/snapshift"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github />
          </a>
        </div>
      </nav>

      {showExitModal && (
        <ExitModal confirm={reloadPage} close={() => setShowExitModal(false)} />
      )}
    </>
  )
}
