// Controleert public/data/canvas.json voordat er gebouwd wordt.
// Breekt de build af bij fouten, zodat een kapotte update nooit live gaat.
import { readFileSync } from 'node:fs'
import { SOORTEN, SPOREN, HERKOMST, RELATIESOORTEN, BRONSOORT, UITKOMST } from '../src/model.js'

const pad = new URL('../public/data/canvas.json', import.meta.url)
const d = JSON.parse(readFileSync(pad, 'utf8'))
const fouten = [], waarschuwingen = []
const ids = new Set()
for (const e of d.entiteiten) {
  if (!/^[a-z0-9-]+$/.test(e.id)) fouten.push(`ongeldig id: ${e.id}`)
  if (ids.has(e.id)) fouten.push(`dubbel id: ${e.id}`)
  ids.add(e.id)
  if (!e.naam) fouten.push(`${e.id}: naam ontbreekt`)
  if (!SOORTEN[e.soort]) fouten.push(`${e.id}: onbekende soort "${e.soort}"`)
  if (e.spoor && !SPOREN[e.spoor]) fouten.push(`${e.id}: onbekend spoor "${e.spoor}"`)
  if (!HERKOMST[e.herkomst]) fouten.push(`${e.id}: onbekende herkomst "${e.herkomst}"`)
  if (!e.bronLabel) waarschuwingen.push(`${e.id}: geen bronLabel`)
  if (!Array.isArray(e.bronnen) || e.bronnen.length === 0) waarschuwingen.push(`${e.id}: geen bronnen (blok Bronnen)`)
  for (const b of e.bronnen || []) {
    if (!b.label) fouten.push(`${e.id}: bron zonder label`)
    if (!BRONSOORT[b.soort]) fouten.push(`${e.id}: bron "${b.label}" heeft onbekende soort "${b.soort}"`)
    if (!UITKOMST[b.uitkomst]) fouten.push(`${e.id}: bron "${b.label}" heeft onbekende uitkomst "${b.uitkomst}"`)
    if (b.uitkomst === 'bevestigd' && !b.gecontroleerd) fouten.push(`${e.id}: bevestigde bron "${b.label}" zonder datum van controle`)
    if (b.uitkomst === 'bevestigd' && b.soort !== 'intern' && !/^https?:/.test(b.url || '')) fouten.push(`${e.id}: bevestigde bron "${b.label}" zonder link`)
  }
}
for (const r of d.relaties) {
  if (!ids.has(r.van)) fouten.push(`relatie naar onbekend 'van': ${r.van}`)
  if (!ids.has(r.naar)) fouten.push(`relatie naar onbekend 'naar': ${r.naar}`)
  if (!r.soort) fouten.push(`relatie zonder soort: ${r.van} → ${r.naar}`)
  else if (!RELATIESOORTEN.includes(r.soort)) waarschuwingen.push(`vrije relatiesoort: ${r.soort}`)
}
for (const a of d.aanvullingen || []) if (!ids.has(a.op)) fouten.push(`aanvulling op onbekend id: ${a.op}`)

waarschuwingen.forEach(w => console.warn('⚠', w))
if (fouten.length) { fouten.forEach(f => console.error('✖', f)); process.exit(1) }
console.log(`✔ canvas.json in orde: ${d.entiteiten.length} onderdelen, ${d.relaties.length} verbindingen.`)

// Koers: elke koppeling van een mijlpaal moet naar een bestaand onderdeel wijzen.
const koers = JSON.parse(readFileSync(new URL('../public/data/koers.json', import.meta.url), 'utf8'))
const koersFouten = []
koers.koerslijnen.forEach(l => Object.values(l.golven).flat().forEach(s => { if (s.op && !ids.has(s.op)) koersFouten.push(`koers.json: ${l.id} "${s.t}" wijst naar onbekend onderdeel ${s.op}`) }))
if (koersFouten.length) { koersFouten.forEach(f => console.error('✖', f)); process.exit(1) }
console.log(`✔ koers.json in orde: ${koers.koerslijnen.length} lijnen.`)

const act = JSON.parse(readFileSync(new URL('../public/data/aiact.json', import.meta.url), 'utf8'))
const actFouten = act.verplichtingen.flatMap(v => v.bij.filter(id => !ids.has(id)).map(id => `aiact.json: ${v.id} wijst naar onbekend onderdeel ${id}`))
if (actFouten.length) { actFouten.forEach(f => console.error('✖', f)); process.exit(1) }
console.log(`✔ aiact.json in orde: ${act.verplichtingen.length} verplichtingen.`)

// Uit de praktijk: elk verhaal heeft een vindplaats, en geen vindplaats zonder verhaal.
const pr = JSON.parse(readFileSync(new URL('../public/data/praktijk.json', import.meta.url), 'utf8'))
const pb = JSON.parse(readFileSync(new URL('../public/data/praktijk-bronnen.json', import.meta.url), 'utf8'))
const prIds = new Set(pr.items.map(i => i.id)), pbIds = new Set(pb.bronnen.map(b => b.id))
const prFouten = [
  ...pr.items.filter(i => !i.titel || !i.kort || !i.rol || !i.wie).map(i => `praktijk.json: ${i.id} is onvolledig`),
  ...pr.items.filter(i => i.spoor && !SPOREN[i.spoor]).map(i => `praktijk.json: ${i.id} heeft onbekend spoor ${i.spoor}`),
  ...pr.items.filter(i => !/^\d{4}-\d{2}-\d{2}$/.test(i.datum || '')).map(i => `praktijk.json: ${i.id} heeft geen datum (JJJJ-MM-DD)`),
  ...pr.items.filter(i => !pbIds.has(i.id)).map(i => `praktijk.json: ${i.id} heeft geen vindplaats`),
  ...pb.bronnen.filter(b => !prIds.has(b.id)).map(b => `praktijk-bronnen.json: vindplaats bij onbekend verhaal ${b.id}`),
]
if (prIds.size !== pr.items.length) prFouten.push('praktijk.json: dubbel id')
if (prFouten.length) { prFouten.forEach(f => console.error('✖', f)); process.exit(1) }
console.log(`✔ praktijk.json in orde: ${pr.items.length} verhalen, ${pb.bronnen.length} vindplaatsen.`)
