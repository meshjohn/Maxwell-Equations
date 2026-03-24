import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EM Field Simulator — Maxwell\'s Equations',
  description: 'Interactive 3D electromagnetic field simulator built with Next.js, Three.js, and React Three Fiber.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden bg-[#03050d]">
        {children}
      </body>
    </html>
  )
}
