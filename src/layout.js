// Bepaalt de plek van elk onderdeel op de landkaart.
// Opzet: in het midden het plein 'Koers & Kaders' (beleid en spoor-overstijgende
// onderdelen), daaromheen zes eilanden (de sporen), en op de buitenste baan de
// externe samenwerkingen, zo dicht mogelijk bij het eiland waarmee ze het meest verbonden zijn.
import { SPOREN } from './model.js'

const STAP = 31
const BREED = 1.3 // de kaart is breder dan hoog: horizontaal wat meer ruimte
const GOUDEN_HOEK = Math.PI * (3 - Math.sqrt(5))

function spiraal(n, stap) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const r = stap * Math.sqrt(i + 0.6)
    const t = i * GOUDEN_HOEK
    pts.push({ x: Math.cos(t) * r, y: Math.sin(t) * r })
  }
  return pts
}

const graden = rad => ((rad % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)

export function berekenLayout(entiteiten, relaties) {
  const sporenIds = Object.keys(SPOREN)
  const pos = {}
  const groepen = { kern: [] }
  sporenIds.forEach(s => (groepen[s] = []))
  const externen = []

  // Graad (aantal verbindingen) bepalen voor sortering: veel verbonden = dichter bij het hart van het eiland.
  const graad = {}
  relaties.forEach(r => { graad[r.van] = (graad[r.van] || 0) + 1; graad[r.naar] = (graad[r.naar] || 0) + 1 })

  for (const e of entiteiten) {
    if (e.soort === 'extern') externen.push(e)
    else if (!e.spoor || !SPOREN[e.spoor]) groepen.kern.push(e)
    else groepen[e.spoor].push(e)
  }

  const straalVoor = n => Math.max(80, STAP * Math.sqrt(n + 0.6) + 40)
  const kernStraal = Math.max(95, straalVoor(groepen.kern.length))
  const maxEiland = Math.max(...sporenIds.map(s => straalVoor(groepen[s].length)))
  // Ring zo groot dat eilanden elkaar en het plein niet raken.
  const R = Math.max(kernStraal + maxEiland + 70, maxEiland * 2 + 50)
  const RX = R * BREED, RY = R
  const ERY = R + maxEiland + 130, ERX = ERY * BREED
  const MIDDEN = { x: ERX + 170, y: ERY + 90 }
  const wereld = { b: MIDDEN.x * 2, h: MIDDEN.y * 2 }

  const eilanden = {}
  sporenIds.forEach((s, i) => {
    const hoek = -Math.PI / 2 + (i * 2 * Math.PI) / sporenIds.length + Math.PI / 6
    const leden = groepen[s].sort((a, b) => (graad[b.id] || 0) - (graad[a.id] || 0))
    const straal = straalVoor(leden.length)
    const c = { x: MIDDEN.x + Math.cos(hoek) * RX, y: MIDDEN.y + Math.sin(hoek) * RY }
    eilanden[s] = { id: s, ...SPOREN[s], x: c.x, y: c.y, r: straal, hoek, aantal: leden.length }
    spiraal(leden.length, STAP).forEach((p, j) => (pos[leden[j].id] = { x: c.x + p.x, y: c.y + p.y }))
  })

  const kern = groepen.kern.sort((a, b) => (graad[b.id] || 0) - (graad[a.id] || 0))
  spiraal(kern.length, STAP).forEach((p, j) => (pos[kern[j].id] = { x: MIDDEN.x + p.x, y: MIDDEN.y + p.y }))
  const plein = { x: MIDDEN.x, y: MIDDEN.y, r: kernStraal, aantal: kern.length }

  // Externe partners: hoek = gemiddelde richting van waarmee ze verbonden zijn.
  const buren = {}
  relaties.forEach(r => {
    ;(buren[r.van] ||= []).push(r.naar)
    ;(buren[r.naar] ||= []).push(r.van)
  })
  const metHoek = externen.map((e, i) => {
    let sx = 0, sy = 0
    for (const b of buren[e.id] || []) {
      const p = pos[b]
      if (p) { sx += p.x - MIDDEN.x; sy += p.y - MIDDEN.y }
    }
    const hoek = Math.hypot(sx, sy) > 1 ? Math.atan2(sy / RY, sx / RX) : (i / Math.max(1, externen.length)) * 2 * Math.PI
    return { e, hoek: graden(hoek) }
  }).sort((a, b) => a.hoek - b.hoek)

  // Minimale tussenruimte op de buitenbaan afdwingen.
  const minGat = Math.min((2 * Math.PI) / Math.max(1, metHoek.length), 0.2)
  for (let ronde = 0; ronde < 80; ronde++) {
    for (let i = 0; i < metHoek.length; i++) {
      const a = metHoek[i], b = metHoek[(i + 1) % metHoek.length]
      const d = graden(b.hoek - a.hoek)
      if (metHoek.length > 1 && d < minGat) {
        const duw = (minGat - d) / 2
        a.hoek = graden(a.hoek - duw)
        b.hoek = graden(b.hoek + duw)
      }
    }
  }
  metHoek.forEach(({ e, hoek }, i) => {
    const golf = i % 2 ? 1 : 0.93 // lichte afwisseling zodat labels minder botsen
    pos[e.id] = { x: MIDDEN.x + Math.cos(hoek) * ERX * golf, y: MIDDEN.y + Math.sin(hoek) * ERY * golf }
  })

  return { pos, eilanden, plein, baan: { x: MIDDEN.x, y: MIDDEN.y, rx: ERX, ry: ERY }, graad, wereld }
}
