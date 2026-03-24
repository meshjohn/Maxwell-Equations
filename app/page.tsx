'use client'

import dynamic from 'next/dynamic'

// Three.js requires the browser — disable SSR entirely
const Scene = dynamic(() => import('@/components/Scene'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-[#03050d]">
      <div className="text-center">
        <div
          className="text-[rgba(74,158,255,0.6)] text-xs tracking-widest mb-3 font-mono"
          style={{ letterSpacing: '0.15em' }}
        >
          INITIALIZING
        </div>
        <div className="text-[rgba(200,220,255,0.4)] text-xs font-mono">
          Loading EM field engine...
        </div>
      </div>
    </div>
  ),
})

export default function Home() {
  return <Scene />
}
