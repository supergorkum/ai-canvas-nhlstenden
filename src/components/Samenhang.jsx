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
  const [band, setBand] = useState(null) // [v, w] of null = sterkste band

  const { matrix, binnen, totaal, dragers, burenVan, perBand } = useMemo(() => {
    const m = {}; const bin = {}; const tot = {}
    VOLGORDE.forEach(a => { m[a] = {}; bin[a] = 0; tot[a] = 0; VOLGORDE.forEach(b => (m[a][b] = 0)) })
    const buren = {}
    const perBand = {}
    data.relaties.forEach(r => {
      const A = data.index[r.van], B = data.index[r.naar]; if (!A || !B) return
      const a = vakVan(A), b = vakVan(B)
      const sleutel = [a, b].sort((x, y) => VOLGORDE.indexOf(x) - VOLGORDE.indexOf(y)).join('|')
      ;(perBand[sleutel] ||= []).push({ r, A, B })
      tot[a]++; tot[b]++
      if (a === b) bin[a]++
      else { m[a][b]++; m[b][a]++ }
      ;(buren[r.van] ||= []).push([r.soort, B]); (buren[r.naar] ||= []).push([omgekeerd(r.soort), A])
    })
    const g = graadMap(data.relaties)
    const dr = Object.keys(g).sort((x, y) => g[y] - g[x]).slice(0, AANTAL_DRAGERS).map(id => data.index[id]).filter(Boolean)
    return { matrix: m, binnen: bin, totaal: tot, dragers: dr, burenVan: buren, perBand }
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
  const gekozenBand = band || (sterkste[0] ? [sterkste[0][0], sterkste[0][1]] : null)
  const bandRelaties = gekozenBand ? (perBand[gekozenBand.join('|')] || []) : []
  const isGekozen = (v, w) => gekozenBand && gekozenBand[0] === v && gekozenBand[1] === w
  // Dragers als genummerde stippen op hun eigen boog.
  const stippen = []
  VOLGORDE.forEach(v => {
    const hier = dragers.map((e, i) => ({ e, i })).filter(({ e }) => vakVan(e) === v)
    hier.forEach(({ e, i }, k) => {
      const b = bogen[v]
      const a = b.start + ((k + 1) * (b.eind - b.start)) / (hier.length + 1)
      stippen.push({ e, i, a })
    })
  })

  return (
    <div className="h-full overflow-y-auto bg-[#E9EDF5] print:bg-white">
      <div className="mx-auto max-w-[1500px] px-3 sm:px-6 py-5 sm:py-8 print:p-0">
        <article className="a3 samenhang-a3 bg-white rounded-3xl shadow-xl print:shadow-none print:rounded-none p-4 sm:p-6 lg:p-8">
          <header className="flex flex-wrap items-end justify-between gap-3 pb-4 mb-5 border-b-2 border-nhl-blauw">
            <div>
              <div className="section-label">NHL Stenden · AI Canvas · Samenhang</div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-nhl-blauw leading-tight">Hoe hangt AI in onze organisatie samen?</h1>
              <p className="text-sm text-gray-500 mt-1">De zes koerslijnen van de AI-Koers (v0.55d), Koers & Kaders en Extern: hoe ze met elkaar verbonden zijn, en wie die verbinding draagt.</p>
            </div>
          </header>

          <section className="mb-5 grid sm:grid-cols-3 print:grid-cols-3 gap-3 text-[12.5px] text-gray-600" aria-label="Zo lees je deze plaat">
            {[
              ['1', 'De cirkel', 'Elke gekleurde boog is een koerslijn uit de AI-Koers, plus Koers & Kaders en Extern. Hoe langer de boog, hoe meer verbindingen.'],
              ['2', 'De banden', 'Een band laat zien hoeveel onderdelen van twee koerslijnen met elkaar verbonden zijn. Klik een band: onder de cirkel zie je welke verbindingen het zijn.'],
              ['3', 'De dragers', 'De tien onderdelen met de meeste verbindingen. Hun nummer staat op hun eigen boog. Wijs er een aan: de koerslijnen die hij raakt lichten op.'],
            ].map(([n, t, x]) => (
              <div key={n} className="flex gap-2.5">
                <span className="w-6 h-6 rounded-full bg-nhl-blauw text-white grid place-items-center text-xs font-bold shrink-0">{n}</span>
                <div><b className="text-gray-800">{t}.</b> {x}</div>
              </div>
            ))}
          </section>

          <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
            <figure className="min-w-0">
              <svg viewBox="-120 -6 900 676" className="w-full max-w-[680px] mx-auto block" role="img" aria-label="Koordendiagram van verbindingen tussen de koerslijnen">
                {/* linten */}
                <g>
                  {linten.map(([v, w, n]) => {
                    const aan = actief(v, w)
                    return (
                      <path key={v + w} d={lint(segmenten[v][w], segmenten[w][v])}
                        fill={`url(#grad-${v}-${w})`} stroke={isGekozen(v, w) ? '#0F1E52' : '#fff'} strokeWidth={isGekozen(v, w) ? 2.2 : 0.6}
                        opacity={aan ? (iets ? 0.9 : isGekozen(v, w) ? 0.92 : 0.55) : 0.07} className="transition-opacity duration-200 cursor-pointer"
                        onClick={() => setBand([v, w])}>
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
                  const [lx, ly] = pt(mid, R + DIK + 22 + (Math.sin(mid) > 0.6 ? 22 : 0))
                  const rechts = Math.cos(mid) >= 0
                  const dim = iets && !(focus === v || dragerVakken?.has(v))
                  return (
                    <g key={v} className="cursor-pointer" onMouseEnter={() => setFocus(v)} onMouseLeave={() => setFocus(null)} opacity={dim ? 0.35 : 1}>
                      <path d={boogPad(b.start, b.eind, R, R + DIK)} fill={VAKKEN[v].kleur} />
                      {binnen[v] > 0 && <path d={boogPad(segmenten[v].binnen[0], segmenten[v].binnen[1], R - 10, R - 2)} fill={VAKKEN[v].kleur} opacity="0.35" />}
                      {VAKKEN[v].nr && <text x={lx} y={ly - 24} textAnchor={Math.abs(Math.cos(mid)) < 0.25 ? 'middle' : rechts ? 'start' : 'end'} fontSize="10.5" fontWeight="700" letterSpacing="1.5" fill="#94A3B8">KOERSLIJN {VAKKEN[v].nr}</text>}
                      <text x={lx} y={ly - 6} textAnchor={Math.abs(Math.cos(mid)) < 0.25 ? 'middle' : rechts ? 'start' : 'end'} fontSize="15" fontWeight="800" fill={VAKKEN[v].kleur}>{VAKKEN[v].kort}</text>
                      <text x={lx} y={ly + 12} textAnchor={Math.abs(Math.cos(mid)) < 0.25 ? 'middle' : rechts ? 'start' : 'end'} fontSize="12" fill="#64748B">{totaal[v]} verbindingen</text>
                    </g>
                  )
                })}
                {stippen.map(({ e, i, a }) => {
                  const [x, y] = pt(a, R + DIK / 2)
                  const aan = !dragerFocus || dragerFocus === e.id
                  return (
                    <g key={e.id} className="cursor-pointer" onMouseEnter={() => setDragerFocus(e.id)} onMouseLeave={() => setDragerFocus(null)} onClick={() => onKies(e.id)} opacity={aan ? 1 : 0.4}>
                      <circle cx={x} cy={y} r={dragerFocus === e.id ? 13 : 11} fill="#fff" stroke="#0F1E52" strokeWidth="2.5" />
                      <text x={x} y={y + 4} textAnchor="middle" fontSize="11.5" fontWeight="800" fill="#0F1E52">{i + 1}</text>
                      <title>{`${i + 1}. ${e.naam}`}</title>
                    </g>
                  )
                })}
              </svg>
              <figcaption className="mt-3 text-xs text-gray-500">
                <b className="text-gray-700">Dikte van een band</b> = aantal verbindingen tussen twee koerslijnen. <b className="text-gray-700">Lichte rand binnen een boog</b> = verbindingen binnen dezelfde koerslijn. <b className="text-gray-700">Genummerde stip</b> = drager (zie rechts).
              </figcaption>
              {gekozenBand && (
                <div className="mt-4 rounded-2xl border border-gray-200 p-4">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                    <h3 className="font-extrabold text-[15px] text-gray-900">
                      <span style={{ color: VAKKEN[gekozenBand[0]].kleur }}>{VAKKEN[gekozenBand[0]].kort}</span>
                      <span className="text-gray-400"> ↔ </span>
                      <span style={{ color: VAKKEN[gekozenBand[1]].kleur }}>{VAKKEN[gekozenBand[1]].kort}</span>
                    </h3>
                    <span className="text-xs text-gray-500">{bandRelaties.length} verbindingen{!band && ' · de sterkste band; klik een andere band in de cirkel'}</span>
                  </div>
                  <ul className="grid sm:grid-cols-2 print:grid-cols-2 gap-x-5 gap-y-1.5 text-[12px] leading-snug max-h-72 overflow-y-auto print:max-h-none">
                    {bandRelaties.map(({ r, A, B }, i) => (
                      <li key={i} className="min-w-0">
                        <button onClick={() => onKies(A.id)} className="font-semibold text-gray-800 hover:text-nhl-roze">{A.naam}</button>
                        <span className="text-gray-400"> {r.soort} </span>
                        <button onClick={() => onKies(B.id)} className="font-semibold text-gray-800 hover:text-nhl-roze">{B.naam}</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
