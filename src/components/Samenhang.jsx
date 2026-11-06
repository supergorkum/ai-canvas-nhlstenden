import { useMemo, useState } from 'react'
import { SOORTEN, omgekeerd } from '../model.js'
import { VAKKEN, vakVan, graadMap } from '../groepen.js'

// A3-plaat 'Samenhang': links een koordendiagram (hoe hangen de vakken samen),
// rechts de dragers (de onderdelen waar het meeste aan vastzit).
const VOLGORDE = ['kern', 'verantwoordelijkheid', 'leren', 'geletterdheid', 'werken', 'werkveld', 'onderzoek', 'extern']
const AANTAL_DRAGERS = 10

export default function Samenhang({ data, onKies }) {
  const [focus, setFocus] = useState(null) // vak-id
  const [dragerFocus, setDragerFocus] = useState(null)

  const { matrix, binnen, totaal, dragers, burenVan } = useMemo(() => {
    const m = {}; const bin = {}; const tot = {}
    VOLGORDE.forEach(a => { m[a] = {}; bin[a] = 0; tot[a] = 0; VOLGORDE.forEach(b => (m[a][b] = 0)) })
    const buren = {}
    data.relaties.forEach(r => {
      const A = data.index[r.van], B = data.index[r.naar]; if (!A || !B) return
      const a = vakVan(A), b = vakVan(B)
      tot[a]++; tot[b]++
      if (a === b) bin[a]++
      else { m[a][b]++; m[b][a]++ }
      ;(buren[r.van] ||= []).push([r.soort, B]); (buren[r.naar] ||= []).push([omgekeerd(r.soort), A])
    })
    const g = graadMap(data.relaties)
    const dr = Object.keys(g).sort((x, y) => g[y] - g[x]).slice(0, AANTAL_DRAGERS).map(id => data.index[id]).filter(Boolean)
    return { matrix: m, binnen: bin, totaal: tot, dragers: dr, burenVan: buren }
  }, [data])

  // Vakken die een drager raakt: die lichten op in het diagram.
  const dragerVakken = useMemo(() => {
    if (!dragerFocus) return null
    const s = new Set([vakVan(data.index[dragerFocus])])
    ;(burenVan[dragerFocus] || []).forEach(([, b]) => s.add(vakVan(b)))
    return s
  }, [dragerFocus, burenVan, data])

  // --- Koordendiagram ---
  const R = 250, DIK = 26, GAT = 0.035, C = 330
  const som = VOLGORDE.reduce((s, v) => s + totaal[v], 0)
  const beschikbaar = 2 * Math.PI - GAT * VOLGORDE.length
  const bogen = {}
  let hoek = -Math.PI / 2
  VOLGORDE.forEach(v => {
    const breedte = (totaal[v] / som) * beschikbaar
    bogen[v] = { start: hoek, eind: hoek + breedte, cursor: hoek }
    hoek += breedte + GAT
  })
  const per = beschikbaar / som // radialen per verbinding-eindpunt
  // Volgorde binnen een boog: eerst 'binnen het vak', dan de partners in vaste volgorde.
  const segmenten = {}
  VOLGORDE.forEach(v => {
    const b = bogen[v]; let c = b.start
    segmenten[v] = { binnen: [c, c + binnen[v] * 2 * per] }; c += binnen[v] * 2 * per
    VOLGORDE.forEach(w => { if (w !== v && matrix[v][w]) { segmenten[v][w] = [c, c + matrix[v][w] * per]; c += matrix[v][w] * per } })
  })
  const pt = (a, r) => [C + Math.cos(a) * r, C + Math.sin(a) * r]
  const boogPad = (a0, a1, r0, r1) => {
    const groot = a1 - a0 > Math.PI ? 1 : 0
    const [x0, y0] = pt(a0, r1), [x1, y1] = pt(a1, r1), [x2, y2] = pt(a1, r0), [x3, y3] = pt(a0, r0)
    return `M${x0},${y0} A${r1},${r1} 0 ${groot} 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 ${groot} 0 ${x3},${y3} Z`
  }
  const lint = ([a0, a1], [b0, b1]) => {
    const r = R - 4
    const [ax0, ay0] = pt(a0, r), [ax1, ay1] = pt(a1, r), [bx0, by0] = pt(b0, r), [bx1, by1] = pt(b1, r)
    return `M${ax0},${ay0} A${r},${r} 0 0 1 ${ax1},${ay1} Q${C},${C} ${bx0},${by0} A${r},${r} 0 0 1 ${bx1},${by1} Q${C},${C} ${ax0},${ay0} Z`
  }
  const linten = []
  VOLGORDE.forEach((v, i) => VOLGORDE.slice(i + 1).forEach(w => { if (matrix[v][w]) linten.push([v, w, matrix[v][w]]) }))
  const actief = (v, w) => {
    if (focus) return v === focus || w === focus
    if (dragerVakken) return dragerVakken.has(v) && dragerVakken.has(w)
    return true
  }
  const iets = focus || dragerVakken

  const sterkste = linten.slice().sort((a, b) => b[2] - a[2]).slice(0, 3)

  return (
    <div className="h-full overflow-y-auto bg-[#E9EDF5] print:bg-white">
      <div className="mx-auto max-w-[1500px] px-3 sm:px-6 py-5 sm:py-8 print:p-0">
        <article className="a3 samenhang-a3 bg-white rounded-3xl shadow-xl print:shadow-none print:rounded-none p-4 sm:p-6 lg:p-8">
          <header className="flex flex-wrap items-end justify-between gap-3 pb-4 mb-5 border-b-2 border-nhl-blauw">
            <div>
              <div className="section-label">NHL Stenden · AI Canvas · Samenhang</div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-nhl-blauw leading-tight">Hoe hangt AI in onze organisatie samen?</h1>
              <p className="text-sm text-gray-500 mt-1">Links: verbindingen tussen de sporen. Rechts: de {AANTAL_DRAGERS} onderdelen waar het meeste aan vastzit.</p>
            </div>
          </header>

          <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
            <figure className="min-w-0">
              <svg viewBox="-120 -6 900 676" className="w-full max-w-[680px] mx-auto block" role="img" aria-label="Koordendiagram van verbindingen tussen de sporen">
                {/* linten */}
                <g>
                  {linten.map(([v, w, n]) => {
                    const aan = actief(v, w)
                    return (
                      <path key={v + w} d={lint(segmenten[v][w], segmenten[w][v])}
                        fill={`url(#grad-${v}-${w})`} stroke="#fff" strokeWidth="0.6"
                        opacity={aan ? (iets ? 0.9 : 0.62) : 0.07} className="transition-opacity duration-200">
                        <title>{`${VAKKEN[v].titel} ↔ ${VAKKEN[w].titel}: ${n} verbindingen`}</title>
                      </path>
                    )
                  })}
                </g>
                <defs>
                  {linten.map(([v, w]) => {
                    const [ax, ay] = pt((segmenten[v][w][0] + segmenten[v][w][1]) / 2, R)
                    const [bx, by] = pt((segmenten[w][v][0] + segmenten[w][v][1]) / 2, R)
                    return (
                      <linearGradient key={v + w} id={`grad-${v}-${w}`} gradientUnits="userSpaceOnUse" x1={ax} y1={ay} x2={bx} y2={by}>
                        <stop offset="0%" stopColor={VAKKEN[v].kleur} /><stop offset="100%" stopColor={VAKKEN[w].kleur} />
                      </linearGradient>
                    )
                  })}
                </defs>
                {/* bogen */}
                {VOLGORDE.map(v => {
                  const b = bogen[v], mid = (b.start + b.eind) / 2
                  const [lx, ly] = pt(mid, R + DIK + 22)
                  const rechts = Math.cos(mid) >= 0
                  const dim = iets && !(focus === v || dragerVakken?.has(v))
                  return (
                    <g key={v} className="cursor-pointer" onMouseEnter={() => setFocus(v)} onMouseLeave={() => setFocus(null)} opacity={dim ? 0.35 : 1}>
                      <path d={boogPad(b.start, b.eind, R, R + DIK)} fill={VAKKEN[v].kleur} />
                      {binnen[v] > 0 && <path d={boogPad(segmenten[v].binnen[0], segmenten[v].binnen[1], R - 10, R - 2)} fill={VAKKEN[v].kleur} opacity="0.35" />}
                      <text x={lx} y={ly - 6} textAnchor={Math.abs(Math.cos(mid)) < 0.25 ? 'middle' : rechts ? 'start' : 'end'} fontSize="15" fontWeight="800" fill={VAKKEN[v].kleur}>{VAKKEN[v].kort}</text>
                      <text x={lx} y={ly + 12} textAnchor={Math.abs(Math.cos(mid)) < 0.25 ? 'middle' : rechts ? 'start' : 'end'} fontSize="12" fill="#64748B">{totaal[v]} verbindingen</text>
                    </g>
                  )
                })}
              </svg>
              <figcaption className="mt-3 text-xs text-gray-500 grid sm:grid-cols-2 gap-x-6 gap-y-1">
                <span><b className="text-gray-700">Dikte van een band</b> = aantal verbindingen tussen twee vakken.</span>
                <span><b className="text-gray-700">Lichte rand binnen een boog</b> = verbindingen binnen hetzelfde vak.</span>
                <span className="sm:col-span-2">Sterkste banden: {sterkste.map(([v, w, n]) => `${VAKKEN[v].kort} ↔ ${VAKKEN[w].kort} (${n})`).join(' · ')}.</span>
              </figcaption>
            </figure>

            <section className="min-w-0">
              <h2 className="section-label mb-3">De dragers</h2>
              <ol className="grid sm:grid-cols-2 gap-3">
                {dragers.map((e, i) => {
                  const v = VAKKEN[vakVan(e)]
                  const lijst = burenVan[e.id] || []
                  return (
                    <li key={e.id}>
                      <button onClick={() => onKies(e.id)} onMouseEnter={() => setDragerFocus(e.id)} onMouseLeave={() => setDragerFocus(null)}
                        className={`w-full text-left rounded-2xl border p-3.5 transition-all hover:shadow-md ${dragerFocus === e.id ? 'border-nhl-roze' : 'border-gray-200'}`}>
                        <div className="flex items-start gap-2.5">
                          <span className="w-7 h-7 rounded-full grid place-items-center text-xs font-extrabold text-white shrink-0" style={{ background: v.kleur }}>{i + 1}</span>
                          <div className="min-w-0">
                            <div className="font-bold text-[14px] leading-snug text-gray-900">{e.naam}</div>
                            <div className="text-[11px] mt-0.5" style={{ color: v.kleur }}>{SOORTEN[e.soort]?.label} · {v.kort} · <b>{lijst.length} verbindingen</b></div>
                          </div>
                        </div>
                        <p className="text-[11.5px] text-gray-500 mt-2 leading-snug line-clamp-3">
                          {lijst.slice(0, 7).map(([s, b]) => b.naam).join(' · ')}{lijst.length > 7 ? ` · +${lijst.length - 7}` : ''}
                        </p>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </section>
          </div>

          <footer className="mt-6 pt-3 border-t border-gray-100 flex flex-wrap justify-between gap-2 text-[11px] text-gray-400">
            <span>Bijgewerkt {data.meta?.bijgewerkt} · {data.entiteiten.length} onderdelen, {data.relaties.length} verbindingen · elk onderdeel heeft een bron</span>
            <span>ai-canvas-nhlstenden.netlify.app</span>
          </footer>
        </article>
      </div>
    </div>
  )
}
