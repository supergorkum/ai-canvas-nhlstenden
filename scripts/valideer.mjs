// Controleert public/data/canvas.json voordat er gebouwd wordt.
// Breekt de build af bij fouten, zodat een kapotte update nooit live gaat.
import { readFileSync } from 'node:fs'
import { SOORTEN, SPOREN, HERKOMST, RELATIESOORTEN } from '../src/model.js'

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
