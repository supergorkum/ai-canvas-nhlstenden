import { useMemo, useState } from 'react'
import { VAKKEN, vakVan } from '../groepen.js'

// A3-plaat 'Treinnetwerk': de grote doorlopende lijnen van de AI-koers als treinlijnen.
// Een lijn is een drager; de stations zijn de onderdelen die er (volgens de bron) mee verbonden zijn.
// Elk station heeft een vaste kolom, gegroepeerd per zone (vak). Zo staat een overstapstation
// op elke lijn op dezelfde plek en lopen er geen lijnen of namen door elkaar.
const LIJNEN = [
  { id: 'ai-koers', naam: 'AI-Koers', kleur: '#E91E8C' },
  { id: 'ai-netwerk', naam: 'AI-Netwerk', kleur: '#1E3A8A' },
  { id: 'eu-ai-act', naam: 'AI Act', kleur: '#BE185D' },
  { id: 'programma-ai', naam: 'Programma AI', kleur: '#7C3AED' },
  { id: 'amce-ai-proeftuin', naam: 'AMCE Proeftuin', kleur: '#0E7490' },
  { id: 'surf', naam: 'SURF', kleur: '#B45309' },
  { id: 'npuls', naam: 'Npuls', kleur: '#0F766E' },
]
const ZONES = ['kern', 'verantwoordelijkheid', 'leren', 'geletterdheid', 'werken', 'werkveld', 'onderzoek', 'extern']

const LINKS = 220, KOLOM = 30, BOVEN = 270, RIJ = 80

export default function Treinnetwerk({ data, onKies }) {
  const [lijnFocus, setLijnFocus] = useState(null)
  const [stationFocus, setStationFocus] = useState(null)

  const net = useMemo(() => {
    const lijnen = LIJNEN.filter(l => data.index[l.id])
    const stops = {} // lijn-id -> Set(station-id)
    lijnen.forEach(l => (stops[l.id] = new Set([l.id])))
    data.relaties.forEach(r => {
      lijnen.forEach(l => {
        if (r.van === l.id && data.index[r.naar]) stops[l.id].add(r.naar)
        if (r.naar === l.id && data.index[r.van]) stops[l.id].add(r.van)
      })
    })
    const lijnenVan = {}
    lijnen.forEach(l => stops[l.id].forEach(s => (lijnenVan[s] ||= []).push(l.id)))
    const stations = Object.keys(lijnenVan).map(id => data.index[id])
    stations.sort((a, b) =>
      ZONES.indexOf(vakVan(a)) - ZONES.indexOf(vakVan(b)) ||
      lijnenVan[b.id].length - lijnenVan[a.id].length ||
      a.naam.localeCompare(b.naam))
    const x = {}; stations.forEach((s, i) => (x[s.id] = LINKS + 30 + i * KOLOM))
    const zones = []
    stations.forEach((s, i) => {
      const z = vakVan(s); const laatste = zones[zones.length - 1]
      if (laatste && laatste.id === z) laatste.tot = i
      else zones.push({ id: z, van: i, tot: i })
    })
    return { lijnen, stops, lijnenVan, stations, x, zones }
  }, [data])

  const { lijnen, stops, lijnenVan, stations, x, zones } = net
  const B = LINKS + 60 + stations.length * KOLOM + 150
  const yLijn = i => BOVEN + 30 + i * RIJ
  const H = yLijn(lijnen.length - 1) + 110
  const kort = (t, n = 34) => (t.length > n ? t.slice(0, n - 1) + '…' : t)
  const lijnAan = id => !lijnFocus || lijnFocus === id
  const stationAan = id => (!stationFocus || stationFocus === id) && (!lijnFocus || stops[lijnFocus].has(id))
  const overstap = stations.filter(s => lijnenVan[s.id].length > 1).length

  return (
    <div className="h-full overflow-y-auto bg-[#E9EDF5] print:bg-white">
      <div className="mx-auto max-w-[1700px] px-3 sm:px-6 py-5 sm:py-8 print:p-0">
        <article className="a3 bg-white rounded-3xl shadow-xl print:shadow-none print:rounded-none p-4 sm:p-6 lg:p-8">
          <header className="flex flex-wrap items-end justify-between gap-3 pb-4 mb-4 border-b-2 border-nhl-blauw">
            <div>
              <div className="section-label">NHL Stenden · AI Canvas · Treinnetwerk</div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-nhl-blauw leading-tight">De rails van de AI-koers</h1>
              <p className="text-sm text-gray-500 mt-1">{lijnen.length} lijnen · {stations.length} stations · {overstap} overstapstations. Een lijn is een drager; de stations zijn de onderdelen die ermee verbonden zijn.</p>
            </div>
          </header>

          <div className="overflow-x-auto -mx-2 px-2">
            <svg viewBox={`0 0 ${B} ${H}`} className="block min-w-[900px] w-full" role="img" aria-label="Treinnetwerk van AI-onderdelen">
              {/* Zones als gekleurde stroken */}
              {zones.map((z, i) => {
                const x0 = LINKS + 30 + z.van * KOLOM - KOLOM / 2, x1 = LINKS + 30 + z.tot * KOLOM + KOLOM / 2
                const v = VAKKEN[z.id]
                return (
                  <g key={z.id + i}>
                    <rect x={x0} y={BOVEN - 6} width={x1 - x0} height={H - BOVEN - 34} fill={v.kleur} opacity={i % 2 ? 0.05 : 0.09} rx="8" />
                    <rect x={x0 + 2} y={H - 34} width={x1 - x0 - 4} height="5" rx="2.5" fill={v.kleur} />
                    <text x={(x0 + x1) / 2} y={H - 10} textAnchor="middle" fontSize="13" fontWeight="800" fill={v.kleur}>{x1 - x0 > 60 ? v.kort : v.kort.slice(0, 5) + '.'}</text>
                  </g>
                )
              })}

              {/* Stationsnamen, schuin boven de kolom */}
              {stations.map(s => (
                <g key={s.id} transform={`translate(${x[s.id] + 4},${BOVEN - 14}) rotate(-55)`} className="cursor-pointer"
                  onClick={() => onKies(s.id)} onMouseEnter={() => setStationFocus(s.id)} onMouseLeave={() => setStationFocus(null)}
                  opacity={stationAan(s.id) ? 1 : 0.25}>
                  <text fontSize="13.5" fontWeight={lijnenVan[s.id].length > 1 ? 700 : 500} fill="#0F1E52">{kort(s.naam)}</text>
                </g>
              ))}

              {/* Verticale overstaplijnen */}
              {stations.filter(s => lijnenVan[s.id].length > 1).map(s => {
                const rijen = lijnen.map((l, i) => (stops[l.id].has(s.id) ? i : -1)).filter(i => i >= 0)
                return <line key={s.id} x1={x[s.id]} x2={x[s.id]} y1={yLijn(rijen[0])} y2={yLijn(rijen[rijen.length - 1])}
                  stroke="#0F1E52" strokeWidth="2" strokeDasharray="2 4" opacity={stationAan(s.id) ? 0.55 : 0.1} />
              })}
              {/* Hulplijn van de naam naar de bovenste stop */}
              {stations.map(s => {
                const eerste = lijnen.findIndex(l => stops[l.id].has(s.id))
                return <line key={s.id} x1={x[s.id]} x2={x[s.id]} y1={BOVEN - 8} y2={yLijn(eerste) - 9} stroke="#CBD5E1" strokeWidth="1" opacity={stationAan(s.id) ? 1 : 0.3} />
              })}

              {/* De lijnen */}
              {lijnen.map((l, i) => {
                const xs = [...stops[l.id]].map(id => x[id])
                const y = yLijn(i), aan = lijnAan(l.id)
                return (
                  <g key={l.id} opacity={aan ? 1 : 0.15} className="transition-opacity">
                    <g className="cursor-pointer" onMouseEnter={() => setLijnFocus(l.id)} onMouseLeave={() => setLijnFocus(null)} onClick={() => onKies(l.id)}>
                      <rect x="6" y={y - 20} width={LINKS - 20} height="40" rx="20" fill={l.kleur} />
                      <text x="26" y={y + 6} fontSize="17" fontWeight="800" fill="#fff">{l.naam}</text>
                      <text x={LINKS - 28} y={y + 5} textAnchor="end" fontSize="12" fill="#fff" opacity="0.85">{stops[l.id].size}</text>
                    </g>
                    <line x1={LINKS - 14} x2={Math.min(...xs)} y1={y} y2={y} stroke={l.kleur} strokeWidth="3" strokeDasharray="1 5" strokeLinecap="round" />
                    <line x1={Math.min(...xs)} x2={Math.max(...xs)} y1={y} y2={y} stroke={l.kleur} strokeWidth="11" strokeLinecap="round" />
                    {[...stops[l.id]].map(id => {
                      const knoop = id === l.id
                      const over = lijnenVan[id].length > 1
                      return (
                        <g key={id} className="cursor-pointer" onClick={() => onKies(id)}
                          onMouseEnter={() => setStationFocus(id)} onMouseLeave={() => setStationFocus(null)} opacity={stationAan(id) ? 1 : 0.35}>
                          {knoop
                            ? <rect x={x[id] - 11} y={y - 11} width="22" height="22" rx="5" fill="#fff" stroke="#0F1E52" strokeWidth="3.5" />
                            : <circle cx={x[id]} cy={y} r={over ? 9 : 6} fill="#fff" stroke={over ? '#0F1E52' : l.kleur} strokeWidth={over ? 3.5 : 2.5} />}
                          <title>{data.index[id].naam}{over ? ` · overstap: ${lijnenVan[id].map(k => LIJNEN.find(q => q.id === k).naam).join(', ')}` : ''}</title>
                        </g>
                      )
                    })}
                  </g>
                )
              })}
            </svg>
          </div>

          <section className="mt-5">
            <h2 className="section-label mb-3">Dienstregeling</h2>
            <ol className="grid sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4 gap-3">
              {lijnen.map(l => {
                const d = data.index[l.id]
                const over = new Set()
                stops[l.id].forEach(st => lijnenVan[st].forEach(k => k !== l.id && over.add(k)))
                const perZone = {}
                stops[l.id].forEach(st => { const z = vakVan(data.index[st]); perZone[z] = (perZone[z] || 0) + 1 })
                return (
                  <li key={l.id}>
                    <button onClick={() => onKies(l.id)} onMouseEnter={() => setLijnFocus(l.id)} onMouseLeave={() => setLijnFocus(null)}
                      className="w-full text-left rounded-2xl border border-gray-200 p-3.5 hover:shadow-md transition-shadow h-full">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-8 rounded-full shrink-0" style={{ background: l.kleur }} />
                        <span className="font-extrabold text-[14px] text-gray-900">Lijn {l.naam}</span>
                        <span className="ml-auto text-xs text-gray-400 tabular-nums">{stops[l.id].size} stations</span>
                      </div>
                      <p className="text-[12px] text-gray-600 mt-1.5 leading-snug line-clamp-2">{d.samenvatting}</p>
                      <p className="text-[11px] text-gray-500 mt-1.5">
                        Rijdt door: {ZONES.filter(z => perZone[z]).map(z => `${VAKKEN[z].kort} (${perZone[z]})`).join(' · ')}
                      </p>
                      {over.size > 0 && <p className="text-[11px] text-gray-500 mt-0.5">Overstap op: {[...over].map(k => LIJNEN.find(q => q.id === k).naam).join(', ')}</p>}
                    </button>
                  </li>
                )
              })}
            </ol>
          </section>

          <footer className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[11px] text-gray-500">
            <span className="flex flex-wrap items-center gap-x-5 gap-y-1">
              <span className="inline-flex items-center gap-1.5"><svg width="16" height="16"><rect x="2" y="2" width="12" height="12" rx="3" fill="#fff" stroke="#0F1E52" strokeWidth="2.5" /></svg> knooppunt (de drager zelf)</span>
              <span className="inline-flex items-center gap-1.5"><svg width="16" height="16"><circle cx="8" cy="8" r="5.5" fill="#fff" stroke="#0F1E52" strokeWidth="2.5" /></svg> overstapstation (op meer lijnen)</span>
              <span className="inline-flex items-center gap-1.5"><svg width="16" height="16"><circle cx="8" cy="8" r="4" fill="#fff" stroke="#E91E8C" strokeWidth="2" /></svg> station</span>
              <span>Wijs een lijn of station aan om het te volgen; klik voor details.</span>
            </span>
            <span className="text-gray-400">Bijgewerkt {data.meta?.bijgewerkt} · ai-canvas-nhlstenden.netlify.app</span>
          </footer>
        </article>
      </div>
    </div>
  )
}
