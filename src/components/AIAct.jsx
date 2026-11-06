import { useEffect, useMemo, useState } from 'react'

// 'Organisatie & AI Act': hoe je de AI Act moet zien, wat hij van NHL Stenden vraagt
// (met wat er al is en wat nog niet), en alle organisatieonderdelen op een rij.
const STAND = {
  belegd: { label: 'Belegd', kleur: '#0F766E', bg: '#ECFDF5' },
  deels: { label: 'Deels', kleur: '#B45309', bg: '#FFFBEB' },
  open: { label: 'Nog in te vullen', kleur: '#BE185D', bg: '#FDF2F8' },
}
const GROEPEN = [
  ['Bestuur en sturing', ['college-van-bestuur', 'stuurgroep-transitieprogramma', 'transitieprogramma-digitalisering', 'kwartiermaker-digitale-samenhang', 'iv-organisatie', 'concernstaf', 'hsb', 'hmr']],
  ['Compliance, privacy en security', ['ai-compliance-team', 'privacy-security-team', 'fg-ciso']],
  ['AI-Netwerk en overleg', ['ai-netwerk', 'kernteam-ai-netwerk', 'thema-overleg-leren', 'thema-overleg-werken', 'thema-overleg-verantwoordelijkheid', 'thema-overleg-geletterdheid', 'thema-overleg-werkveld', 'thema-overleg-onderzoek', 'ai-coalitie', 'ai-community-of-practice', 'solution-partners']],
  ['Onderwijs en professionalisering', ['ctl', 'oo-i', 'examencommissies', 'myacademy', 'bibliotheek', 'hrm']],
  ['Diensten', ['dlwo', 'facility-management', 'fcp']],
  ['Academies, lectoraten en werkveld', ['academie-educatie', 'amce', 'academie-verpleegkunde-gezondheid', 'lectoraat-cv-ai', 'werkveldcommissies']],
]

export default function AIAct({ data, onKies }) {
  const [act, setAct] = useState(null)
  const [filter, setFilter] = useState('alle')
  useEffect(() => { fetch('./data/aiact.json', { cache: 'no-cache' }).then(r => r.json()).then(setAct).catch(() => setAct(false)) }, [])

  const perOnderdeel = useMemo(() => {
    const m = {}
    act?.verplichtingen.forEach(v => v.bij.forEach(id => (m[id] ||= []).push(v)))
    return m
  }, [act])

  if (act === false) return <p className="p-10 text-center text-gray-500">De gegevens over de AI Act konden niet worden geladen.</p>
  if (!act) return <div className="p-10 text-center text-gray-400">Wordt geladen…</div>

  const u = act.uitleg
  const tel = { belegd: 0, deels: 0, open: 0 }
  act.verplichtingen.forEach(v => tel[v.stand]++)
  const zichtbaar = act.verplichtingen.filter(v => filter === 'alle' || v.stand === filter)
  const organisaties = data.entiteiten.filter(e => e.soort === 'organisatie')
  const ingedeeld = new Set(GROEPEN.flatMap(([, ids]) => ids))
  const groepen = [...GROEPEN.map(([t, ids]) => [t, ids.map(id => data.index[id]).filter(Boolean)]), ['Overig', organisaties.filter(e => !ingedeeld.has(e.id))]].filter(([, l]) => l.length)

  return (
    <div className="h-full overflow-y-auto bg-[#E9EDF5] print:bg-white">
      <div className="mx-auto max-w-[1200px] px-3 sm:px-6 py-5 sm:py-8 print:p-0">
        <article className="bg-white rounded-3xl shadow-xl print:shadow-none print:rounded-none p-5 sm:p-8 lg:p-10 space-y-12">
          <header className="pb-5 border-b-2 border-nhl-blauw">
            <div className="section-label">NHL Stenden · AI Canvas · Organisatie & AI Act</div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-nhl-blauw leading-tight mt-1" style={{ textWrap: 'balance' }}>Wat vraagt de AI Act van ons, en wat hebben we al?</h1>
            <p className="text-gray-600 mt-3 max-w-3xl leading-relaxed">Een van de opdrachten bij de realisatie van de AI-Koers is compliant zijn met de AI Act. Deze pagina legt uit hoe je de wet kunt lezen, zet de verplichtingen naast wat er in onze organisatie al staat, en laat zien welke onderdelen nog moeten worden ingevuld.</p>
            <nav className="flex flex-wrap gap-2 mt-4 text-sm font-semibold print:hidden">
              <a href="./downloads/Organisatie-en-AI-Act-NHL-Stenden.pptx" download className="rounded-full bg-nhl-roze text-white px-3 py-1.5 hover:bg-nhl-roze-dark">⬇ Download als PowerPoint</a>
              {[['uitleg', '1 · Hoe zie je de AI Act'], ['verplichtingen', '2 · Wat vraagt hij van ons'], ['organisatie', '3 · Onze organisatieonderdelen']].map(([id, t]) => (
                <a key={id} href={`#${id}`} onClick={e => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }}
                  className="rounded-full border border-nhl-blauw/20 px-3 py-1.5 text-nhl-blauw hover:bg-blue-50">{t}</a>
              ))}
            </nav>
          </header>

          {/* 1. Uitleg */}
          <section id="uitleg" className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-nhl-blauw">1. Hoe zie je de AI Act?</h2>
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-5 text-[15px] leading-relaxed text-gray-700">
                <p>{u.watHetIs}</p>
                <div>
                  <h3 className="section-label mb-2">Twee rollen, twee soorten plichten</h3>
                  <div className="space-y-3">
                    {u.rollen.map(r => (
                      <div key={r.rol} className="rounded-2xl bg-nhl-grijs p-4">
                        <div className="font-bold text-gray-900">{r.rol} <span className="text-gray-400 font-normal text-sm">({r.engels})</span></div>
                        <p className="text-sm mt-1">{r.wat}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-500">{u.gpai}</p>
              </div>
              <div>
                <h3 className="section-label mb-3">Vier risiconiveaus</h3>
                <div className="space-y-2">
                  {u.risico.map((r, i) => (
                    <div key={r.niveau} className="mx-auto rounded-xl text-white p-3.5" style={{ background: r.kleur, width: `${64 + i * 12}%` }}>
                      <div className="font-extrabold">{r.niveau} <span className="font-normal opacity-90">· {r.wat}</span></div>
                      <p className="text-[12.5px] opacity-95 mt-0.5 leading-snug">{r.voorbeeld}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">Hoe hoger in de piramide, hoe zwaarder de eisen. Een toepassing valt in één niveau, afhankelijk van waarvoor je hem gebruikt.</p>
              </div>
            </div>

            <div>
              <h3 className="section-label mb-3">Tijdlijn</h3>
              <ol className="relative grid sm:grid-cols-7 gap-3 sm:gap-2">
                {u.tijdlijn.map(t => (
                  <li key={t.datum} className={`rounded-xl p-3 text-[12px] leading-snug ${t.nu ? 'bg-nhl-roze text-white' : 'bg-nhl-grijs text-gray-700'}`}>
                    <div className={`font-extrabold text-[13px] ${t.nu ? '' : 'text-nhl-blauw'}`}>{t.datum}</div>
                    <div className="mt-1">{t.wat}</div>
                  </li>
                ))}
              </ol>
              <p className="text-[11px] text-gray-400 mt-2">{u.bronnoot}</p>
            </div>

            <div className="rounded-2xl border-l-4 border-nhl-roze bg-pink-50/60 p-5 text-[15px] leading-relaxed text-gray-800">
              <b className="text-nhl-blauw">Wat betekent dit voor NHL Stenden?</b> {u.nhl}
            </div>
          </section>

          {/* 2. Verplichtingen */}
          <section id="verplichtingen" className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-nhl-blauw">2. Wat vraagt de AI Act van ons?</h2>
              <div className="flex gap-1.5 print:hidden" role="group" aria-label="Filter op stand">
                {[['alle', `Alle ${act.verplichtingen.length}`], ['open', `Nog in te vullen ${tel.open}`], ['deels', `Deels ${tel.deels}`]].map(([id, t]) => (
                  <button key={id} onClick={() => setFilter(id)} aria-pressed={filter === id}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${filter === id ? 'bg-nhl-blauw text-white border-nhl-blauw' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex h-3 rounded-full overflow-hidden" aria-hidden="true">
                {['belegd', 'deels', 'open'].map(s => tel[s] > 0 && <div key={s} style={{ width: `${(tel[s] / act.verplichtingen.length) * 100}%`, background: STAND[s].kleur }} />)}
              </div>
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-600">
                {['belegd', 'deels', 'open'].map(s => <span key={s} className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: STAND[s].kleur }} />{STAND[s].label}: <b>{tel[s]}</b></span>)}
              </div>
              <p className="text-xs text-gray-500 mt-2">{act.duiding}</p>
            </div>

            <div className="space-y-4">
              {zichtbaar.map(v => {
                const st = STAND[v.stand]
                return (
                  <article key={v.id} className="relative rounded-2xl border border-gray-200 overflow-hidden break-inside-avoid">
                    <span className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: st.kleur }} />
                    <div className="p-5 pl-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-[17px] text-gray-900 mr-1">{v.titel}</h3>
                        <span className="text-[11px] font-bold rounded-full px-2 py-0.5 bg-blue-50 text-nhl-blauw">{v.artikel}</span>
                        <span className="text-[11px] rounded-full px-2 py-0.5 bg-gray-100 text-gray-600">voor: {v.rol}</span>
                        <span className="text-[11px] rounded-full px-2 py-0.5 bg-gray-100 text-gray-600">vanaf: {v.vanaf}</span>
                        <span className="ml-auto text-[11px] font-bold rounded-full px-2.5 py-0.5" style={{ background: st.bg, color: st.kleur }}>{st.label}</span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 mt-3 text-[13.5px] leading-relaxed text-gray-700">
                        <div><div className="section-label mb-1">Taak</div>{v.taak}</div>
                        <div><div className="section-label mb-1">Wat moet het doen</div>{v.doen}</div>
                        <div><div className="section-label mb-1">Verantwoording</div>{v.verantwoording}</div>
                      </div>
                      <div className="mt-4 rounded-xl bg-nhl-grijs p-3 text-[13px]">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-semibold text-gray-700 mr-1">Bij ons:</span>
                          {v.bij.map(id => data.index[id] && (
                            <button key={id} onClick={() => onKies(id)} className="rounded-lg bg-white border border-gray-200 px-2 py-0.5 text-[12px] font-medium text-nhl-blauw hover:border-nhl-roze">{data.index[id].naam}</button>
                          ))}
                        </div>
                        <p className="text-gray-600 mt-1.5">{v.standToelichting}</p>
                      </div>
                      {v.nogInTevullen && (
                        <p className="mt-3 text-[13px] rounded-xl px-3 py-2 font-semibold" style={{ background: STAND.open.bg, color: STAND.open.kleur }}>Nog in te vullen: {v.nogInTevullen}</p>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          {/* 3. Organisatie */}
          <section id="organisatie" className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-nhl-blauw">3. Onze organisatieonderdelen</h2>
              <p className="text-gray-600 mt-2 max-w-3xl">Alle teams, diensten en overleggen die op het canvas staan. Per onderdeel: wat het is, het doel als een bron dat noemt, en aan welke AI Act-verplichtingen het bijdraagt.</p>
            </div>
            {groepen.map(([titel, lijst]) => (
              <div key={titel}>
                <h3 className="section-label mb-2">{titel} · {lijst.length}</h3>
                <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                  {lijst.map(e => {
                    const vv = perOnderdeel[e.id] || []
                    return (
                      <div key={e.id} className="grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)_minmax(0,1fr)] gap-x-5 gap-y-1.5 p-4 text-[13px] leading-snug break-inside-avoid">
                        <button onClick={() => onKies(e.id)} className="text-left font-bold text-[14px] text-gray-900 hover:text-nhl-roze">{e.naam}</button>
                        <div className="text-gray-600 min-w-0">
                          {e.samenvatting}
                          <div className="mt-1.5"><span className="font-semibold text-gray-700">Doel: </span>{e.doel ? e.doel : <span className="text-gray-400">niet expliciet in de bronnen</span>}</div>
                        </div>
                        <div className="flex flex-wrap gap-1 content-start">
                          {vv.length === 0 && <span className="text-gray-300">geen directe AI Act-taak</span>}
                          {vv.map(v => (
                            <a key={v.id} href="#verplichtingen" onClick={ev => { ev.preventDefault(); setFilter('alle'); document.getElementById('verplichtingen')?.scrollIntoView({ behavior: 'smooth' }) }}
                              className="rounded-md px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: STAND[v.stand].bg, color: STAND[v.stand].kleur }} title={v.titel}>
                              {v.kort}
                            </a>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            <div className="rounded-2xl p-5" style={{ background: STAND.open.bg }}>
              <h3 className="font-extrabold text-[16px]" style={{ color: STAND.open.kleur }}>Rollen die de AI Act vraagt en die nog niet zijn belegd</h3>
              <ul className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-[13.5px] text-gray-800">
                {act.verplichtingen.filter(v => v.nogInTevullen).map(v => (
                  <li key={v.id} className="flex gap-2"><span style={{ color: STAND.open.kleur }}>●</span><span><b>{v.nogInTevullen}</b> <span className="text-gray-500">({v.artikel.split(';')[0]})</span></span></li>
                ))}
              </ul>
            </div>
          </section>

          <footer className="pt-3 border-t border-gray-100 text-[11px] text-gray-400 flex flex-wrap justify-between gap-2">
            <span>Bijgewerkt {act.bijgewerkt} · Bronnen: AI Act (Verordening (EU) 2024/1689) zoals gewijzigd door Verordening (EU) 2026/1744; AI-Koers v0.55d; onderdelen op het AI Canvas. Geen juridisch advies.</span>
            <span>ai-canvas-nhlstenden.netlify.app</span>
          </footer>
        </article>
      </div>
    </div>
  )
}
