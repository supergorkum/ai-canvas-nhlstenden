import { SOORTEN, SPOREN, HERKOMST, STATUS, BRONSOORT, UITKOMST, omgekeerd } from '../model.js'

// Zijpaneel met alles wat we van één onderdeel weten, plus de verbindingen.
export default function Detailpaneel({ data, id, onKies, onSluit, onAanvullen }) {
  const e = data.index[id]
  if (!e) return null
  const s = SOORTEN[e.soort] || SOORTEN.initiatief
  const spoor = SPOREN[e.spoor]
  const herkomst = HERKOMST[e.herkomst] || HERKOMST.redactie

  // Verbindingen vanuit dit onderdeel gezien, gegroepeerd per soort relatie.
  const groepen = {}
  const gezien = new Set()
  const voeg = (soort, ander, r) => {
    const k = soort + '|' + ander.id
    if (gezien.has(k)) return
    gezien.add(k); (groepen[soort] ||= []).push({ ander, r })
  }
  data.relaties.forEach(r => {
    if (r.van === id && data.index[r.naar]) voeg(r.soort, data.index[r.naar], r)
    if (r.naar === id && data.index[r.van]) voeg(omgekeerd(r.soort), data.index[r.van], r)
  })
  const aanvullingen = (data.aanvullingen || []).filter(a => a.op === id)

  return (
    <aside className="print:hidden absolute z-40 bg-white shadow-2xl flex flex-col
                      inset-x-0 bottom-0 max-h-[78%] rounded-t-3xl animate-slide-up
                      md:inset-x-auto md:right-4 md:top-4 md:bottom-4 md:max-h-none md:w-[420px] md:rounded-3xl md:animate-slide-in"
           aria-label={`Details van ${e.naam}`}>
      <div className="relative nhl-gradient-deep text-white px-6 pt-5 pb-6 rounded-t-3xl overflow-hidden shrink-0">
        <div className="absolute -top-10 -right-10 w-40 h-40 border border-white/10 rounded-full" />
        <div className="absolute top-6 -right-2 w-24 h-24 border border-white/10 rounded-full" />
        <button onClick={onSluit} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-lg" aria-label="Sluiten">×</button>
        <div className="flex flex-wrap gap-1.5 mb-3 pr-10">
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: s.kleur }}>{s.icon} {s.label}</span>
          {spoor && <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-white/15">{spoor.icon} {spoor.titel}</span>}
          {e.status && <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-white/15">{STATUS[e.status] || e.status}</span>}
        </div>
        <h2 className="text-2xl font-extrabold leading-tight">{e.naam}</h2>
        {e.samenvatting && <p className="text-blue-100 text-sm mt-2 leading-relaxed">{e.samenvatting}</p>}
      </div>

      <div className="overflow-y-auto px-6 py-5 space-y-6 text-sm text-gray-700">
        {e.doel && <Blok titel="Doel"><p className="leading-relaxed">{e.doel}</p></Blok>}
        {e.details && <Blok titel="Wat doet het?"><p className="leading-relaxed whitespace-pre-line">{e.details}</p></Blok>}

        {(e.eigenaar || e.periode) && (
          <dl className="grid grid-cols-2 gap-3">
            {e.eigenaar && <Feit label="Eigenaar / thuisbasis" waarde={e.eigenaar} />}
            {e.periode && <Feit label="Periode" waarde={e.periode} />}
          </dl>
        )}

        {e.mensen?.length > 0 && (
          <Blok titel="Wie">
            <ul className="space-y-2">
              {e.mensen.map((m, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-50 text-nhl-blauw font-bold grid place-items-center text-xs">{initialen(m.naam)}</span>
                  <span><span className="font-semibold text-gray-900">{m.naam}</span>{m.rol && <span className="text-gray-500"> · {m.rol}</span>}</span>
                </li>
              ))}
            </ul>
          </Blok>
        )}

        <Blok titel={`Verbindingen (${Object.values(groepen).flat().length})`}>
          {Object.keys(groepen).length === 0 && <p className="text-gray-400">Nog geen verbindingen bekend. Weet jij er een? Voeg hem toe met de plusknop.</p>}
          <div className="space-y-3">
            {Object.entries(groepen).map(([soort, lijst]) => (
              <div key={soort}>
                <div className="text-[11px] uppercase tracking-wider font-semibold text-nhl-roze mb-1.5">{soort}</div>
                <div className="flex flex-wrap gap-1.5">
                  {lijst.map(({ ander, r }) => {
                    const as = SOORTEN[ander.soort] || SOORTEN.initiatief
                    return (
                      <button key={ander.id + soort} onClick={() => onKies(ander.id)} title={r.toelichting || undefined}
                        className="inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium hover:-translate-y-0.5 hover:shadow transition-all"
                        style={{ borderColor: as.kleur + '55', color: as.kleur, borderStyle: r.herkomst === 'melding' ? 'dashed' : 'solid' }}>
                        <span>{as.icon}</span>{ander.naam}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </Blok>

        {e.links?.length > 0 && (
          <Blok titel="Meer lezen">
            <ul className="space-y-1.5">
              {e.links.map((l, i) => (
                <li key={i}><a href={l.url} target="_blank" rel="noreferrer" className="text-nhl-blauw-light hover:underline font-medium">↗ {l.label || l.url}</a></li>
              ))}
            </ul>
          </Blok>
        )}

        <Bronnen bronnen={e.bronnen} onMelding={() => onAanvullen(e)} />

        {aanvullingen.length > 0 && (
          <Blok titel="Aanvullingen uit het netwerk">
            <ul className="space-y-2">
              {aanvullingen.map((a, i) => (
                <li key={i} className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                  <p>{a.tekst}</p>
                  <p className="text-xs text-amber-700 mt-1">{a.door ? `${a.door} · ` : ''}{a.datum} · nog niet bevestigd</p>
                </li>
              ))}
            </ul>
          </Blok>
        )}

        <div className="rounded-2xl bg-nhl-grijs p-3 text-xs text-gray-500 flex gap-2 items-start">
          <span className="mt-0.5 w-2 h-2 rounded-full shrink-0" style={{ background: herkomst.kleur }} />
          <div>
            <span className="font-semibold text-gray-700">Herkomst: {herkomst.label}.</span> {herkomst.uitleg}
            {e.bronLabel && <div className="mt-1">Bron: {e.bronLabel}</div>}
            {e.bijgewerkt && <div className="mt-1">Laatst bijgewerkt: {e.bijgewerkt}</div>}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 p-4 shrink-0">
        <button onClick={() => onAanvullen(e)} className="w-full btn-roze flex items-center justify-center gap-2">
          <span className="w-6 h-6 rounded-full bg-white/20 grid place-items-center text-lg leading-none">+</span>
          Informatie toevoegen aan {e.naam.length > 26 ? 'dit onderdeel' : e.naam}
        </button>
      </div>
    </aside>
  )
}

function Blok({ titel, children }) {
  return <section><h3 className="section-label mb-2">{titel}</h3>{children}</section>
}
function Feit({ label, waarde }) {
  return <div className="rounded-xl bg-nhl-grijs p-3"><dt className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">{label}</dt><dd className="font-semibold text-gray-800 mt-0.5">{waarde}</dd></div>
}
const initialen = n => n.split(/\s+/).filter(w => /^[A-Z]/.test(w)).slice(0, 2).map(w => w[0]).join('') || n[0]


// Uitklapbaar bronnenblok: bij elk onderdeel zichtbaar waar het vandaan komt en of het is nagelopen.
function Bronnen({ bronnen = [], onMelding }) {
  const gecontroleerd = bronnen.some(b => b.uitkomst === 'bevestigd')
  const stand = gecontroleerd ? UITKOMST['bevestigd'] : (bronnen.some(b => b.uitkomst === 'niet te controleren') ? UITKOMST['niet te controleren'] : UITKOMST['nog niet gecontroleerd'])
  return (
    <details className="rounded-2xl border border-gray-100 bg-white group" open>
      <summary className="cursor-pointer list-none px-4 py-3 flex items-center gap-2 text-sm">
        <span className="w-5 h-5 rounded-full grid place-items-center text-white text-xs font-bold shrink-0" style={{ background: stand.kleur }} aria-hidden="true">{stand.icoon}</span>
        <span className="font-semibold text-nhl-blauw">Bronnen ({bronnen.length})</span>
        <span className="text-xs text-gray-500">{stand.label}</span>
        <span className="ml-auto text-gray-400 group-open:rotate-90 transition-transform" aria-hidden="true">›</span>
      </summary>
      <div className="px-4 pb-4 space-y-2.5">
        {bronnen.length === 0 && <p className="text-xs text-gray-500">Bij dit onderdeel staat nog geen bron. Weet je er een? Gebruik de plusknop.</p>}
        {bronnen.map((b, i) => {
          const s = BRONSOORT[b.soort] || BRONSOORT.document
          const u = UITKOMST[b.uitkomst] || UITKOMST['nog niet gecontroleerd']
          return (
            <div key={i} className="rounded-xl bg-nhl-grijs p-3 text-xs text-gray-600">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 w-4 h-4 rounded-full grid place-items-center text-white text-[10px] font-bold shrink-0" style={{ background: u.kleur }} aria-label={u.label}>{u.icoon}</span>
                <div className="min-w-0">
                  {b.url && /^https?:/.test(b.url)
                    ? <a href={b.url} target="_blank" rel="noreferrer" className="font-semibold text-nhl-blauw-light hover:underline break-words">↗ {b.label}</a>
                    : <span className="font-semibold text-gray-800 break-words">{b.label}</span>}
                  <div className="mt-0.5"><span style={{ color: s.kleur }} className="font-semibold">{s.label}</span> · {u.label}{b.gecontroleerd ? ` (${b.gecontroleerd})` : ''}</div>
                  {b.noot && <p className="mt-1 leading-snug">{b.noot}</p>}
                </div>
              </div>
            </div>
          )
        })}
        <p className="text-[11px] text-gray-400 leading-snug">Nagelopen betekent: de bron is op de genoemde datum geopend of gezien en met de inhoud vergeleken. Klopt er iets niet, of ken je een betere bron? <button type="button" onClick={onMelding} className="underline text-nhl-blauw-light">Meld het hier</button>.</p>
      </div>
    </details>
  )
}
