import { SOORTEN, SPOREN, HERKOMST, STATUS } from '../model.js'

// Lijstweergave: hetzelfde landschap als kaarten, handig om te scannen en te printen.
export default function Overzicht({ data, zichtbaar, zoekTreffers, onKies }) {
  const lijst = data.entiteiten.filter(e => zichtbaar.has(e.id) && (!zoekTreffers || zoekTreffers.has(e.id)))
  const perSoort = Object.keys(SOORTEN).map(s => [s, lijst.filter(e => e.soort === s)]).filter(([, l]) => l.length)
  const graad = id => data.relaties.filter(r => r.van === id || r.naar === id).length

  return (
    <div className="h-full overflow-y-auto bg-nhl-grijs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {perSoort.length === 0 && <p className="text-center text-gray-500 py-20">Niets gevonden met deze filters.</p>}
        {perSoort.map(([s, l]) => (
          <section key={s}>
            <div className="flex items-baseline gap-3 mb-4">
              <h2 className="text-xl font-bold text-nhl-blauw">{SOORTEN[s].icon} {SOORTEN[s].meervoud}</h2>
              <span className="text-sm text-gray-400">{l.length}</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {l.sort((a, b) => a.naam.localeCompare(b.naam)).map(e => {
                const sp = SPOREN[e.spoor]
                return (
                  <button key={e.id} onClick={() => onKies(e.id)} className="card card-hover text-left p-5 flex flex-col gap-2 relative overflow-hidden">
                    <span className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: SOORTEN[s].kleur }} />
                    <div className="flex flex-wrap gap-1.5">
                      {sp && <span className="text-[11px] font-semibold rounded-full px-2 py-0.5" style={{ background: sp.kleur + '15', color: sp.kleur }}>{sp.icon} {sp.kort}</span>}
                      {e.status && <span className="text-[11px] font-semibold rounded-full px-2 py-0.5 bg-gray-100 text-gray-600">{STATUS[e.status] || e.status}</span>}
                      {e.herkomst === 'melding' && <span className="text-[11px] font-semibold rounded-full px-2 py-0.5 bg-amber-50 text-amber-700">{HERKOMST.melding.label} · onbevestigd</span>}
                    </div>
                    <h3 className="font-bold text-gray-900 leading-snug">{e.naam}</h3>
                    {e.samenvatting && <p className="text-sm text-gray-600 line-clamp-3">{e.samenvatting}</p>}
                    <div className="mt-auto pt-2 text-xs text-gray-400">🔗 {graad(e.id)} verbinding{graad(e.id) === 1 ? '' : 'en'}{e.eigenaar ? ` · ${e.eigenaar}` : ''}</div>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
