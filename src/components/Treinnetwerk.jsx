import { useEffect, useMemo, useState } from 'react'
import { SPOREN } from '../model.js'

// A3-plaat 'Treinnetwerk': de realisatie van de AI-Koers (v0.55d) als spoorkaart.
// Elke koerslijn is een treinlijn die van 2026 naar 2030 rijdt, door de drie golven van de koers.
// De stations zijn de mijlpalen uit de tijdlijn van de koers; het eindstation is de indicator voor 2030.
// Een overstapstation is een mijlpaal die bij hetzelfde onderdeel hoort als een mijlpaal op een andere lijn.
const KLEUR_SANDBOX = '#475569'
const LINKS = 300, GOLF = 430, BESTEMMING = 330, BOVEN = 120, RIJ = 138

function breek(t, n = 22) {
  const woorden = t.split(' '); const regels = ['']
  woorden.forEach(w => {
    const r = regels[regels.length - 1]
    if ((r + ' ' + w).trim().length > n && r) regels.push(w)
    else regels[regels.length - 1] = (r + ' ' + w).trim()
  })
  return regels
}

export default function Treinnetwerk({ data, onKies, onSpoor }) {
  const [koers, setKoers] = useState(null)
  const [focus, setFocus] = useState(null) // canvas-id van een overstap
  const [lijnFocus, setLijnFocus] = useState(null)
  useEffect(() => { fetch('./data/koers.json', { cache: 'no-cache' }).then(r => r.json()).then(setKoers).catch(() => setKoers(false)) }, [])

  const net = useMemo(() => {
    if (!koers) return null
    const golfX = {}; koers.golven.forEach((g, i) => (golfX[g.id] = LINKS + i * GOLF))
    const lijnen = koers.koerslijnen.map((l, i) => {
      const kleur = SPOREN[l.id]?.kleur || KLEUR_SANDBOX
      const y = BOVEN + 70 + i * RIJ
      const stations = []
      koers.golven.forEach(g => {
        const lijst = l.golven[g.id] || []
        lijst.forEach((s, k) => stations.push({ ...s, golf: g.id, x: golfX[g.id] + ((k + 1) * GOLF) / (lijst.length + 1), y, boven: k % 2 === 0 }))
      })
      return { ...l, kleur, y, stations }
    })
    const lijnenPerOnderdeel = {}
    lijnen.forEach(l => l.stations.forEach(s => s.op && (lijnenPerOnderdeel[s.op] ||= new Set()).add(l.id)))
    return { lijnen, lijnenPerOnderdeel }
  }, [koers])

  if (koers === false) return <p className="p-10 text-center text-gray-500">De gegevens van de koers konden niet worden geladen.</p>
  if (!net) return <div className="p-10 text-center text-gray-400">Treinnetwerk wordt geladen…</div>

  const { lijnen, lijnenPerOnderdeel } = net
  const B = LINKS + GOLF * 3 + BESTEMMING + 20
  const H = BOVEN + 70 + (lijnen.length - 1) * RIJ + 90
  const isOverstap = s => s.op && lijnenPerOnderdeel[s.op]?.size > 1
  const aanLijn = id => !lijnFocus || lijnFocus === id
  const aanStation = s => (!focus || s.op === focus)
  const overstappen = Object.entries(lijnenPerOnderdeel).filter(([, v]) => v.size > 1)
  const telPerSpoor = id => data.entiteiten.filter(e => e.spoor === id).length

  return (
    <div className="h-full overflow-y-auto bg-[#E9EDF5] print:bg-white">
      <div className="mx-auto max-w-[1760px] px-3 sm:px-6 py-5 sm:py-8 print:p-0">
        <article className="a3 trein-a3 bg-white rounded-3xl shadow-xl print:shadow-none print:rounded-none p-4 sm:p-6 lg:p-8">
          <header className="flex flex-wrap items-end justify-between gap-4 pb-4 mb-4 border-b-2 border-nhl-blauw">
            <div className="min-w-0">
              <div className="section-label">NHL Stenden · AI Canvas · Treinnetwerk</div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-nhl-blauw leading-tight">De rails van de AI-Koers, 2026 tot 2030</h1>
              <p className="text-sm text-gray-500 mt-1">Zes koerslijnen en de sandbox rijden in drie golven naar hun bestemming in 2030. Bron: {koers.bron.titel}, tijdlijn en koerslijnen.</p>
            </div>
          </header>

          <section className="mb-4 grid sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4 gap-3 text-[12.5px] text-gray-600" aria-label="Zo lees je deze kaart">
            {[
              ['1', 'Elke lijn is een koerslijn', 'Van links (2026) naar rechts (2030). Het lijnbord noemt de kernambitie.'],
              ['2', 'Stations zijn mijlpalen', 'Letterlijk uit de tijdlijn van de koers, per golf: funderen, uitbouwen, verankeren.'],
              ['3', 'Het eindstation is de bestemming', 'De indicator die de koerslijn in 2030 wil halen.'],
              ['4', 'Overstappen', `Een omrande stip hoort bij hetzelfde onderdeel als een stip op een andere lijn, zoals het AI-Netwerk. Wijs hem aan om de verbinding te zien.`],
            ].map(([n, t, x]) => (
              <div key={n} className="flex gap-2.5">
                <span className="w-6 h-6 rounded-full bg-nhl-blauw text-white grid place-items-center text-xs font-bold shrink-0">{n}</span>
                <div><b className="text-gray-800">{t}.</b> {x}</div>
              </div>
            ))}
          </section>

          <p className="sm:hidden text-xs font-semibold text-nhl-roze mb-2">Veeg opzij om de lijnen te volgen →</p>
          <div className="overflow-x-auto -mx-2 px-2 overscroll-x-contain">
            <svg viewBox={`0 0 ${B} ${H}`} className="block min-w-[1000px] w-full" role="img" aria-label="Treinnetwerk van de AI-Koers">
              {/* Golven als zones */}
              {koers.golven.map((g, i) => {
                const x0 = LINKS + i * GOLF
                return (
                  <g key={g.id}>
                    <rect x={x0 + 4} y={BOVEN - 8} width={GOLF - 8} height={H - BOVEN} rx="14" fill="#1E3A8A" opacity={[0.035, 0.06, 0.09][i]} />
                    <text x={x0 + GOLF / 2} y={BOVEN - 40} textAnchor="middle" fontSize="13" fontWeight="700" fill="#E91E8C" letterSpacing="3">{g.jaren}</text>
                    <text x={x0 + GOLF / 2} y={BOVEN - 16} textAnchor="middle" fontSize="20" fontWeight="800" fill="#1E3A8A">{g.titel.toUpperCase()}</text>
                  </g>
                )
              })}
              <text x={LINKS + GOLF * 3 + BESTEMMING / 2} y={BOVEN - 40} textAnchor="middle" fontSize="13" fontWeight="700" fill="#E91E8C" letterSpacing="3">2030</text>
              <text x={LINKS + GOLF * 3 + BESTEMMING / 2} y={BOVEN - 16} textAnchor="middle" fontSize="20" fontWeight="800" fill="#1E3A8A">BESTEMMING</text>

              {/* Overstapverbindingen: alleen zichtbaar bij aanwijzen */}
              {focus && lijnen.flatMap(l => l.stations.filter(s => s.op === focus).map(s => ({ ...s, l }))).map((s, i, alle) =>
                i === 0 ? null : (
                  <path key={i} d={`M${alle[i - 1].x},${alle[i - 1].y} C${alle[i - 1].x + 60},${(alle[i - 1].y + s.y) / 2} ${s.x - 60},${(alle[i - 1].y + s.y) / 2} ${s.x},${s.y}`}
                    fill="none" stroke="#0F1E52" strokeWidth="3" strokeDasharray="6 6" opacity="0.7" />
                ))}

              {lijnen.map(l => {
                const eind = LINKS + GOLF * 3 + 14
                const aan = aanLijn(l.id)
                return (
                  <g key={l.id} opacity={aan ? 1 : 0.15} className="transition-opacity">
                    {/* lijnbord */}
                    <g className="cursor-pointer" onMouseEnter={() => setLijnFocus(l.id)} onMouseLeave={() => setLijnFocus(null)} onClick={() => onSpoor?.(l.id === 'sandbox' ? 'kern' : l.id)}>
                      <rect x="6" y={l.y - 34} width={LINKS - 26} height="68" rx="16" fill={l.kleur} />
                      <text x="22" y={l.y - 10} fontSize="12" fontWeight="700" fill="#fff" opacity="0.8">{l.id === 'sandbox' ? 'VEILIG EXPERIMENTEREN' : `KOERSLIJN ${l.nr}`}</text>
                      <text x="22" y={l.y + 10} fontSize={l.titel.length > 18 ? 15.5 : 18} fontWeight="800" fill="#fff">{l.titel}</text>
                      {breek(l.kernambitie, 38).slice(0, 1).map((r, i) => (
                        <text key={i} x="22" y={l.y + 27} fontSize="10.5" fill="#fff" opacity="0.85">{r}{breek(l.kernambitie, 38).length > 1 ? '…' : ''}</text>
                      ))}
                    </g>
                    {/* rails */}
                    <line x1={LINKS - 20} x2={eind} y1={l.y} y2={l.y} stroke={l.kleur} strokeWidth="12" strokeLinecap="round" strokeDasharray={l.id === 'sandbox' ? '22 10' : undefined} />
                    {/* stations */}
                    {l.stations.map((s, k) => {
                      const over = isOverstap(s)
                      const regels = breek(s.t, 21)
                      const dim = !aanStation(s)
                      const ty = s.boven ? s.y - 24 - (regels.length - 1) * 15 : s.y + 34
                      return (
                        <g key={k} opacity={dim ? 0.25 : 1} className={s.op ? 'cursor-pointer' : ''}
                          onMouseEnter={() => over && setFocus(s.op)} onMouseLeave={() => setFocus(null)}
                          onClick={() => s.op && onKies(s.op)}>
                          <circle cx={s.x} cy={s.y} r={over ? 12 : 8} fill="#fff" stroke={over ? '#0F1E52' : l.kleur} strokeWidth={over ? 5 : 4} />
                          {regels.map((r, i) => (
                            <text key={i} x={s.x} y={ty + i * 15} textAnchor="middle" fontSize="13" fontWeight={over ? 800 : 600}
                              fill="#0F1E52" stroke="#fff" strokeWidth="4" paintOrder="stroke" strokeLinejoin="round">{r}</text>
                          ))}
                          {s.op && <title>{`${s.t} · onderdeel op het canvas: ${data.index[s.op]?.naam || s.op}`}</title>}
                        </g>
                      )
                    })}
                    {/* eindstation */}
                    <g>
                      <rect x={eind + 18} y={l.y - 44} width={BESTEMMING - 30} height="88" rx="14" fill="#fff" stroke={l.kleur} strokeWidth="3" />
                      <rect x={eind - 10} y={l.y - 14} width="28" height="28" rx="6" fill={l.kleur} />
                      {breek(l.bestemming, 44).slice(0, 5).map((r, i, a) => (
                        <text key={i} x={eind + 32} y={l.y - (a.length - 1) * 7.5 + i * 15 + 4} fontSize="11.5" fill="#0F1E52">{r}</text>
                      ))}
                    </g>
                  </g>
                )
              })}
            </svg>
          </div>

          <section className="mt-6 print:break-before-page print:mt-0">
            <h2 className="section-label mb-3">Dienstregeling <span className="hidden print:inline text-gray-400">· De rails van de AI-Koers, 2026 tot 2030</span></h2>
            <ol className="grid sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4 gap-3">
              {lijnen.map(l => (
                <li key={l.id}>
                  <button onMouseEnter={() => setLijnFocus(l.id)} onMouseLeave={() => setLijnFocus(null)} onClick={() => onSpoor?.(l.id === 'sandbox' ? 'kern' : l.id)}
                    className="w-full h-full text-left rounded-2xl border border-gray-200 p-3.5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-8 rounded-full shrink-0" style={{ background: l.kleur }} />
                      <span className="font-extrabold text-[14px] text-gray-900">{l.id === 'sandbox' ? 'Sandbox' : `Koerslijn ${l.nr} · ${l.titel}`}</span>
                    </div>
                    <p className="text-[12.5px] text-gray-800 mt-1.5 italic">“{l.kernambitie}”</p>
                    <p className="text-[11.5px] text-gray-500 mt-1.5 leading-snug"><b className="text-gray-600">Komt voort uit:</b> {l.komtVoortUit}</p>
                    <p className="text-[11.5px] text-gray-500 mt-1"><b className="text-gray-600">Vakeigenaar:</b> {l.vakeigenaren}</p>
                    {l.id !== 'sandbox' && <p className="text-[11.5px] mt-1 font-semibold" style={{ color: l.kleur }}>{telPerSpoor(l.id)} onderdelen op het canvas →</p>}
                  </button>
                </li>
              ))}
              <li className="rounded-2xl bg-nhl-grijs p-3.5 text-[11.5px] text-gray-600">
                <div className="font-extrabold text-[14px] text-gray-900 mb-1.5">Overstapstations</div>
                <ul className="space-y-1">
                  {overstappen.map(([id, s]) => (
                    <li key={id}><button onClick={() => onKies(id)} onMouseEnter={() => setFocus(id)} onMouseLeave={() => setFocus(null)} className="text-left hover:underline">
                      <b>{data.index[id]?.naam}</b> · {s.size} lijnen</button></li>
                  ))}
                </ul>
                <p className="mt-2">Route van elk experiment: {koers.route.join(' → ')}.</p>
              </li>
            </ol>
          </section>

          <footer className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap justify-between gap-2 text-[11px] text-gray-400">
            <span>Bron: {koers.bron.titel}, hoofdstukken {koers.bron.hoofdstukken}. De tijdlijn is richtinggevend, niet lineair, en wordt jaarlijks herijkt.</span>
            <span>ai-canvas-nhlstenden.netlify.app</span>
          </footer>
        </article>
      </div>
    </div>
  )
}
