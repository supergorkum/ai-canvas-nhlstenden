import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { SOORTEN, SPOREN } from '../model.js'
import { berekenLayout } from '../layout.js'

// Interactieve landkaart: slepen om te verschuiven, scrollen of knijpen om te zoomen,
// klikken op een onderdeel voor details. Verbindingen lichten op bij aanwijzen.
export default function Landkaart({ data, zichtbaar, geselecteerd, onKies, zoekTreffers }) {
  const { entiteiten, relaties } = data
  const layout = useMemo(() => berekenLayout(entiteiten, relaties), [entiteiten, relaties])
  const { pos, eilanden, plein, baan, graad, wereld: WERELD } = layout
  const [hover, setHover] = useState(null)
  const [view, setView] = useState({ x: 0, y: 0, k: 1 })
  const svgRef = useRef(null)
  const sleep = useRef(null)
  const pointers = useRef(new Map())

  const focus = hover || geselecteerd
  const buren = useMemo(() => {
    if (!focus) return null
    const s = new Set([focus])
    relaties.forEach(r => { if (r.van === focus) s.add(r.naar); if (r.naar === focus) s.add(r.van) })
    return s
  }, [focus, relaties])

  // --- Pan & zoom ---------------------------------------------------------
  const naarWereld = useCallback((cx, cy) => {
    const svg = svgRef.current
    const pt = svg.createSVGPoint(); pt.x = cx; pt.y = cy
    const p = pt.matrixTransform(svg.getScreenCTM().inverse())
    return { x: (p.x - view.x) / view.k, y: (p.y - view.y) / view.k, sx: p.x, sy: p.y }
  }, [view])

  const zoomRond = useCallback((sx, sy, factor) => {
    setView(v => {
      const k = Math.min(5, Math.max(0.6, v.k * factor))
      const f = k / v.k
      return { k, x: sx - (sx - v.x) * f, y: sy - (sy - v.y) * f }
    })
  }, [])

  useEffect(() => {
    const svg = svgRef.current
    const wiel = e => {
      e.preventDefault()
      const p = naarWereld(e.clientX, e.clientY)
      zoomRond(p.sx, p.sy, e.deltaY < 0 ? 1.12 : 1 / 1.12)
    }
    svg.addEventListener('wheel', wiel, { passive: false })
    return () => svg.removeEventListener('wheel', wiel)
  }, [naarWereld, zoomRond])

  const down = e => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 1) sleep.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, bewogen: false }
  }
  const move = e => {
    if (!pointers.current.has(e.pointerId)) return
    const vorige = pointers.current.get(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      const andere = [...pointers.current.entries()].find(([id]) => id !== e.pointerId)[1]
      const oud = Math.hypot(vorige.x - andere.x, vorige.y - andere.y)
      const nieuw = Math.hypot(a.x - b.x, a.y - b.y)
      const m = naarWereld((a.x + b.x) / 2, (a.y + b.y) / 2)
      if (oud > 0) zoomRond(m.sx, m.sy, nieuw / oud)
      if (sleep.current) sleep.current.bewogen = true
      return
    }
    const s = sleep.current
    if (!s) return
    const ctm = svgRef.current.getScreenCTM()
    const dx = (e.clientX - s.x) / ctm.a, dy = (e.clientY - s.y) / ctm.d
    if (Math.abs(dx) + Math.abs(dy) > 4) s.bewogen = true
    if (s.bewogen) setView(v => ({ ...v, x: s.vx + dx, y: s.vy + dy }))
  }
  const up = e => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size === 0) setTimeout(() => (sleep.current = null), 0)
  }
  const klik = id => e => {
    e.stopPropagation()
    if (sleep.current?.bewogen) return
    onKies(id)
  }

  // Bij selectie vanuit lijst of zoeken: zachtjes naar het onderdeel schuiven.
  useEffect(() => {
    if (!geselecteerd || !pos[geselecteerd]) return
    const p = pos[geselecteerd]
    setView(v => {
      const k = Math.max(v.k, 1.9)
      return { k, x: WERELD.b * 0.42 - p.x * k, y: WERELD.h / 2 - p.y * k }
    })
  }, [geselecteerd]) // eslint-disable-line react-hooks/exhaustive-deps

  const toonLabel = (e) => {
    if (buren?.has(e.id)) return true
    if (zoekTreffers?.has(e.id)) return true
    if (view.k >= 1.7) return true
    if (view.k >= 1.2) return (graad[e.id] || 0) >= 2 || e.soort === 'extern'
    return (graad[e.id] || 0) >= 4 || e.soort === 'extern'
  }

  const pad = (a, b) => {
    // Gebogen lijn, licht naar het midden getrokken: geeft een rustig, 'kaartachtig' beeld.
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
    const cx = mx + (WERELD.b / 2 - mx) * 0.18, cy = my + (WERELD.h / 2 - my) * 0.18
    return `M${a.x},${a.y} Q${cx},${cy} ${b.x},${b.y}`
  }

  const actief = id => zichtbaar.has(id)
  const gedimd = id => (buren && !buren.has(id)) || (zoekTreffers && zoekTreffers.size > 0 && !zoekTreffers.has(id))

  return (
    <div className="relative w-full h-full select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WERELD.b} ${WERELD.h}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up}
        onClick={() => !sleep.current?.bewogen && onKies(null)}
        role="img" aria-label="Landkaart van AI-activiteiten binnen NHL Stenden"
      >
        <defs>
          <radialGradient id="zee" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="65%" stopColor="#162D6E" />
            <stop offset="100%" stopColor="#0F1E52" />
          </radialGradient>
          {Object.entries(SPOREN).map(([id, s]) => (
            <radialGradient key={id} id={`eiland-${id}`}>
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
              <stop offset="85%" stopColor="#ffffff" stopOpacity="0.96" />
              <stop offset="100%" stopColor={s.kleur} stopOpacity="0.12" />
            </radialGradient>
          ))}
          <radialGradient id="plein">
            <stop offset="0%" stopColor="#FFF1F8" />
            <stop offset="88%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FCE7F3" />
          </radialGradient>
          <filter id="schaduw" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#0F1E52" floodOpacity="0.35" />
          </filter>
          <filter id="gloed" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect x={-WERELD.b} y={-WERELD.h} width={WERELD.b * 3} height={WERELD.h * 3} fill="url(#zee)" />

        <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
          {/* Hoogtelijnen / golven als decor, in de geest van de cirkels in de AI Netwerk-header */}
          {[0.3, 0.5, 0.7, 0.85, 1.12].map(f => (
            <ellipse key={f} cx={baan.x} cy={baan.y} rx={baan.rx * f} ry={baan.ry * f} fill="none" stroke="#ffffff" strokeOpacity={0.05} strokeWidth="1.5" />
          ))}
          <ellipse cx={baan.x} cy={baan.y} rx={baan.rx * 0.965} ry={baan.ry * 0.965} fill="none" stroke="#F472B6" strokeOpacity="0.25" strokeDasharray="2 10" strokeWidth="2" />
          <text x={baan.x} y={baan.y - baan.ry - 40} textAnchor="middle" fill="#F9A8D4" fontSize="17" fontWeight="700" letterSpacing="4">BUITENBAAN · EXTERNE SAMENWERKINGEN</text>

          {/* Eilanden */}
          {Object.values(eilanden).map(e => (
            <g key={e.id} className="transition-opacity" opacity={buren ? 0.7 : 1}>
              <circle cx={e.x} cy={e.y} r={e.r + 16} fill={e.kleur} opacity="0.22" />
              <circle cx={e.x} cy={e.y} r={e.r + 7} fill={e.kleur} opacity="0.35" />
              <circle cx={e.x} cy={e.y} r={e.r} fill={`url(#eiland-${e.id})`} stroke={e.kleur} strokeWidth="2.5" filter="url(#schaduw)" />
              <circle cx={e.x} cy={e.y} r={e.r - 12} fill="none" stroke={e.kleur} strokeOpacity="0.18" strokeDasharray="3 7" />
              <g transform={`translate(${e.x},${e.y - e.r - 6})`}>
                <rect x={-110} y={-22} width={220} height={40} rx={20} fill={e.kleur} />
                <text y={6} textAnchor="middle" fill="#fff" fontSize="19" fontWeight="800">{e.icon} {e.titel}</text>
              </g>
            </g>
          ))}

          {/* Centraal plein */}
          <g opacity={buren ? 0.75 : 1}>
            <circle cx={plein.x} cy={plein.y} r={plein.r + 18} fill="#E91E8C" opacity="0.2" />
            <circle cx={plein.x} cy={plein.y} r={plein.r + 8} fill="#E91E8C" opacity="0.3" />
            <circle cx={plein.x} cy={plein.y} r={plein.r} fill="url(#plein)" stroke="#E91E8C" strokeWidth="2.5" filter="url(#schaduw)" />
            <g transform={`translate(${plein.x},${plein.y - plein.r - 6})`}>
              <rect x={-110} y={-22} width={220} height={40} rx={20} fill="#E91E8C" />
              <text y={6} textAnchor="middle" fill="#fff" fontSize="19" fontWeight="800">🧭 Koers & Kaders</text>
            </g>
          </g>

          {/* Verbindingen */}
          <g fill="none">
            {relaties.map((r, i) => {
              const a = pos[r.van], b = pos[r.naar]
              if (!a || !b || !actief(r.van) || !actief(r.naar)) return null
              const aan = focus && (r.van === focus || r.naar === focus)
              return (
                <path key={i} d={pad(a, b)}
                  stroke={aan ? '#E91E8C' : '#ffffff'}
                  strokeOpacity={aan ? 0.95 : buren ? 0.02 : 0.07}
                  strokeWidth={aan ? 2.6 : 1.2}
                  strokeDasharray={r.herkomst === 'melding' ? '5 5' : undefined}
                  className="transition-all duration-200" />
              )
            })}
          </g>

          {/* Onderdelen */}
          {entiteiten.map(e => {
            const p = pos[e.id]
            if (!p || !actief(e.id)) return null
            const s = SOORTEN[e.soort] || SOORTEN.initiatief
            const groot = e.soort === 'organisatie' || e.soort === 'beleid' || e.soort === 'extern'
            const r = (groot ? 15 : 12) + Math.min(6, (graad[e.id] || 0) * 0.8)
            const isSel = geselecteerd === e.id
            const dim = gedimd(e.id)
            const opBuitenbaan = e.soort === 'extern'
            return (
              <g key={e.id} transform={`translate(${p.x},${p.y})`}
                 className="cursor-pointer" opacity={dim ? 0.22 : 1}
                 onClick={klik(e.id)} onPointerEnter={() => setHover(e.id)} onPointerLeave={() => setHover(null)}
                 role="button" tabIndex={0} aria-label={`${s.label}: ${e.naam}`}
                 onKeyDown={ev => ev.key === 'Enter' && onKies(e.id)}>
                {isSel && <circle r={r + 10} fill="#E91E8C" opacity="0.35" filter="url(#gloed)" className="pulse-ring" />}
                <g className="knooppunt">
                  {e.soort === 'beleid' ? (
                    <rect x={-r} y={-r} width={r * 2} height={r * 2} rx={5} fill="#fff" stroke={s.kleur} strokeWidth={isSel ? 4 : 3} />
                  ) : e.soort === 'pilot' ? (
                    <polygon points={zeshoek(r + 1)} fill="#fff" stroke={s.kleur} strokeWidth={isSel ? 4 : 3} />
                  ) : (
                    <circle r={r} fill={opBuitenbaan ? '#FFF7ED' : '#fff'} stroke={s.kleur} strokeWidth={isSel ? 4 : 3}
                      strokeDasharray={e.herkomst === 'melding' ? '4 3' : undefined} />
                  )}
                  <text textAnchor="middle" dominantBaseline="central" fontSize={r * 0.95} style={{ pointerEvents: 'none' }}>{s.icon}</text>
                </g>
                {toonLabel(e) && (
                  <text y={r + 15} textAnchor="middle" fontSize={isSel ? 15 : 13} fontWeight={isSel ? 800 : 600}
                    fill={opBuitenbaan ? '#FFF7ED' : '#0F1E52'}
                    stroke={opBuitenbaan ? '#0F1E52' : '#ffffff'} strokeWidth="4" paintOrder="stroke" strokeLinejoin="round"
                    style={{ pointerEvents: 'none' }}>
                    {kort(e.naam, isSel ? 48 : 30)}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* Zoomknoppen */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5">
        {[['+', 1.25], ['−', 0.8]].map(([t, f]) => (
          <button key={t} onClick={() => zoomRond(WERELD.b / 2, WERELD.h / 2, f)}
            className="w-10 h-10 rounded-xl bg-white/95 text-nhl-blauw font-bold text-lg shadow-lg hover:bg-white" aria-label={t === '+' ? 'Inzoomen' : 'Uitzoomen'}>{t}</button>
        ))}
        <button onClick={() => setView({ x: 0, y: 0, k: 1 })} className="w-10 h-10 rounded-xl bg-white/95 text-nhl-blauw shadow-lg hover:bg-white text-sm" aria-label="Hele kaart tonen" title="Hele kaart">⤢</button>
      </div>
    </div>
  )
}

function zeshoek(r) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = Math.PI / 6 + (i * Math.PI) / 3
    return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`
  }).join(' ')
}

export function kort(t, n) { return t.length > n ? t.slice(0, n - 1) + '…' : t }
