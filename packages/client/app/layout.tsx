import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Snapshift',
  description: 'Easily share images from your phone to your laptop',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
