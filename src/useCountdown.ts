import { useEffect, useState } from 'react'

export function useCountdown(target: string) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])
  const diffSeconds = Math.max(0, Math.floor((new Date(target).getTime() - now) / 1000))
  const days = Math.floor(diffSeconds / 86400)
  const hours = Math.floor((diffSeconds % 86400) / 3600)
  const minutes = Math.floor((diffSeconds % 3600) / 60)
  const seconds = diffSeconds % 60
  return { days, hours, minutes, seconds, isPast: diffSeconds <= 0 }
}

/** Converts a YouTube watch/share link into its embeddable form; other providers (Zoom/Teams/Meet) generally can't be iframed. */
export function toEmbeddableStreamUrl(url: string): string | null {
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1`
  if (url.includes('youtube.com/embed/')) return url
  return null
}
