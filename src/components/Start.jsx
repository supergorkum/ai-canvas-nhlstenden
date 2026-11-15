import { useEffect, useState } from 'react'
import { SOORTEN } from '../model.js'
import { VERSIE } from '../data/versie.js'

const ONDERDELEN = [
  ['canvas', '▦', 'Canvas', 'De landkaart in één blik: per spoor wat er gebeurt, plus Koers & Kaders en de externe samenwerkingen. Klik een vak voor de details.', 'Begin hier als je wilt zien wat er bij NHL Stenden rond AI speelt.'],
  ['samenhang', '◎', 'Samenhang', 'Laat zien hoe teams, pilots, beleid en partners met elkaar verbonden zijn.', 'Handig om te zien wie met wie samenwerkt en waar dubbel werk dreigt.'],
  ['trein', '🚆', 'Treinnetwerk', 'De AI-koers als route: waar rijdt NHL Stenden naartoe en welke lijnen liggen er al.', 'Voor het gesprek over richting en volgorde.'],
  ['aiact', '⚖️', 'Organisatie & AI Act', 'Wat de AI Act van de organisatie vraagt, wat er al is en wat nog ontbreekt.', 'Voor wie de verplichtingen wil kennen en wil weten waar de hogeschool staat.'],
  ['praktijk', '💬', 'Uit de praktijk', 'Verhalen van collega\'s en studenten over hoe zij zelf AI inzetten, anoniem en met de bron eronder.', 'Voor inspiratie en om te zien dat er intern veel gebeurt.'],
  ['overzicht', '☰', 'Lijst', 'Alle onderdelen op een rij, met zoeken en filteren op soort.', 'Voor wie iets specifieks zoekt.'],
  ['over', 'ℹ️', 'Over', 'Hoe het canvas werkt, de bronnen, de stand van de controle en het logboek.', 'Voor wie wil weten hoe betrouwbaar iets is.'],
]

const STAPPEN = [
  ['Documenten', 'Stukken uit de Drive-map van het canvas, zoals beleid, plannen en verslagen. Elk stuk wordt gelezen en verwerkt, daarna archiveren we het.'],
  ['Meldingen', 'Iedereen kan via het formulier een activiteit melden of aanvullen. We vragen altijd om een bron. Een melding zonder bron blijft zichtbaar als "nog niet bevestigd".'],
  ['Websites', 'Openbare pagina\'s van NHL Stenden en het intranet. Het intranet scannen we eens per maand, in de eerste week.'],
  ['LinkedIn en intranet voor Uit de praktijk', 'Elke week zoeken we naar verhalen van collega\'s en studenten over hun eigen werk met AI. Het nieuwste verhaal staat bovenaan.'],
]

const REGELS = [
  'Alleen wat in een bron staat. Bij twijfel nemen we het niet op en noteren we het in het logboek.',
  'Bij elk onderdeel staat de bron met link of verwijzing. Een bron krijgt pas het vinkje als we hem zelf hebben geopend en vergeleken.',
  'Wat geweest is, gaat naar het archief. Komende evenementen blijven staan.',
  'Het AI Netwerk is geen bron. Wat alleen daar stond, is herleid naar de oorspronkelijke bron of voorlopig geparkeerd.',
  'Geen persoonsnamen in Uit de praktijk, wel de rol en de opleiding of afdeling.',
]

const OPBRENGST = [
  ['Eén gezamenlijk beeld', 'Wie wil weten wat er al is, hoeft niet meer te rondvragen. Teams, pilots, beleid en partners staan bij elkaar.'],
  ['Minder dubbel werk', 'Je ziet waar iets al loopt voordat je zelf begint, en met wie je kunt aansluiten.'],
  ['Richting en samenhang', 'De koerslijnen en het treinnetwerk laten zien waar de initiatieven bij horen en waar nog niets is.'],
  ['Houvast bij de AI Act', 'Een overzicht van wat de wet vraagt, wat er al ligt en wat nog openstaat.'],
  ['Betrouwbaar gesprek', 'Door de bronnen kun je zelf nagaan waar iets vandaan komt. Dat maakt het canvas bruikbaar voor bestuur en overleg.'],
  ['Zichtbaar wat collega\'s doen', 'De verhalen uit de praktijk laten zien dat er intern veel gebeurt en geven ideeën om mee te beginnen.'],
]

export default function Start({ data, onGa, onMeld }) {
  const [verhalen, setVerhalen] = useState(null)
  useEffect(() => {
    fetch('./data/praktijk.json', { cache: 'no-cache' }).then(r => r.json()).then(p => setVerhalen((p.items || []).length)).catch(() => {})
  }, [])
  const m = data.meta || {}
  const v = m.verificatie || {}
  const tellingen = {}
  data.entiteiten.forEach(e => { tellingen[e.soort] = (tellingen[e.soort] || 0) + 1 })
  const cijfers = [
    [data.entiteiten.length, 'onderdelen op het canvas'],
    [v.bronnen_bevestigd != null ? `${v.bronnen_bevestigd} van ${v.bronnen_totaal}` : null, 'bronnen nagelopen en bevestigd'],
    [verhalen, 'verhalen uit de praktijk'],
    [(data.relaties || []).length, 'verbindingen tussen onderdelen'],
  ].filter(([n]) => n != null)

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="nhl-gradient-deep text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-xs font-bold tracking-widest uppercase text-blue-200">NHL Stenden</div>
          <h1 className="text-3xl sm:text-5xl font-extrabold mt-2 leading-tight">Het AI Canvas</h1>
          <p className="mt-4 text-lg sm:text-xl text-blue-100 max-w-2xl leading-snug">Een actuele foto van alles wat er bij NHL Stenden rond AI gebeurt: wie het doet, hoe het samenhangt en waar het vandaan komt.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => onGa('canvas')} className="btn-roze">Naar het canvas</button>
            <button onClick={() => onGa('praktijk')} className="px-4 py-2.5 rounded-xl bg-white/15 font-semibold hover:bg-white/25">Uit de praktijk</button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12 text-gray-700 leading-relaxed">
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {cijfers.map(([n, t]) => (
            <div key={t} className="card p-4 text-center"><div className="text-2xl font-extrabold text-nhl-blauw">{n}</div><div className="text-xs text-gray-500 mt-1">{t}</div></div>
          ))}
        </section>

        <section>
          <div className="section-label">Wat is het</div>
          <h2 className="page-title mt-1">Eén landkaart voor AI bij NHL Stenden</h2>
          <p className="mt-3">AI gebeurt overal: in academies, diensten, lectoraten, werkgroepen en in samenwerking met partners buiten de hogeschool. Het AI Canvas brengt dat bij elkaar. Je ziet wat er loopt, wie erbij betrokken is, hoe onderdelen samenhangen en welke bron erachter zit.</p>
          <p className="mt-3">Het canvas is een dynamische foto. Het laat de stand van nu zien, niet een plan voor later. Het is bedoeld om te kijken en te vinden, en om aan te vullen als jij meer weet.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(SOORTEN).filter(([s]) => tellingen[s]).map(([s, d]) => (
              <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-nhl-grijs px-3 py-1 text-xs font-semibold text-gray-700"><span aria-hidden="true">{d.icon}</span>{d.meervoud}<span className="text-gray-400">{tellingen[s]}</span></span>
            ))}
          </div>
        </section>

        <section>
          <div className="section-label">De onderdelen</div>
          <h2 className="page-title mt-1">Waar vind je wat</h2>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            {ONDERDELEN.map(([id, icoon, titel, wat, voor]) => (
              <button key={id} onClick={() => onGa(id)} className="card p-5 text-left hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3"><span className="w-10 h-10 rounded-xl bg-nhl-grijs grid place-items-center text-lg" aria-hidden="true">{icoon}</span><span className="font-bold text-nhl-blauw">{titel}</span></div>
                <p className="text-sm mt-3">{wat}</p>
                <p className="text-xs text-gray-500 mt-2">{voor}</p>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="section-label">Hoe het gevuld wordt</div>
          <h2 className="page-title mt-1">Vier bronnen, één redactie</h2>
          <ol className="mt-4 space-y-3">
            {STAPPEN.map(([t, x], i) => (
              <li key={t} className="flex gap-4 items-start"><span className="w-8 h-8 rounded-full bg-nhl-roze text-white font-bold grid place-items-center shrink-0">{i + 1}</span><span><b className="text-nhl-blauw">{t}</b><br />{x}</span></li>
            ))}
          </ol>
        </section>

        <section className="rounded-3xl bg-nhl-grijs p-6">
          <div className="section-label">Hoe het onderhouden wordt</div>
          <h2 className="page-title mt-1">Een vaste ronde en vaste spelregels</h2>
          <p className="mt-3">{m.ritme ? <>Het canvas wordt bijgehouden: <b>{m.ritme}</b>.</> : 'Een vaste redactieronde houdt het canvas bij.'} Laatst bijgewerkt: <b>{m.bijgewerkt || 'onbekend'}</b>. Elke wijziging komt in het logboek te staan.</p>
          <ul className="mt-4 space-y-2">
            {REGELS.map(r => <li key={r} className="flex gap-3 items-start"><span className="w-2 h-2 rounded-full bg-nhl-roze mt-2 shrink-0" /><span>{r}</span></li>)}
          </ul>
          {v.datum && <p className="mt-4 text-sm text-gray-600">Stand van de controle op {v.datum}: {v.bronnen_bevestigd} van de {v.bronnen_totaal} bronnen zijn nagelopen en bevestigd, {v.bronnen_afwijkend} wijken af van wat er eerst stond en zijn aangepast of gemarkeerd, {v.bronnen_niet_te_controleren} zijn niet te controleren.</p>}
          <button onClick={() => onGa('over')} className="mt-4 btn-ghost">Meer over de bronnen en het logboek</button>
        </section>

        <section>
          <div className="section-label">Wat je eruit haalt</div>
          <h2 className="page-title mt-1">Wat het NHL Stenden oplevert</h2>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            {OPBRENGST.map(([t, x]) => (
              <div key={t} className="card p-5"><div className="font-bold text-nhl-blauw">{t}</div><p className="text-sm mt-1">{x}</p></div>
            ))}
          </div>
        </section>

        <section className="text-center space-y-3">
          <h2 className="page-title">Weet je meer, of klopt er iets niet?</h2>
          <p>Meld een activiteit of vul iets aan. Geef er een bron of link bij, dan kunnen we het nalopen.</p>
          <button onClick={onMeld} className="btn-roze">Meld een activiteit</button>
          <p className="text-[11px] text-gray-400 pt-4">versie {VERSIE}</p>
        </section>
      </div>
    </div>
  )
}
