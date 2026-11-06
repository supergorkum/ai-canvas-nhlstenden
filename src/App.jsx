import { useEffect, useMemo, useState } from 'react'
import Detailpaneel from './components/Detailpaneel.jsx'
import Meldformulier from './components/Meldformulier.jsx'
import Overzicht from './components/Overzicht.jsx'
import Over from './components/Over.jsx'
import Canvas from './components/Canvas.jsx'
import Spoorblad from './components/Spoorblad.jsx'
import Samenhang from './components/Samenhang.jsx'
import Treinnetwerk from './components/Treinnetwerk.jsx'
import { SOORTEN } from './model.js'

const leesHash = () => new URLSearchParams(location.hash.slice(1))

export default function App() {
  const [data, setData] = useState(null)
  const [fout, setFout] = useState(null)
  const [weergave, setWeergave] = useState(() => { const v = leesHash().get('v'); return !v || v === 'kaart' ? 'canvas' : v })
  const [vak, setVak] = useState(() => leesHash().get('s') || 'leren')
  const [gekozen, setGekozen] = useState(() => leesHash().get('id'))
  const [uit, setUit] = useState(new Set())
  const [zoek, setZoek] = useState('')
  const [meld, setMeld] = useState(null) // null | {aanvullingOp?}
  const [welkom, setWelkom] = useState(() => { try { return !localStorage.getItem('canvas-welkom') } catch { return true } })

  useEffect(() => {
    fetch('./data/canvas.json', { cache: 'no-cache' })
      .then(r => r.json())
      .then(d => { d.index = Object.fromEntries(d.entiteiten.map(e => [e.id, e])); setData(d) })
      .catch(() => setFout('De gegevens van het canvas konden niet worden geladen.'))
  }, [])

  // Diepe links: #v=kaart&id=ai-koers
  useEffect(() => {
    const p = new URLSearchParams(); p.set('v', weergave); if (weergave === 'spoor') p.set('s', vak); if (gekozen) p.set('id', gekozen)
    history.replaceState(null, '', '#' + p.toString())
  }, [weergave, gekozen, vak])

  const zichtbaar = useMemo(() => new Set((data?.entiteiten || []).filter(e => !uit.has(e.soort)).map(e => e.id)), [data, uit])
  const zoekTreffers = useMemo(() => {
    const q = zoek.trim().toLowerCase()
    if (!q || !data) return null
    return new Set(data.entiteiten.filter(e => [e.naam, e.samenvatting, e.eigenaar, ...(e.mensen || []).map(m => m.naam)].join(' ').toLowerCase().includes(q)).map(e => e.id))
  }, [zoek, data])

  const tellingen = useMemo(() => {
    const t = {}; (data?.entiteiten || []).forEach(e => (t[e.soort] = (t[e.soort] || 0) + 1)); return t
  }, [data])

  if (fout) return <div className="p-10 text-center text-red-600">{fout}</div>
  if (!data) return <div className="h-screen grid place-items-center nhl-gradient-deep text-white"><div className="animate-pulse text-lg font-semibold">AI Canvas wordt geladen…</div></div>

  const sluitWelkom = () => { setWelkom(false); try { localStorage.setItem('canvas-welkom', '1') } catch { /* privémodus */ } }

  return (
    <div className="h-[100dvh] flex flex-col bg-nhl-nacht print:bg-white">
      <header className="nhl-gradient-deep text-white relative z-40 shrink-0">
        <div className="px-4 sm:px-6 h-16 flex items-center gap-3 sm:gap-6">
          <a href="#v=canvas" onClick={() => { setWeergave('canvas'); setGekozen(null) }} className="flex items-center gap-2.5 shrink-0">
            <span className="w-9 h-9 rounded-xl bg-white text-nhl-blauw font-extrabold grid place-items-center text-sm shadow">AI</span>
            <span className="leading-tight hidden sm:block"><span className="block font-extrabold">AI Canvas</span><span className="block text-[11px] text-blue-200 -mt-0.5">NHL Stenden</span></span>
          </a>
          <nav className="flex gap-1 bg-white/10 rounded-xl p-1 text-xs sm:text-sm font-semibold" aria-label="Weergave">
            {[['canvas', '▦', 'Canvas'], ['samenhang', '◎', 'Samenhang'], ['trein', '🚆', 'Treinnetwerk'], ['overzicht', '☰', 'Lijst'], ['over', 'ℹ️', 'Over']].map(([id, i, t]) => (
              <button key={id} onClick={() => setWeergave(id)} className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors ${weergave === id || (id === 'canvas' && weergave === 'spoor') ? 'bg-white text-nhl-blauw' : 'text-blue-100 hover:bg-white/10'}`}>
                <span className="sm:mr-1.5">{i}</span><span className="hidden sm:inline">{t}</span>
              </button>
            ))}
          </nav>
          <div className="flex-1 min-w-0">
            <input value={zoek} onChange={e => setZoek(e.target.value)} placeholder="Zoek team, pilot, persoon…"
              className="w-full max-w-sm bg-white/10 placeholder:text-blue-200 text-white rounded-xl px-3.5 py-2 text-sm outline-none focus:bg-white/20 border border-white/10" aria-label="Zoeken" />
          </div>
          <button onClick={() => setMeld({})} className="btn-roze shrink-0 shadow-lg flex items-center gap-1.5">
            <span className="text-lg leading-none">+</span><span className="hidden sm:inline">Meld activiteit</span>
          </button>
        </div>
      </header>

      <main className="relative flex-1 min-h-0">
        {weergave === 'overzicht' && (
          <div className="absolute z-20 left-0 top-3 right-0 md:left-3 md:right-auto px-3 md:px-0 flex flex-nowrap md:flex-wrap overflow-x-auto gap-1.5 pointer-events-none [scrollbar-width:none]">
            {Object.entries(SOORTEN).filter(([s]) => tellingen[s]).map(([s, d]) => {
              const aan = !uit.has(s)
              return (
                <button key={s} onClick={() => setUit(o => { const n = new Set(o); aan ? n.add(s) : n.delete(s); return n })}
                  className={`pointer-events-auto shrink-0 inline-flex items-center gap-1.5 rounded-full pl-1.5 pr-3 py-1 text-xs font-semibold shadow transition-all ${aan ? 'bg-white text-gray-800' : 'bg-white/20 text-white/70 line-through'}`}
                  aria-pressed={aan} title={aan ? `${d.meervoud} verbergen` : `${d.meervoud} tonen`}>
                  <span className="w-5 h-5 rounded-full grid place-items-center text-[11px]" style={{ background: aan ? d.kleur + '22' : 'transparent' }}>{d.icon}</span>
                  {d.meervoud}<span className="opacity-50">{tellingen[s]}</span>
                </button>
              )
            })}
          </div>
        )}

        {weergave === 'canvas' && <Canvas data={data} onSpoor={id => { setVak(id); setWeergave('spoor'); setGekozen(null) }} onKies={setGekozen} />}
        {weergave === 'spoor' && <Spoorblad data={data} vakId={vak} onKies={setGekozen} onTerug={() => setWeergave('canvas')} onSpoor={id => { setVak(id); setGekozen(null) }} />}
        {weergave === 'samenhang' && <Samenhang data={data} onKies={setGekozen} />}
        {weergave === 'trein' && <Treinnetwerk data={data} onKies={setGekozen} onSpoor={id => { setVak(id); setWeergave('spoor'); setGekozen(null) }} />}
        {['canvas', 'spoor', 'samenhang', 'trein'].includes(weergave) && (
          <button onClick={() => window.print()} className="print:hidden hidden sm:block absolute z-20 right-4 bottom-4 bg-white text-nhl-blauw shadow-lg rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-nhl-grijs" title="Afdrukken of opslaan als PDF (A4 liggend)">
            🖨️ Print op {weergave === 'samenhang' || weergave === 'trein' ? 'A3' : 'A4'}
          </button>
        )}
        {weergave === 'overzicht' && <div className="absolute inset-0 pt-14 bg-nhl-grijs"><Overzicht data={data} zichtbaar={zichtbaar} zoekTreffers={zoekTreffers} onKies={setGekozen} /></div>}
        {weergave === 'over' && <Over data={data} onMeld={() => setMeld({})} />}

        {gekozen && data.index[gekozen] && weergave !== 'over' && (
          <Detailpaneel data={data} id={gekozen} onKies={setGekozen} onSluit={() => setGekozen(null)} onAanvullen={e => setMeld({ aanvullingOp: e })} />
        )}

        {weergave === 'canvas' && welkom && !gekozen && (
          <div className="print:hidden absolute z-30 left-3 bottom-3 max-w-sm bg-white rounded-3xl shadow-2xl p-5 animate-slide-up">
            <div className="section-label">Welkom op het AI Canvas</div>
            <p className="text-sm text-gray-600 mt-2">Dit canvas laat in één oogopslag zien waar AI gebeurt binnen NHL Stenden: per spoor, in <b>Koers & Kaders</b> en bij onze <b>externe samenwerkingen</b>. Klik een vak voor alle details, een naam voor het verhaal erachter. Onder <b>Samenhang</b> en <b>Treinnetwerk</b> zie je hoe alles samenhangt en waar de koers naartoe rijdt.</p>
            <div className="flex gap-2 mt-4">
              <button onClick={sluitWelkom} className="btn-primary">Op ontdekking</button>
              <button onClick={() => { sluitWelkom(); setMeld({}) }} className="btn-ghost">Iets melden</button>
            </div>
          </div>
        )}

      </main>

      {meld && <Meldformulier data={data} aanvullingOp={meld.aanvullingOp} onSluit={() => setMeld(null)} />}
    </div>
  )
}
