'use client'

import { useEffect, useRef } from 'react'

interface AnimateOnScrollProps {
  children: React.ReactNode
  animation?: string
  delay?: number
  threshold?: number
  className?: string
}

export default function AnimateOnScroll({
  children,
  animation = 'anim-in',
  delay = 0,
  threshold = 0.1,
  className = ''
}: AnimateOnScrollProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add animation when entering view
            setTimeout(() => {
              entry.target.classList.remove('opacity-0')
              entry.target.classList.add(animation)
            }, delay)
          } else {
            // Remove animation when leaving view to allow re-triggering
            entry.target.classList.add('opacity-0')
            entry.target.classList.remove(animation)
          }
        })
      },
      { threshold }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [animation, delay, threshold])

  return (
    <div ref={elementRef} className={`opacity-0 ${className}`}>
      {children}
    </div>
  )
}