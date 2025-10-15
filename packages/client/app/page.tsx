'use client'

import { useClientContext } from '@/context/client-context'
import { QRCode } from './qr-code'
import { DisplayFiles } from './display-files'

export default function Home() {
  const { status } = useClientContext()

  return (
    <>
      <main className="min-h-[calc(100dvh-5rem)] px-[10%]">
        <div className={status !== 'idle' ? 'hidden' : ''}>
          <QRCode />
        </div>
        <div className={status === 'idle' ? 'hidden' : ''}>
          <DisplayFiles />
        </div>
      </main>
    </>
  )
}
