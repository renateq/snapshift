'use client'

import { Lock, WandSparkles, Zap } from 'lucide-react'
import { QRCode } from './qr-code'

export function Hero() {
  return (
    <>
      <Labels />
      <h2 className="mt-4 text-center text-2xl sm:text-4xl">
        Move photos from phone
        <br />
        to laptop — instantly.
      </h2>
      <div className="my-16 flex justify-center sm:my-28">
        <QRCode />
      </div>
      <p className="mx-auto max-w-sm text-center text-sm leading-5 sm:text-base sm:leading-8">
        Snapshift makes image transfers effortless. No accounts, no installs —
        just pure simplicity.
      </p>
    </>
  )
}

function Labels() {
  const iconSize = 20
  const labels = [
    {
      icon: <Zap size={iconSize} />,
      text: 'Lightning-fast',
    },
    {
      icon: <Lock size={iconSize} />,
      text: 'Privacy-first',
    },
    {
      icon: <WandSparkles size={iconSize} />,
      text: 'No setup needed',
    },
  ]

  return (
    <div className="mt-8 flex items-center justify-center gap-5 text-xs opacity-70 sm:mt-10 sm:gap-12 sm:text-base">
      {labels.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          {label.icon}
          <span>{label.text}</span>
        </div>
      ))}
    </div>
  )
}
