import { useState, useMemo } from 'react'
import { MELDSOORTEN, SPOREN, SOORTEN, RELATIESOORTEN } from '../model.js'

// Meldformulier in drie stappen. Verstuurt naar Netlify Forms ('meld-activiteit').
// Elke melding komt eerst als 'nog niet bevestigd' op het canvas, de redactie
// (de terugkerende taak) controleert en verwerkt.
export default function Meldformulier({ data, aanvullingOp, onSluit }) {
  const [stap, setStap] = useState(aanvullingOp ? 1 : 0)
  const [v, setV] = useState({
    soort: aanvullingOp ? 'aanvulling' : '', naam: '', omschrijving: '', onderdeel: '', sporen: [],
    status: '', periode: '', link: '', verbonden_met: aanvullingOp ? [aanvullingOp.id] : [], relatie: 'is verbonden met',
    melder_naam: '', melder_email: '', melder_rol: '', naam_tonen: true,
  })
  const [zoek, setZoek] = useState('')
  const [verzonden, setVerzonden] = useState(null)
  const zet = (k, w) => setV(o => ({ ...o, [k]: w }))
  const wissel = (k, w) => setV(o => ({ ...o, [k]: o[k].includes(w) ? o[k].filter(x => x !== w) : [...o[k], w] }))

  const organisaties = useMemo(() => data.entiteiten.filter(e => e.soort === 'organisatie').map(e => e.naam).sort(), [data])
  const kandidaten = useMemo(() => {
    const q = zoek.trim().toLowerCase()
    return data.entiteiten.filter(e => !v.verbonden_met.includes(e.id) && (!q || e.naam.toLowerCase().includes(q))).slice(0, 8)
  }, [zoek, data, v.verbonden_met])

  const kanVerder = [
    !!v.soort,
    aanvullingOp ? v.omschrijving.trim().length > 5 : v.naam.trim().length > 2 && v.omschrijving.trim().length > 10,
    true,
    v.melder_naam.trim().length > 1 && /.+@.+\..+/.test(v.melder_email),
  ][stap]

  async function verstuur(ev) {
    ev.preventDefault()
    const velden = {
      'form-name': 'meld-activiteit', 'bot-field': '',
      ...v,
      naam: aanvullingOp ? `Aanvulling op: ${aanvullingOp.naam}` : v.naam,
      aanvulling_op: aanvullingOp?.id || '',
      sporen: v.sporen.join(', '),
      verbonden_met: v.verbonden_met.join(', '),
      naam_tonen: v.naam_tonen ? 'ja' : 'nee',
    }
    try {
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(velden).toString() })
      setVerzonden(res.ok ? 'ok' : 'fout')
    } catch { setVerzonden('fout') }
  }

  const stappen = aanvullingOp ? ['', 'Wat weet je?', 'Verbindingen', 'Over jou'] : ['Wat meld je?', 'Vertel erover', 'Verbindingen', 'Over jou']

  return (
    <div className="fixed inset-0 z-50 bg-nhl-nacht/60 backdrop-blur-sm grid place-items-center p-0 sm:p-4 animate-fade-in" onClick={onSluit}>
      <form onSubmit={verstuur} onClick={e => e.stopPropagation()}
        className="bg-white w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        <div className="relative nhl-gradient-deep text-white px-6 sm:px-8 pt-6 pb-5 overflow-hidden shrink-0">
          <div className="absolute -top-12 -right-12 w-48 h-48 border border-white/10 rounded-full" />
          <button type="button" onClick={onSluit} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-lg" aria-label="Sluiten">×</button>
          <div className="text-xs uppercase tracking-widest text-pink-200 font-semibold">{aanvullingOp ? 'Informatie toevoegen' : 'Meld een AI-activiteit'}</div>
          <h2 className="text-2xl font-extrabold mt-1 pr-10">{aanvullingOp ? aanvullingOp.naam : 'Wat gebeurt er bij jou met AI?'}</h2>
          {!verzonden && (
            <div className="flex gap-2 mt-4">
              {stappen.map((t, i) => t && (
                <div key={i} className="flex-1">
                  <div className={`h-1.5 rounded-full ${i <= stap ? 'bg-nhl-roze' : 'bg-white/20'}`} />
                  <div className={`text-[11px] mt-1 ${i === stap ? 'text-white font-semibold' : 'text-blue-200'}`}>{t}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {verzonden ? (
          <div className="p-8 text-center space-y-4">
            <div className="text-5xl">{verzonden === 'ok' ? '🎉' : '⚠️'}</div>
            <h3 className="text-xl font-bold text-nhl-blauw">{verzonden === 'ok' ? 'Dank je wel, je melding is binnen!' : 'Versturen lukte niet'}</h3>
            <p className="text-gray-600 max-w-md mx-auto">{verzonden === 'ok'
              ? 'De redactie van het AI Canvas bekijkt je melding bij de volgende ronde en plaatst hem op de landkaart. Tot die tijd is hij herkenbaar als "nog niet bevestigd".'
              : 'Probeer het later opnieuw, of mail je melding naar de kwartiermaker Digitale Samenhang.'}</p>
            <button type="button" onClick={onSluit} className="btn-primary">Terug naar de landkaart</button>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto px-6 sm:px-8 py-6 space-y-5 grow">
              {stap === 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {MELDSOORTEN.map(m => (
                    <button type="button" key={m.id} onClick={() => { zet('soort', m.id); setStap(1) }}
                      className={`text-left rounded-2xl border-2 p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-md ${v.soort === m.id ? 'border-nhl-roze bg-pink-50' : 'border-gray-100 hover:border-pink-200'}`}>
                      <div className="text-2xl">{m.icon}</div>
                      <div className="font-bold text-nhl-blauw mt-1.5 text-sm">{m.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5 leading-snug">{m.uitleg}</div>
                    </button>
                  ))}
                </div>
              )}

              {stap === 1 && (
                <>
                  {!aanvullingOp && (
                    <Veld label="Naam" hint="Hoe heet de activiteit, het team of het stuk?">
                      <input className="invoer" value={v.naam} onChange={e => zet('naam', e.target.value)} placeholder={voorbeeld(v.soort)} autoFocus />
                    </Veld>
                  )}
                  <Veld label={aanvullingOp ? 'Wat wil je toevoegen?' : 'Wat doet het?'} hint={aanvullingOp ? 'Bijvoorbeeld wie erbij betrokken zijn, een nieuwe stand van zaken of een correctie.' : 'Doel, aanpak en voor wie. Een paar zinnen is genoeg.'}>
                    <textarea className="invoer min-h-28" value={v.omschrijving} onChange={e => zet('omschrijving', e.target.value)} autoFocus={!!aanvullingOp} />
                  </Veld>
                  {!aanvullingOp && (
                    <>
                      <Veld label="Organisatieonderdeel" hint="Academie, dienst, lectoraat, team of externe organisatie.">
                        <input className="invoer" list="onderdelen" value={v.onderdeel} onChange={e => zet('onderdeel', e.target.value)} />
                        <datalist id="onderdelen">{organisaties.map(o => <option key={o} value={o} />)}</datalist>
                      </Veld>
                      <Veld label="Bij welk spoor past het?" hint="Kies er één of meer.">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(SPOREN).map(([id, s]) => (
                            <button type="button" key={id} onClick={() => wissel('sporen', id)}
                              className="rounded-full px-3 py-1.5 text-xs font-semibold border-2 transition-colors"
                              style={v.sporen.includes(id) ? { background: s.kleur, borderColor: s.kleur, color: '#fff' } : { borderColor: s.kleur + '40', color: s.kleur }}>
                              {s.icon} {s.titel}
                            </button>
                          ))}
                        </div>
                      </Veld>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Veld label="Stand van zaken">
                          <select className="invoer" value={v.status} onChange={e => zet('status', e.target.value)}>
                            <option value="">Kies…</option>
                            <option value="verkenning">Idee of verkenning</option>
                            <option value="gepland">Gepland</option>
                            <option value="lopend">Loopt</option>
                            <option value="afgerond">Afgerond</option>
                            <option value="vastgesteld">Vastgesteld (beleid)</option>
                          </select>
                        </Veld>
                        <Veld label="Periode"><input className="invoer" value={v.periode} onChange={e => zet('periode', e.target.value)} placeholder="bijv. sep 2026 – jun 2027" /></Veld>
                      </div>
                    </>
                  )}
                  <Veld label="Link (optioneel)" hint="Naar een document, pagina of Teams-kanaal."><input className="invoer" type="url" value={v.link} onChange={e => zet('link', e.target.value)} placeholder="https://" /></Veld>
                </>
              )}

              {stap === 2 && (
                <>
                  <p className="text-gray-600 text-sm">Met welke onderdelen op de landkaart heeft dit te maken? Zo ontstaan de lijnen op de kaart.</p>
                  <div className="flex flex-wrap gap-1.5">
                    {v.verbonden_met.map(id => {
                      const e = data.index[id]; if (!e) return null
                      return <span key={id} className="badge-blauw py-1">{SOORTEN[e.soort]?.icon} {e.naam}
                        {id !== aanvullingOp?.id && <button type="button" onClick={() => wissel('verbonden_met', id)} className="ml-1 text-nhl-roze font-bold" aria-label={`${e.naam} verwijderen`}>×</button>}</span>
                    })}
                    {v.verbonden_met.length === 0 && <span className="text-xs text-gray-400">Nog niets gekozen.</span>}
                  </div>
                  <input className="invoer" value={zoek} onChange={e => setZoek(e.target.value)} placeholder="Zoek een team, pilot, beleidsstuk, partner…" />
                  <div className="grid sm:grid-cols-2 gap-1.5">
                    {kandidaten.map(e => (
                      <button type="button" key={e.id} onClick={() => { wissel('verbonden_met', e.id); setZoek('') }}
                        className="text-left rounded-xl border border-gray-100 px-3 py-2 text-sm hover:border-nhl-roze hover:bg-pink-50 transition-colors">
                        <span className="mr-1.5">{SOORTEN[e.soort]?.icon}</span>{e.naam}
                      </button>
                    ))}
                  </div>
                  <Veld label="Hoe hangt het samen?">
                    <select className="invoer" value={v.relatie} onChange={e => zet('relatie', e.target.value)}>
                      {RELATIESOORTEN.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </Veld>
                </>
              )}

              {stap === 3 && (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Veld label="Je naam"><input className="invoer" value={v.melder_naam} onChange={e => zet('melder_naam', e.target.value)} autoComplete="name" /></Veld>
                    <Veld label="E-mailadres" hint="Alleen voor vragen van de redactie, niet zichtbaar."><input className="invoer" type="email" value={v.melder_email} onChange={e => zet('melder_email', e.target.value)} autoComplete="email" /></Veld>
                  </div>
                  <Veld label="Je rol (optioneel)"><input className="invoer" value={v.melder_rol} onChange={e => zet('melder_rol', e.target.value)} placeholder="bijv. docent, projectleider, beleidsadviseur" /></Veld>
                  <label className="flex gap-3 items-start text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" className="mt-1 accent-pink-600" checked={v.naam_tonen} onChange={e => zet('naam_tonen', e.target.checked)} />
                    <span>Mijn naam mag bij dit onderdeel op het canvas staan als contactpersoon.</span>
                  </label>
                  <p className="text-xs text-gray-400">Je melding wordt bewaard in Netlify Forms en alleen gebruikt om het AI Canvas bij te werken.</p>
                </>
              )}
            </div>

            <div className="border-t border-gray-100 px-6 sm:px-8 py-4 flex justify-between items-center shrink-0">
              <button type="button" className="btn-ghost" onClick={() => (stap === (aanvullingOp ? 1 : 0) ? onSluit() : setStap(stap - 1))}>
                {stap === (aanvullingOp ? 1 : 0) ? 'Annuleren' : '← Terug'}
              </button>
              {stap < 3 ? (
                <button type="button" disabled={!kanVerder} onClick={() => setStap(stap + 1)} className="btn-primary disabled:opacity-40">Verder →</button>
              ) : (
                <button type="submit" disabled={!kanVerder} className="btn-roze disabled:opacity-40">Verstuur melding</button>
              )}
            </div>
          </>
        )}
      </form>
    </div>
  )
}

function Veld({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-nhl-blauw">{label}</span>
      {hint && <span className="block text-xs text-gray-500 mb-1.5">{hint}</span>}
      <span className={hint ? '' : 'block mt-1.5'}>{children}</span>
    </label>
  )
}

function voorbeeld(soort) {
  return ({
    pilot: 'bijv. Pilot AI-feedback op schrijfopdrachten', 'ai-team': 'bijv. AI-werkgroep Academie …', beleidsstuk: 'bijv. Richtlijn AI in toetsing',
    beleid: 'bijv. Richtlijn AI in toetsing', extern: 'bijv. SURF Denktank AI', evenement: 'bijv. AI-lunchlezing december', opdracht: 'bijv. Opdracht verkenning AI-assistent studentservice',
  })[soort] || 'Geef het een herkenbare naam'
}
