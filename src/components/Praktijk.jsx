import { useEffect, useMemo, useState } from 'react'
import { SPOREN } from '../model.js'

// Uit de praktijk: wat collega's, studenten en teams van NHL Stenden zelf vertellen over hun werk met AI.
// Anoniem: alleen de rol en het vakgebied. De vindplaatsen staan apart in public/data/praktijk-bronnen.json.
const ROLLEN = {
  docent: { label: 'Docent', icon: '🧑‍🏫', kleur: '#1E3A8A' },
  student: { label: 'Student', icon: '🎓', kleur: '#7C3AED' },
  medewerker: { label: 'Medewerker', icon: '💼', kleur: '#0F766E' },
  onderzoeker: { label: 'Onderzoeker', icon: '🔬', kleur: '#0E7490' },
  team: { label: 'Team of opleiding', icon: '👥', kleur: '#B45309' },
  alumnus: { label: 'Alumnus', icon: '🚀', kleur: '#9333EA' },
  partner: { label: 'Bedrijf of partner', icon: '🏢', kleur: '#475569' },
}
const AARD = { doet: 'Doet', ontwikkelt: 'Ontwikkelt', zegt: 'Zegt' }

export default function Praktijk({ modus, onWeergave }) {
  const [d, setD] = useState(null)
  const [bronnen, setBronnen] = useState(null)
  const [rol, setRol] = useState('alle')
  const [open, setOpen] = useState(null)
  const toonBronnen = modus === 'bronnen'

  useEffect(() => { fetch('./data/praktijk.json', { cache: 'no-cache' }).then(r => r.json()).then(setD).catch(() => setD({ items: [] })) }, [])
  useEffect(() => { if (toonBronnen && !bronnen) fetch('./data/praktijk-bronnen.json', { cache: 'no-cache' }).then(r => r.json()).then(setBronnen).catch(() => setBronnen({ bronnen: [] })) }, [toonBronnen, bronnen])

  const items = d?.items || []
  const tellingen = useMemo(() => { const t = {}; items.forEach(i => (t[i.rol] = (t[i.rol] || 0) + 1)); return t }, [items])
  const tools = useMemo(() => { const t = {}; items.forEach(i => (i.tools || []).forEach(x => (t[x] = (t[x] || 0) + 1))); return Object.entries(t).sort((a, b) => b[1] - a[1]) }, [items])
  // Nieuwste verhaal bovenaan: op datum van het (laatste) bericht.
  const lijst = items.filter(i => rol === 'alle' || i.rol === rol).sort((a, b) => (b.datum || '').localeCompare(a.datum || ''))

  if (!d) return <div className="h-full grid place-items-center bg-nhl-grijs text-gray-400">Verhalen worden geladen…</div>

  if (toonBronnen) {
    const index = Object.fromEntries(items.map(i => [i.id, i]))
    return (
      <div className="h-full overflow-y-auto bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 text-sm text-gray-700">
          <div className="section-label">Uit de praktijk</div>
          <h2 className="text-xl font-bold text-nhl-blauw mt-1">Vindplaatsen</h2>
          <p className="mt-2 text-gray-500">Voor de redactie: waar elk verhaal stond op de dag dat het is gelezen. De verhalen zelf staan zonder naam in de rubriek.</p>
          {!bronnen ? <p className="mt-6 text-gray-400">Laden…</p> : (
            <ol className="mt-5 space-y-2 list-decimal ml-5">
              {bronnen.bronnen.map(b => (
                <li key={b.id} className="leading-snug">
                  <span className="font-semibold text-gray-800">{index[b.id]?.titel || b.id}</span>
                  <span className="text-gray-400"> · {b.kanaal} · gelezen {b.gelezen}</span><br />
                  {b.url ? <a href={b.url} target="_blank" rel="noreferrer" className="text-nhl-blauw-light hover:underline break-all">{b.url}</a> : <span className="text-gray-400">geen link</span>}
                  {b.noot && <span className="text-gray-400"> · {b.noot}</span>}
                </li>
              ))}
            </ol>
          )}
          <p className="mt-8"><a href="#v=praktijk" onClick={e => { e.preventDefault(); onWeergave('praktijk') }} className="text-nhl-blauw-light hover:underline">← terug naar Uit de praktijk</a></p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-nhl-grijs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-3xl">
          <div className="section-label">Uit de praktijk</div>
          <h2 className="page-title mt-1">Wat collega's en studenten zelf doen met AI</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">{d.inleiding}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-1.5">
          <button onClick={() => setRol('alle')} className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${rol === 'alle' ? 'bg-nhl-blauw text-white' : 'bg-white text-gray-700'}`}>Alles <span className="opacity-60">{items.length}</span></button>
          {Object.entries(ROLLEN).filter(([r]) => tellingen[r]).map(([r, x]) => (
            <button key={r} onClick={() => setRol(r)} className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${rol === r ? 'bg-nhl-blauw text-white' : 'bg-white text-gray-700'}`}>{x.icon} {x.label} <span className="opacity-60">{tellingen[r]}</span></button>
          ))}
        </div>

        {tools.length > 0 && rol === 'alle' && (
          <div className="mt-4 card p-4">
            <div className="section-label">Genoemde tools en technieken</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tools.slice(0, 28).map(([t, n]) => <span key={t} className="text-xs rounded-full bg-blue-50 text-nhl-blauw px-2.5 py-0.5 font-medium">{t}{n > 1 ? <span className="opacity-50"> {n}</span> : null}</span>)}
            </div>
          </div>
        )}

        <div className="mt-6 grid md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
          {lijst.map(i => {
            const r = ROLLEN[i.rol] || ROLLEN.medewerker, sp = SPOREN[i.spoor], isOpen = open === i.id
            return (
              <article key={i.id} className="card p-5 relative overflow-hidden flex flex-col gap-2">
                <span className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: r.kleur }} />
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[11px] font-semibold rounded-full px-2 py-0.5" style={{ background: r.kleur + '15', color: r.kleur }}>{r.icon} {i.wie}</span>
                  {sp && <span className="text-[11px] font-semibold rounded-full px-2 py-0.5" style={{ background: sp.kleur + '15', color: sp.kleur }}>{sp.icon} {sp.kort}</span>}
                  {i.aard && <span className="text-[11px] font-semibold rounded-full px-2 py-0.5 bg-gray-100 text-gray-600">{AARD[i.aard] || i.aard}</span>}
                </div>
                <h3 className="font-bold text-gray-900 leading-snug">{i.titel}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{i.kort}</p>
                {isOpen && i.verhaal && <div className="text-sm text-gray-700 leading-relaxed space-y-2 border-t border-gray-100 pt-2">{i.verhaal.map((p, n) => <p key={n}>{p}</p>)}</div>}
                {isOpen && (i.bronnen || []).length > 0 && (
                  <div className="text-xs text-gray-500 border-t border-gray-100 pt-2">
                    <span className="font-semibold text-gray-600">{i.bronnen.length === 1 ? 'Bron' : 'Bronnen'}: </span>
                    {i.bronnen.map((b, n) => (
                      <span key={b.url}>{n > 0 && ' · '}<a href={b.url} target="_blank" rel="noreferrer" className="text-nhl-blauw-light hover:underline">{b.label}{i.bronnen.length > 1 ? ` ${n + 1}` : ''} ↗</a>{b.noot ? ` (${b.noot.charAt(0).toLowerCase() + b.noot.slice(1)})` : ''}</span>
                    ))}
                  </div>
                )}
                {(i.tools || []).length > 0 && <div className="flex flex-wrap gap-1 pt-1">{i.tools.map(t => <span key={t} className="text-[11px] rounded-full bg-blue-50 text-nhl-blauw px-2 py-0.5">{t}</span>)}</div>}
                <div className="mt-auto pt-2 flex items-center justify-between text-xs text-gray-400">
                  <span>{i.kanaal} · {i.periode}</span>
                  {i.verhaal && <button onClick={() => setOpen(isOpen ? null : i.id)} className="font-semibold text-nhl-blauw-light hover:underline">{isOpen ? 'Minder' : 'Lees het hele verhaal'}</button>}
                </div>
              </article>
            )
          })}
        </div>

        <p className="mt-8 text-xs text-gray-400 max-w-3xl leading-relaxed">{d.verantwoording}{' '}
          <a href="#v=praktijkbronnen" onClick={e => { e.preventDefault(); onWeergave('praktijkbronnen') }} className="text-gray-300 hover:text-gray-500" title="Vindplaatsen" aria-label="Vindplaatsen voor de redactie">§</a>
        </p>
      </div>
    </div>
  )
}
