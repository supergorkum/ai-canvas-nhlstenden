// Indeling van onderdelen in de vakken van het canvas, dezelfde logica als de landkaart.
import { SPOREN } from './model.js'

export const VAKKEN = {
  ...Object.fromEntries(Object.entries(SPOREN).map(([id, s]) => [id, { id, ...s }])),
  kern:   { id: 'kern',   titel: 'Koers & Kaders', kort: 'Koers & Kaders', icon: '🧭', kleur: '#E91E8C' },
  extern: { id: 'extern', titel: 'Extern', kort: 'Extern', icon: '🌐', kleur: '#B45309' },
}

export function vakVan(e) {
  if (e.soort === 'extern') return 'extern'
  if (!e.spoor || !SPOREN[e.spoor]) return 'kern'
  return e.spoor
}

export function graadMap(relaties) {
  const g = {}
  relaties.forEach(r => { g[r.van] = (g[r.van] || 0) + 1; g[r.naar] = (g[r.naar] || 0) + 1 })
  return g
}

// Onderdelen per vak, het meest verbonden eerst (dat zijn de dragende onderdelen).
export function perVak(data) {
  const g = graadMap(data.relaties)
  const uit = Object.fromEntries(Object.keys(VAKKEN).map(k => [k, []]))
  data.entiteiten.forEach(e => uit[vakVan(e)].push(e))
  Object.values(uit).forEach(l => l.sort((a, b) => (g[b.id] || 0) - (g[a.id] || 0) || a.naam.localeCompare(b.naam)))
  return { uit, graad: g }
}
