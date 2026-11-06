import { useEffect, useState } from 'react'
import { isGeinstalleerd } from '../toestel.js'

// DE INSTALLATIEKAART, naar het voorbeeld van Sepupu. Gemeten, niet geraden:
//   staat er al op      -> korte bevestiging
//   aanbod beschikbaar  -> een knop, geen uitleg (Chrome, Edge, Samsung Internet)
//   nog even wachten    -> het aanbod komt niet op een vast moment
//   iPhone of iPad      -> uitleg voor Safari en voor andere browsers
//   Firefox op Android  -> eigen uitleg; het menu staat boven of onder
//   Safari op de Mac    -> Archief, Voeg toe aan Dock
// Menu-items staan in de taal van de browser; daarom noemen we ook de Engelse naam.
let bewaardAanbod = null
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); bewaardAanbod = e; window.dispatchEvent(new Event('canvas-aanbod')) })
}

export default function InstallKaart({ compact = false }) {
  const [aanbod, setAanbod] = useState(bewaardAanbod)
  const [wachten, setWachten] = useState(!bewaardAanbod)
  const [klaar, setKlaar] = useState(isGeinstalleerd())

  useEffect(() => {
    const vang = () => { setAanbod(bewaardAanbod); setWachten(false) }
    const gedaan = () => setKlaar(true)
    window.addEventListener('canvas-aanbod', vang)
    window.addEventListener('appinstalled', gedaan)
    const t = setTimeout(() => setWachten(false), 2500)
    return () => { window.removeEventListener('canvas-aanbod', vang); window.removeEventListener('appinstalled', gedaan); clearTimeout(t) }
  }, [])

  const ua = navigator.userAgent || ''
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const iosSafari = ios && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
  const firefoxAndroid = /Android/.test(ua) && /Firefox/.test(ua)
  const macSafari = !ios && /Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua)

  async function installeer() {
    if (!aanbod) return
    aanbod.prompt()
    try { const keuze = await aanbod.userChoice; if (keuze?.outcome === 'accepted') setKlaar(true) } catch { /* niets */ }
    bewaardAanbod = null; setAanbod(null)
  }

  let inhoud
  if (klaar) inhoud = <p>Het AI Canvas staat als app op dit toestel. Je opent het voortaan vanaf je beginscherm of uit je apps.</p>
  else if (aanbod) inhoud = <button onClick={installeer} className="btn-roze w-full sm:w-auto">Installeer als app</button>
  else if (wachten) inhoud = <p className="text-gray-400">Even kijken wat deze browser aanbiedt…</p>
  else if (iosSafari) inhoud = <p>Tik onderaan op de <b>deelknop</b> (het vierkantje met de pijl omhoog) en kies <b>Zet op beginscherm</b> (Add to Home Screen). Op een iPhone kan het niet met een knop in de pagina zelf.</p>
  else if (ios) inhoud = <p>Open het menu van je browser en kies <b>Zet op beginscherm</b> (Add to Home Screen). Lukt dat niet, open deze pagina dan in Safari en gebruik daar de deelknop.</p>
  else if (firefoxAndroid) inhoud = <p>Open het menu van Firefox (de drie stipjes, boven of onder, afhankelijk van waar je adresbalk staat) en kies <b>Installeren</b> (Install).</p>
  else if (macSafari) inhoud = <p>Kies in de menubalk <b>Archief</b> en dan <b>Voeg toe aan Dock</b> (File, Add to Dock).</p>
  else inhoud = <p>Deze browser biedt geen installatieknop aan. In Chrome of Edge kan het wel: daar staat dan een knop op deze plek, of een installatie-icoon in de adresbalk.</p>

  return (
    <div className={compact ? '' : 'rounded-3xl bg-nhl-grijs p-5'}>
      <div className="flex items-center gap-3">
        <img src="./icons/ai-canvas-192.png" alt="" className="w-12 h-12 rounded-xl shadow" />
        <div>
          <div className="font-bold text-nhl-blauw">Zet het AI Canvas op je telefoon</div>
          <div className="text-xs text-gray-500">Als eigen app tussen je andere apps, schermvullend, en ook te openen zonder verbinding.</div>
        </div>
      </div>
      <div className="mt-3 text-sm text-gray-700 leading-relaxed">{inhoud}</div>
    </div>
  )
}
