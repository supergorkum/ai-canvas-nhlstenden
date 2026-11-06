import { HERKOMST } from '../model.js'

export default function Over({ data, onMeld }) {
  const m = data.meta || {}
  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8 text-gray-700 leading-relaxed">
        <section>
          <div className="section-label">Over dit canvas</div>
          <h2 className="page-title mt-1">Eén landkaart voor alles rond AI</h2>
          <p className="mt-3">AI gebeurt overal binnen NHL Stenden: in academies, diensten, lectoraten, werkgroepen en in samenwerkingen met partners buiten de hogeschool. Het AI Canvas brengt dat landschap samen, zodat zichtbaar wordt wat er gebeurt, wie erbij betrokken is en hoe de onderdelen met elkaar samenhangen.</p>
        </section>
        <section className="grid sm:grid-cols-3 gap-4">
          {[
            ['🗺️', 'Kijken', 'Klik op een onderdeel en je ziet wat het doet, wie erbij horen en waarmee het verbonden is.'],
            ['➕', 'Aanvullen', 'Weet je meer? Gebruik de plusknop bij een onderdeel, of meld iets nieuws.'],
            ['🔄', 'Bijhouden', 'Een terugkerende ronde verwerkt meldingen, nieuwe documenten en wijzigingen in de bronnen.'],
          ].map(([i, t, x]) => (
            <div key={t} className="card p-5"><div className="text-2xl">{i}</div><div className="font-bold text-nhl-blauw mt-2">{t}</div><p className="text-sm mt-1">{x}</p></div>
          ))}
        </section>
        <section>
          <h3 className="text-lg font-bold text-nhl-blauw">Zuiver: je ziet altijd waar iets vandaan komt</h3>
          <p className="mt-2">Elk onderdeel heeft een herkomst. Meldingen die nog niet zijn bevestigd, zijn gemarkeerd als "onbevestigd".</p>
          <ul className="mt-3 space-y-2">
            {Object.values(HERKOMST).map(h => (
              <li key={h.label} className="flex gap-3 items-start"><span className="w-3 h-3 rounded-full mt-1.5 shrink-0" style={{ background: h.kleur }} /><span><b>{h.label}</b>: {h.uitleg}</span></li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl bg-nhl-grijs p-6">
          <h3 className="text-lg font-bold text-nhl-blauw">Stand van het canvas</h3>
          <dl className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
            <div><dt className="text-gray-400">Laatst bijgewerkt</dt><dd className="font-semibold">{m.bijgewerkt || 'onbekend'}</dd></div>
            <div><dt className="text-gray-400">Volgende ronde</dt><dd className="font-semibold">{m.ritme || 'nog niet ingesteld'}</dd></div>
            <div className="sm:col-span-2"><dt className="text-gray-400">Bronnen die worden bekeken</dt>
              <dd><ul className="list-disc ml-5 mt-1">{(m.bronnen || []).map(b => <li key={b.naam}><b>{b.naam}</b>{b.stand ? `: ${b.stand}` : ''}</li>)}</ul></dd></div>
          </dl>
        </section>
        {data.bronnenlijst?.length > 0 && (
          <section id="bronnen">
            <h3 className="text-lg font-bold text-nhl-blauw">Bronnen</h3>
            <p className="text-sm text-gray-500 mt-1">Bij elk onderdeel staat de eigen bron in het detailpaneel. Dit zijn de hoofdbronnen van het canvas.</p>
            <div className="mt-3 grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              {data.bronnenlijst.map(g => (
                <div key={g.groep}>
                  <div className="section-label mb-1.5">{g.groep}</div>
                  <ul className="space-y-1">
                    {g.items.map(b => (
                      <li key={b.t} className="leading-snug">
                        {b.url ? <a href={b.url} target="_blank" rel="noreferrer" className="text-nhl-blauw-light hover:underline">{b.t} ↗</a> : <span className="text-gray-700">{b.t}</span>}
                        {b.noot && <span className="text-gray-400"> · {b.noot}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
        {data.logboek?.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-nhl-blauw">Logboek</h3>
            <ol className="mt-3 border-l-2 border-pink-200 ml-2 space-y-4">
              {data.logboek.slice().reverse().map((l, i) => (
                <li key={i} className="pl-4 relative"><span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-nhl-roze" /><div className="text-xs text-gray-400">{l.datum}</div><div>{l.tekst}</div></li>
              ))}
            </ol>
          </section>
        )}
        <div className="text-center pt-2"><button onClick={onMeld} className="btn-roze">Meld een activiteit</button></div>
      </div>
    </div>
  )
}
