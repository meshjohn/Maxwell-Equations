import { useRef, useEffect, useState, useCallback } from 'react'

interface UseFieldClockReturn {
  time: number
  isPaused: boolean
  pause: () => void
  resume: () => void
  reset: () => void
}

export function useFieldClock(speed: number): UseFieldClockReturn {
  const [time, setTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const tRef      = useRef(0)
  const rafRef    = useRef(0)
  const lastRef   = useRef(0)
  const pausedRef = useRef(false)
  const speedRef  = useRef(speed)

  // Keep speedRef in sync without restarting the loop
  useEffect(() => { speedRef.current = speed }, [speed])

  useEffect(() => {
    const tick = (ts: number) => {
      if (!pausedRef.current) {
        const dt = Math.min((ts - lastRef.current) / 1000, 0.05)
        tRef.current += dt * speedRef.current
        setTime(tRef.current)
      }
      lastRef.current = ts
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const pause  = useCallback(() => { pausedRef.current = true;  setIsPaused(true)  }, [])
  const resume = useCallback(() => { pausedRef.current = false; setIsPaused(false) }, [])
  const reset  = useCallback(() => { tRef.current = 0; setTime(0) }, [])

  return { time, isPaused, pause, resume, reset }
}
