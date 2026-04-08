import { useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

import type { Size } from '../types/game'

interface UseElementSizeResult<T extends HTMLElement> {
  ref: RefObject<T | null>
  size: Size
}

export function useElementSize<T extends HTMLElement>(): UseElementSizeResult<T> {
  const ref = useRef<T | null>(null)
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const element = ref.current

    if (!element) {
      return
    }

    const updateSize = (nextWidth: number, nextHeight: number) => {
      setSize((currentSize) => {
        if (
          currentSize.width === nextWidth &&
          currentSize.height === nextHeight
        ) {
          return currentSize
        }

        return { width: nextWidth, height: nextHeight }
      })
    }

    const measure = () => {
      const bounds = element.getBoundingClientRect()
      updateSize(Math.round(bounds.width), Math.round(bounds.height))
    }

    measure()

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]

      if (!entry) {
        return
      }

      updateSize(
        Math.round(entry.contentRect.width),
        Math.round(entry.contentRect.height),
      )
    })

    observer.observe(element)
    window.addEventListener('orientationchange', measure)

    return () => {
      observer.disconnect()
      window.removeEventListener('orientationchange', measure)
    }
  }, [])

  return { ref, size }
}
