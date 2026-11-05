import { useMemo } from 'react'
import { SOORTEN, STATUS, omgekeerd } from '../model.js'
import { VAKKEN, perVak } from '../groepen.js'

// Laag 2: één vak van het canvas op één A4. Onderdelen per soort,
// verbindingen als leesbare zinnen in plaats van lijnen.
const VOLGORDE = ['beleid', 'organisatie', 'pilot', 'project', 'initiatief', 'opdracht', 'evenement', 'tool', 'extern']

export default function Spoorblad({ data, vakId, onKies, onTerug, onSpoor }) {
  const vak = VAKKEN[vakId]
  const { uit } = useMemo(() => perVak(data), [data])
  const lijst = uit[vakId] || []
  const perSoort = VOLGORDE.map(s => [s, lijst.filter(e => e.soort === s)]).filter(([, l]) => l.length)

  const verbanden = id => {
    const r = []
    data.relaties.forEach(x => {
      if (x.van === id && data.index[x.naar]) r.push([x.soort, data.index[x.naar]])
      else if (x.naar === id && data.index[x.van]) r.push([omgekeerd(x.soort), data.index[x.van]])
    })
    return r
  }

  if (!vak) return null
  return (
    <div className="h-full overflow-y-auto bg-[#E9EDF5] print:bg-white">
      <div className="mx-auto max-w-[1400px] px-3 sm:px-6 py-5 sm:py-8 print:p-0">
        <nav className="flex flex-wrap items-center gap-2 mb-4 print:hidden" aria-label="Vakken">
          <button onClick={onTerug} className="text-sm font-semibold text-nhl-blauw hover:underline mr-2">← Terug naar het canvas</button>
          {Object.values(VAKKEN).map(v => (
            <button key={v.id} onClick={() => onSpoor(v.id)}
              className="rounded-full px-3 py-1 text-xs font-semibold border transition-colors"
              style={v.id === vakId ? { background: v.kleur, borderColor: v.kleur, color: '#fff' } : { borderColor: v.kleur + '55', color: v.kleur, background: '#fff' }}>
              {v.kort}
            </button>
          ))}
        </nav>

        <article className="a4 spoorblad-a4 bg-white rounded-3xl shadow-xl print:shadow-none print:rounded-none p-4 sm:p-6 lg:p-8">
          <header className="pb-4 mb-5 border-b-2 flex flex-wrap items-end gap-4 justify-between" style={{ borderColor: vak.kleur }}>
            <div className="min-w-0">
              <div className="section-label">AI Canvas · laag 2</div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight" style={{ color: vak.kleur }}>{vak.icon} {vak.titel}</h1>
            </div>
            <div className="text-right tabular-nums"><div className="text-2xl font-extrabold text-gray-800 leading-none">{lijst.length}</div><div className="text-[11px] uppercase tracking-wider text-gray-400 mt-1">onderdelen</div></div>
          </header>

          <div className="spoor-kolommen">
            {perSoort.map(([s, l]) => (
              <section key={s} className="breakinside-avoid mb-6">
                <h2 style={{ breakAfter: "avoid" }} className="text-[11px] uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5" style={{ color: SOORTEN[s].kleur }}>
                  <span aria-hidden="true">{SOORTEN[s].icon}</span>{SOORTEN[s].meervoud}<span className="text-gray-300">· {l.length}</span>
                </h2>
                <ul className="space-y-2.5">
                  {l.map(e => {
                    const v = verbanden(e.id)
                    return (
                      <li key={e.id} className="breakinside-avoid">
                        <button onClick={() => onKies(e.id)} className="text-left w-full group">
                          <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-[14px] text-gray-900 group-hover:text-nhl-roze leading-snug">{e.naam}</span>
                            {e.status && <span className="text-[10px] text-gray-400 whitespace-nowrap">{STATUS[e.status] || e.status}</span>}
                            {e.herkomst === 'melding' && <span className="text-[10px] text-amber-600 whitespace-nowrap">onbevestigd</span>}
                          </div>
                          {e.samenvatting && <p className="text-[12.5px] text-gray-600 leading-snug mt-0.5 line-clamp-2">{e.samenvatting}</p>}
                          {v.length > 0 && (
                            <p className="text-[11.5px] text-gray-500 mt-1 leading-snug">
                              {v.slice(0, 4).map(([soort, ander], i) => (
                                <span key={i}>{i > 0 && ' · '}<span className="text-gray-400">{soort}</span> {ander.naam}</span>
                              ))}
                              {v.length > 4 && <span className="text-gray-400"> · +{v.length - 4}</span>}
                            </p>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>

          <footer className="mt-2 pt-3 border-t border-gray-100 text-[11px] text-gray-400 flex justify-between flex-wrap gap-2">
            <span>Bijgewerkt {data.meta?.bijgewerkt} · klik een onderdeel voor wie, wat, bronnen en de plusknop</span>
            <span>ai-canvas-nhlstenden.netlify.app</span>
          </footer>
        </article>
      </div>
    </div>
  )
}
