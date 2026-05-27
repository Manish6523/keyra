"use client"

import { useState, useCallback, useEffect, useRef } from "react"

export function useClipboard(autoClearMs = 30000) {
  const [copied, setCopied] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval>>()

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
      } catch (err) {
        console.error("Clipboard write failed", err)
        return
      }
      setCopied(true)
      setCountdown(Math.ceil(autoClearMs / 1000))

      if (timerRef.current) clearInterval(timerRef.current)

      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setCopied(false)
            navigator.clipboard.writeText('').catch(() => {})
            return 0
          }
          return prev - 1
        })
      }, 1000)
    },
    [autoClearMs]
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return { copy, copied, countdown }
}
