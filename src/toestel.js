import { useEffect, useState } from 'react'

// Welke weergave: telefoon of de gewone site. Dezelfde meting als bij Sepupu:
// de kortste vensterzijde plus een grove aanwijzer (de vinger), want de
// user-agent liegt. Een smal venster op een computer krijgt ook de telefoonweergave.
const meet = () => {
  if (typeof window === 'undefined') return false
  const kort = Math.min(window.innerWidth, window.innerHeight)
  const grof = window.matchMedia?.('(pointer: coarse)').matches
  return (grof && kort <= 600) || window.innerWidth < 640
}

export function useTelefoon() {
  const [telefoon, setTelefoon] = useState(meet)
  useEffect(() => {
    const opnieuw = () => setTelefoon(meet())
    window.addEventListener('resize', opnieuw)
    return () => window.removeEventListener('resize', opnieuw)
  }, [])
  return telefoon
}

export const isGeinstalleerd = () => {
  try {
    return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
  } catch { return false }
}
