import { useMemo } from 'react'
import { SOORTEN } from '../model.js'
import { VAKKEN, perVak } from '../groepen.js'
import { VERSIE } from '../data/versie.js'
import { ONDERHOUD_REGEL } from '../data/onderhoudsregel.js'

// Laag 1: het canvas op één A4. Geen lijnen, wel overzicht:
// per vak hoeveel er gebeurt en wat de dragende onderdelen zijn.
const RASTER = [
  ['leren', 'top'], ['werken', 'top'], ['verantwoordelijkheid', 'top'],
  ['kern', 'midden'],
  ['geletterdheid', 'onder'], ['werkveld', 'onder'], ['onderzoek', 'onder'],
]

export default function Canvas({ data, onSpoor, onKies }) {
  const { uit } = useMemo(() => perVak(data), [data])
  const m = data.meta || {}
  return (
    <div className="h-full overflow-y-auto bg-[#E9EDF5] print:bg-white">
      <div className="mx-auto max-w-[1400px] px-3 sm:px-6 py-5 sm:py-8 print:p-0">
        <article className="a4 canvas-a4 bg-white rounded-3xl shadow-xl print:shadow-none print:rounded-none p-4 sm:p-6 lg:p-8">
          <header className="flex flex-wrap items-end justify-between gap-3 pb-4 mb-5 border-b-2 border-nhl-blauw">
            <div>
              <div className="section-label">NHL Stenden · AI Canvas</div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-nhl-blauw leading-tight">Waar gebeurt AI in onze organisatie?</h1>
            </div>
            <dl className="flex gap-5 text-right tabular-nums">
              {[['onderdelen', data.entiteiten.length], ['verbindingen', data.relaties.length], ['sporen', 6]].map(([l, n]) => (
                <div key={l}><dd className="text-2xl font-extrabold text-nhl-blauw leading-none">{n}</dd><dt className="text-[11px] uppercase tracking-wider text-gray-400 mt-1">{l}</dt></div>
              ))}
            </dl>
          </header>

          <div className="canvas-raster">
            {RASTER.map(([id]) => (
              <Vak key={id} vak={VAKKEN[id]} lijst={uit[id]} breed={id === 'kern'} onSpoor={onSpoor} onKies={onKies} />
            ))}
            <Vak vak={VAKKEN.extern} lijst={uit.extern} extern onSpoor={onSpoor} onKies={onKies} />
          </div>

          <footer className="mt-5 pt-3 border-t border-gray-100 flex flex-wrap justify-between gap-2 text-[11px] text-gray-400">
            <span>Bijgewerkt {m.bijgewerkt} · elk onderdeel heeft een bron · klik een vak voor alle details</span>
            <span>ai-canvas-nhlstenden.netlify.app · versie {VERSIE} · <span className="text-[10px]">{ONDERHOUD_REGEL}</span></span>
          </footer>
        </article>
      </div>
    </div>
  )
}

function Vak({ vak, lijst, breed, extern, onSpoor, onKies }) {
  const telling = {}
  lijst.forEach(e => (telling[e.soort] = (telling[e.soort] || 0) + 1))
  const aantalTonen = extern ? 16 : breed ? 8 : 5
  const getoond = lijst.slice(0, aantalTonen)
  return (
    <section className={`vak relative rounded-2xl border border-gray-200 bg-white flex flex-col min-w-0 overflow-hidden ${breed ? 'vak-kern' : ''} ${extern ? 'vak-extern' : ''}`}
      style={{ '--kleur': vak.kleur, gridArea: vak.id }}>
      <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: vak.kleur }} />
      <button onClick={() => onSpoor(vak.id)} className="text-left px-4 pt-4 pb-2 group">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg grid place-items-center text-base shrink-0" style={{ background: vak.kleur + '18' }} aria-hidden="true">{vak.icon}</span>
          <div className="min-w-0">
            {vak.nr && <div className="text-[10px] font-bold tracking-widest text-gray-400 leading-none mb-0.5">KOERSLIJN {vak.nr}</div>}
            <h2 className="font-extrabold text-[15px] leading-tight group-hover:underline" style={{ color: vak.kleur }}>{vak.titel}</h2>
          </div>
          <span className="ml-auto text-xl font-extrabold tabular-nums text-gray-800">{lijst.length}</span>
        </div>
        {vak.kort && !breed && !extern && VAKKEN[vak.id] && <p className="sr-only">{vak.kort}</p>}
      </button>

      <div className="px-4 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500 tabular-nums">
        {Object.keys(SOORTEN).filter(s => telling[s]).map(s => (
          <span key={s} title={SOORTEN[s].meervoud}><span aria-hidden="true">{SOORTEN[s].icon}</span> {telling[s]} {telling[s] === 1 ? SOORTEN[s].label.toLowerCase() : SOORTEN[s].meervoud.toLowerCase()}</span>
        ))}
      </div>

      <ul className={`px-4 pt-3 pb-2 grid gap-x-5 ${breed ? 'sm:grid-cols-2' : ''} ${extern ? 'lg:grid-cols-1 sm:grid-cols-2' : ''}`}>
        {getoond.map(e => (
          <li key={e.id} className="min-w-0">
            <button onClick={() => onKies(e.id)} title={e.naam}
              className="w-full text-left flex items-baseline gap-2 py-1 text-[13px] leading-snug text-gray-800 hover:text-nhl-roze">
              <span className="text-[11px] shrink-0 opacity-70" aria-hidden="true">{SOORTEN[e.soort]?.icon}</span>
              <span className="truncate">{e.naam}</span>
              {e.herkomst === 'melding' && <span className="text-[10px] text-amber-600 shrink-0">onbevestigd</span>}
            </button>
          </li>
        ))}
      </ul>

      {lijst.length > getoond.length && (
        <button onClick={() => onSpoor(vak.id)} className="mt-auto mx-4 mb-3 text-left text-xs font-semibold hover:underline print:hidden" style={{ color: vak.kleur }}>
          Alle {lijst.length} bekijken →
        </button>
      )}
      {lijst.length > getoond.length && <p className="hidden print:block mx-4 mb-3 text-[10px] text-gray-400">+ {lijst.length - getoond.length} meer op de site</p>}
    </section>
  )
}
