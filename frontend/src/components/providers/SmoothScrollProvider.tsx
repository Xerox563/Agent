'use client'

import Lenis from 'lenis'
import { useEffect } from 'react'

export function SmoothScrollProvider() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true })

    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }

    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return null
}
