// Bouwt de PowerPoint 'Organisatie & AI Act' uit dezelfde gegevens als de site.
const fs = require('fs')
const path = require('path')
const pptxgen = require('pptxgenjs')
const SKILL = '/root/.claude/skills/synced/6a1b2616-b22b-4586-9e84-f7478ea47cfe_ea0daa6d-c989-4e77-a311-257e41efb489/pptx'
let applyTheme = null
try { applyTheme = require(SKILL + '/scripts/apply_theme.js').applyTheme } catch { /* buiten de bouwomgeving: thema-kleuren niet toepassen */ }
const REPO = path.resolve(__dirname, '..')
const act = JSON.parse(fs.readFileSync(REPO + '/public/data/aiact.json', 'utf8'))
const canvas = JSON.parse(fs.readFileSync(REPO + '/public/data/canvas.json', 'utf8'))
const IDX = Object.fromEntries(canvas.entiteiten.map(e => [e.id, e]))
const UIT = process.argv[2] || REPO + '/public/downloads/Organisatie-en-AI-Act-NHL-Stenden.pptx'

const THEME = {
  name: 'AI Canvas NHL Stenden', headFontFace: 'Arial', bodyFontFace: 'Arial',
  colors: { dk1: '1F2937', lt1: 'FFFFFF', dk2: '1E3A8A', lt2: 'F8F9FB', accent1: 'E91E8C', accent2: '1E3A8A', accent3: '0F766E', accent4: 'B45309', accent5: 'BE185D', accent6: '991B1B', hlink: '2563EB', folHlink: '7C3AED' },
}
const HEX = { nacht: '0F1E52', navy: '1E3A8A', roze: 'E91E8C', grijs: 'F8F9FB', rand: 'E5E7EB', tekst: '1F2937', zacht: '4B5563', muted: '6B7280', blauwtint: 'EFF6FF', wit: 'FFFFFF' }
const STAND = {
  belegd: { label: 'Belegd', kleur: '0F766E', bg: 'ECFDF5' },
  deels: { label: 'Deels', kleur: 'B45309', bg: 'FFFBEB' },
  open: { label: 'Nog in te vullen', kleur: 'BE185D', bg: 'FDF2F8' },
}
const GROEPEN = [
  ['Bestuur en sturing', ['college-van-bestuur', 'stuurgroep-transitieprogramma', 'transitieprogramma-digitalisering', 'kwartiermaker-digitale-samenhang', 'iv-organisatie', 'concernstaf', 'hsb', 'hmr']],
  ['Compliance, privacy en security', ['ai-compliance-team', 'privacy-security-team', 'fg-ciso']],
  ['AI-Netwerk en overleg', ['ai-netwerk', 'kernteam-ai-netwerk', 'thema-overleg-leren', 'thema-overleg-werken', 'thema-overleg-verantwoordelijkheid', 'thema-overleg-geletterdheid', 'thema-overleg-werkveld', 'thema-overleg-onderzoek', 'ai-coalitie', 'ai-community-of-practice', 'solution-partners']],
  ['Onderwijs en professionalisering', ['ctl', 'oo-i', 'examencommissies', 'myacademy', 'bibliotheek', 'hrm']],
  ['Diensten', ['dlwo', 'facility-management', 'fcp']],
  ['Academies, lectoraten en werkveld', ['academie-educatie', 'amce', 'academie-verpleegkunde-gezondheid', 'lectoraat-cv-ai', 'werkveldcommissies']],
]

const pres = new pptxgen()
pres.layout = 'LAYOUT_WIDE' // 13.333 x 7.5
pres.title = 'Organisatie & AI Act'
pres.author = 'AI Canvas NHL Stenden'
pres.company = 'NHL Stenden'
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace }
const C = pres.SchemeColor
const W = 13.333, M = 0.6

const FOOT = { text: 'NHL Stenden · AI Canvas · Organisatie & AI Act', options: { x: M, y: 7.05, w: 8, h: 0.3, fontSize: 9, color: HEX.muted } }
pres.defineSlideMaster({
  title: 'Titel', background: { color: HEX.nacht },
  objects: [
    { placeholder: { options: { name: 'eyebrow', type: 'body', x: M, y: 1.6, w: 11, h: 0.4, fontSize: 13, bold: true, color: 'F9A8D4', charSpacing: 3, align: 'left' }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 2.05, w: 11.6, h: 1.9, fontSize: 44, bold: true, color: HEX.wit, valign: 'top', align: 'left' }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', x: M, y: 4.05, w: 9.5, h: 1.5, fontSize: 16, color: 'DBEAFE', valign: 'top', align: 'left' }, text: '' } },
  ],
})
pres.defineSlideMaster({
  title: 'Sectie', background: { color: HEX.navy },
  objects: [
    { placeholder: { options: { name: 'nummer', type: 'body', x: M, y: 1.9, w: 3, h: 1.6, fontSize: 96, bold: true, color: 'F9A8D4', align: 'left' }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 3.5, w: 11.5, h: 1.1, fontSize: 40, bold: true, color: HEX.wit, valign: 'top', align: 'left' }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', x: M, y: 4.65, w: 10, h: 1.4, fontSize: 16, color: 'DBEAFE', valign: 'top', align: 'left' }, text: '' } },
  ],
})
pres.defineSlideMaster({
  title: 'Inhoud', background: { color: HEX.wit },
  objects: [
    { placeholder: { options: { name: 'eyebrow', type: 'body', x: M, y: 0.3, w: 12, h: 0.32, fontSize: 11, bold: true, color: HEX.roze, charSpacing: 2.5, align: 'left' }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 0.62, w: 12.1, h: 0.7, fontSize: 30, bold: true, color: HEX.navy, valign: 'top', align: 'left' }, text: '' } },
    { text: FOOT },
  ],
  slideNumber: { x: 12.2, y: 7.05, w: 0.6, h: 0.3, fontSize: 9, color: HEX.muted, align: 'right' },
})

const T = (s, txt, o) => s.addText(txt, { isTextBox: true, fontFace: 'Arial', margin: 0, ...o })
const kaart = (s, x, y, w, h, fill, extra = {}) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: fill }, rectRadius: 0.12, ...extra })
const label = (s, txt, x, y, w, kleur = HEX.roze) => T(s, txt.toUpperCase(), { x, y, w, h: 0.25, fontSize: 10.5, bold: true, color: kleur, charSpacing: 2 })
function chip(s, txt, x, y, kleur, bg, bold = false) {
  const w = Math.max(0.6, txt.length * 0.072 + 0.3)
  kaart(s, x, y, w, 0.3, bg, { rectRadius: 0.15 })
  T(s, txt, { x, y, w, h: 0.3, fontSize: 10.5, bold, color: kleur, align: 'center', valign: 'middle' })
  return x + w + 0.1
}
const inhoud = (sectie, eyebrow, titel) => {
  const s = pres.addSlide({ masterName: 'Inhoud', sectionTitle: sectie })
  s.addText(eyebrow.toUpperCase(), { placeholder: 'eyebrow' })
  s.addText(titel, { placeholder: 'title' })
  return s
}

// ---------- Opening ----------
pres.addSection({ title: 'Opening' })
let s = pres.addSlide({ masterName: 'Titel', sectionTitle: 'Opening' })
s.addText('NHL STENDEN · AI CANVAS · ORGANISATIE & AI ACT', { placeholder: 'eyebrow' })
s.addText('Wat vraagt de AI Act van ons, en wat hebben we al?', { placeholder: 'title' })
s.addText('Een van de opdrachten bij de realisatie van de AI-Koers is compliant zijn met de AI Act. Deze presentatie legt uit hoe je de wet kunt lezen, zet de verplichtingen naast wat er in onze organisatie al staat, en laat zien welke onderdelen nog moeten worden ingevuld.', { placeholder: 'body' })
T(s, `Bijgewerkt ${act.bijgewerkt} · gelijk aan de pagina Organisatie & AI Act op ai-canvas-nhlstenden.netlify.app`, { x: M, y: 6.7, w: 12, h: 0.3, fontSize: 11, color: '93C5FD' })
s.addNotes('Op de site: de kop van het tabblad Organisatie & AI Act. Deze presentatie volgt de pagina één-op-één: dezelfde drie delen, dezelfde teksten en dezelfde volgorde. Extra dia\'s met uitleg zijn aangegeven als "extra".')

s = inhoud('Opening', 'Opbouw', 'Drie delen, net als op de site')
const delen = [
  ['1', 'Hoe zie je de AI Act', 'Wat de wet is, de twee rollen, de vier risiconiveaus en de tijdlijn.'],
  ['2', 'Wat vraagt hij van ons', `${act.verplichtingen.length} verplichtingen, elk met taak, uitvoering, verantwoording en de stand bij NHL Stenden.`],
  ['3', 'Onze organisatieonderdelen', 'Alle teams, diensten en overleggen op het canvas, met doel en bijdrage aan de AI Act.'],
]
delen.forEach(([n, t, x], i) => {
  const y = 1.8 + i * 1.6
  kaart(s, M, y, 12.1, 1.3, HEX.grijs)
  s.addShape(pres.shapes.OVAL, { x: M + 0.35, y: y + 0.3, w: 0.7, h: 0.7, fill: { color: HEX.navy }, line: { color: HEX.navy } })
  T(s, n, { x: M + 0.35, y: y + 0.3, w: 0.7, h: 0.7, fontSize: 24, bold: true, color: HEX.wit, align: 'center', valign: 'middle' })
  T(s, t, { x: M + 1.4, y: y + 0.25, w: 10.3, h: 0.45, fontSize: 20, bold: true, color: HEX.navy })
  T(s, x, { x: M + 1.4, y: y + 0.72, w: 10.3, h: 0.4, fontSize: 14, color: HEX.zacht })
})
s.addNotes('Extra dia. Op de site zijn dit de drie knoppen bovenaan de pagina.')

// ---------- 1. Uitleg ----------
const u = act.uitleg
const S1 = '1. Hoe zie je de AI Act'
pres.addSection({ title: S1 })
s = pres.addSlide({ masterName: 'Sectie', sectionTitle: S1 })
s.addText('1', { placeholder: 'nummer' }); s.addText('Hoe zie je de AI Act?', { placeholder: 'title' })
s.addText('Wat de wet is, voor wie hij geldt, hoe zwaar de eisen zijn en wanneer ze gelden.', { placeholder: 'body' })
s.addNotes('Op de site: sectie 1, "Hoe zie je de AI Act?".')

s = inhoud(S1, '1 · Hoe zie je de AI Act', 'Wat de AI Act is')
T(s, u.watHetIs, { x: M, y: 1.6, w: 6.0, h: 2.4, fontSize: 16, color: HEX.tekst, valign: 'top', lineSpacingMultiple: 1.15 })
kaart(s, M, 4.4, 6.0, 1.9, HEX.grijs)
T(s, u.gpai, { x: M + 0.3, y: 4.6, w: 5.4, h: 1.5, fontSize: 13, color: HEX.zacht, valign: 'top' })
label(s, 'Twee rollen, twee soorten plichten', 7.05, 1.6, 5.6)
u.rollen.forEach((r, i) => {
  const y = 2.0 + i * 2.2
  kaart(s, 7.05, y, 5.65, 2.0, HEX.grijs)
  T(s, [{ text: r.rol, options: { bold: true, color: HEX.tekst } }, { text: `  (${r.engels})`, options: { color: HEX.muted } }], { x: 7.3, y: y + 0.2, w: 5.2, h: 0.35, fontSize: 15 })
  T(s, r.wat, { x: 7.3, y: y + 0.6, w: 5.2, h: 1.3, fontSize: 13, color: HEX.zacht, valign: 'top' })
})
s.addNotes('Op de site: sectie 1, linkerkolom: de uitleg, "Twee rollen, twee soorten plichten" en de alinea over AI-modellen voor algemene doeleinden.')

s = inhoud(S1, '1 · Hoe zie je de AI Act', 'Vier risiconiveaus')
u.risico.forEach((r, i) => {
  const w = 12.1 * (0.64 + i * 0.12), x = M + (12.1 - w) / 2, y = 1.55 + i * 1.22
  kaart(s, x, y, w, 1.08, r.kleur.replace('#', ''))
  T(s, [{ text: r.niveau, options: { bold: true } }, { text: ' · ' + r.wat }], { x: x + 0.3, y: y + 0.14, w: w - 0.6, h: 0.36, fontSize: 16, color: HEX.wit })
  T(s, r.voorbeeld, { x: x + 0.3, y: y + 0.5, w: w - 0.6, h: 0.52, fontSize: 12, color: HEX.wit, valign: 'top' })
})
T(s, 'Hoe hoger in de piramide, hoe zwaarder de eisen. Een toepassing valt in één niveau, afhankelijk van waarvoor je hem gebruikt.', { x: M, y: 6.55, w: 12.1, h: 0.35, fontSize: 11, color: HEX.muted, align: 'center' })
s.addNotes('Op de site: sectie 1, rechterkolom "Vier risiconiveaus".')

s = inhoud(S1, '1 · Hoe zie je de AI Act', 'Tijdlijn')
const tl = u.tijdlijn, bw = (12.1 - 0.15 * (tl.length - 1)) / tl.length
s.addShape(pres.shapes.LINE, { x: M, y: 2.05, w: 12.1, h: 0, line: { color: 'CBD5E1', width: 2 } })
tl.forEach((t, i) => {
  const x = M + i * (bw + 0.15)
  s.addShape(pres.shapes.OVAL, { x: x + bw / 2 - 0.12, y: 1.93, w: 0.24, h: 0.24, fill: { color: t.nu ? HEX.roze : HEX.navy }, line: { color: HEX.wit, width: 2 } })
  kaart(s, x, 2.4, bw, 3.85, t.nu ? HEX.roze : HEX.grijs)
  T(s, t.datum, { x: x + 0.15, y: 2.55, w: bw - 0.3, h: 0.55, fontSize: 14, bold: true, color: t.nu ? HEX.wit : HEX.navy, valign: 'top' })
  T(s, t.wat, { x: x + 0.12, y: 3.1, w: bw - 0.24, h: 3.05, fontSize: 10, color: t.nu ? HEX.wit : HEX.zacht, valign: 'top' })
})
T(s, u.bronnoot, { x: M, y: 6.4, w: 12.1, h: 0.55, fontSize: 10, color: HEX.muted, valign: 'top' })
s.addNotes('Op de site: sectie 1, "Tijdlijn". De roze datum is de belangrijkste voor het onderwijs: de hoog-risicoverplichtingen voor Bijlage III gelden vanaf 2 december 2027, na uitstel door de Digital Omnibus.')

s = inhoud(S1, '1 · Hoe zie je de AI Act', 'Wat betekent dit voor NHL Stenden?')
kaart(s, M, 1.7, 12.1, 3.2, 'FDF2F8')
T(s, u.nhl, { x: M + 0.5, y: 2.0, w: 11.1, h: 2.6, fontSize: 20, color: HEX.tekst, valign: 'middle', lineSpacingMultiple: 1.15 })
const stappen = ['Weten welke AI er draait', 'Per systeem het risico bepalen', 'Eigenaarschap en toezicht beleggen', 'Compliance in de route van intake tot uitrol']
stappen.forEach((t, i) => {
  const w = (12.1 - 0.3 * 3) / 4, x = M + i * (w + 0.3)
  s.addShape(pres.shapes.OVAL, { x, y: 5.3, w: 0.5, h: 0.5, fill: { color: HEX.navy }, line: { color: HEX.navy } })
  T(s, String(i + 1), { x, y: 5.3, w: 0.5, h: 0.5, fontSize: 16, bold: true, color: HEX.wit, align: 'center', valign: 'middle' })
  T(s, t, { x: x + 0.65, y: 5.25, w: w - 0.7, h: 0.6, fontSize: 13, bold: true, color: HEX.navy, valign: 'middle' })
})
s.addNotes('Op de site: het roze kader onderaan sectie 1. De vier stappen onderaan deze dia zijn een samenvatting van datzelfde kader (extra).')

// ---------- 2. Verplichtingen ----------
const S2 = '2. Wat vraagt de AI Act van ons'
pres.addSection({ title: S2 })
s = pres.addSlide({ masterName: 'Sectie', sectionTitle: S2 })
s.addText('2', { placeholder: 'nummer' }); s.addText('Wat vraagt de AI Act van ons?', { placeholder: 'title' })
s.addText(`${act.verplichtingen.length} verplichtingen naast wat er in onze organisatie al staat.`, { placeholder: 'body' })
s.addNotes('Op de site: sectie 2.')

s = inhoud(S2, '2 · Extra uitleg', 'Zo lees je een verplichting')
const lees = [
  ['Kop', 'De verplichting, het artikel in de AI Act, voor welke rol hij geldt en vanaf wanneer.'],
  ['Taak', 'Wat de wet vraagt, in gewone taal.'],
  ['Wat moet het doen', 'Wat een organisatieonderdeel concreet moet regelen om de taak uit te voeren.'],
  ['Verantwoording', 'Wat je vastlegt en kunt laten zien, bijvoorbeeld bij een controle.'],
  ['Bij ons', 'Welke onderdelen op het canvas er nu al aan bijdragen, met een toelichting op de stand.'],
  ['Nog in te vullen', 'De rol of procedure die nog ontbreekt.'],
]
lees.forEach(([k, x], i) => {
  const col = i % 2, rij = Math.floor(i / 2), w = 5.9, xx = M + col * (w + 0.3), y = 1.65 + rij * 1.25
  kaart(s, xx, y, w, 1.05, HEX.grijs)
  label(s, k, xx + 0.3, y + 0.18, w - 0.6)
  T(s, x, { x: xx + 0.3, y: y + 0.45, w: w - 0.6, h: 0.55, fontSize: 13, color: HEX.tekst, valign: 'top' })
})
let cx = M
T(s, 'Stand:', { x: M, y: 5.6, w: 0.8, h: 0.3, fontSize: 12, bold: true, color: HEX.tekst, valign: 'middle' })
cx = M + 0.85
Object.values(STAND).forEach(st => { cx = chip(s, st.label, cx, 5.6, st.kleur, st.bg, true) })
T(s, act.duiding, { x: M, y: 6.1, w: 12.1, h: 0.6, fontSize: 12, color: HEX.zacht, valign: 'top' })
s.addNotes('Extra dia: legt de opbouw uit van de kaarten in sectie 2 van de site.')

const tel = { belegd: 0, deels: 0, open: 0 }; act.verplichtingen.forEach(v => tel[v.stand]++)
s = inhoud(S2, '2 · Wat vraagt de AI Act van ons', 'Overzicht: de stand van vijftien verplichtingen')
let bx = M
;['belegd', 'deels', 'open'].forEach(k => {
  if (!tel[k]) return
  const w = (tel[k] / act.verplichtingen.length) * 12.1
  s.addShape(pres.shapes.RECTANGLE, { x: bx, y: 1.6, w, h: 0.28, fill: { color: STAND[k].kleur }, line: { color: STAND[k].kleur } }); bx += w
})
cx = M
;['belegd', 'deels', 'open'].forEach(k => {
  s.addShape(pres.shapes.OVAL, { x: cx, y: 2.06, w: 0.16, h: 0.16, fill: { color: STAND[k].kleur }, line: { color: STAND[k].kleur } })
  T(s, [{ text: STAND[k].label + ': ' }, { text: String(tel[k]), options: { bold: true } }], { x: cx + 0.25, y: 1.98, w: 2.2, h: 0.32, fontSize: 13, color: HEX.tekst, valign: 'middle' })
  cx += 2.4
})
act.verplichtingen.forEach((v, i) => {
  const col = i < 8 ? 0 : 1, rij = col ? i - 8 : i, w = 5.9, x = M + col * (w + 0.3), y = 2.6 + rij * 0.5
  const st = STAND[v.stand]
  kaart(s, x, y, w, 0.42, HEX.grijs)
  s.addShape(pres.shapes.OVAL, { x: x + 0.18, y: y + 0.13, w: 0.16, h: 0.16, fill: { color: st.kleur }, line: { color: st.kleur } })
  T(s, `${i + 1}. ${v.titel}`, { x: x + 0.45, y, w: 3.75, h: 0.42, fontSize: 12, bold: true, color: HEX.tekst, valign: 'middle' })
  T(s, v.artikel.split(';')[0], { x: x + 4.2, y, w: 1.55, h: 0.42, fontSize: 10, color: HEX.navy, align: 'right', valign: 'middle' })
})
s.addNotes('Op de site: de balk bovenaan sectie 2 met de tellingen. De lijst is extra: de volgorde is gelijk aan de kaarten op de site.')

act.verplichtingen.forEach((v, i) => {
  const st = STAND[v.stand]
  const sl = inhoud(S2, `2 · Wat vraagt de AI Act van ons · ${i + 1} van ${act.verplichtingen.length}`, v.titel)
  let x = M
  x = chip(sl, v.artikel, x, 1.45, HEX.navy, HEX.blauwtint, true)
  x = chip(sl, 'voor: ' + v.rol, x, 1.45, HEX.zacht, 'F3F4F6')
  x = chip(sl, 'vanaf: ' + v.vanaf, x, 1.45, HEX.zacht, 'F3F4F6')
  const sw = st.label.length * 0.08 + 0.4
  kaart(sl, M + 12.1 - sw, 1.45, sw, 0.3, st.bg, { rectRadius: 0.15 })
  T(sl, st.label, { x: M + 12.1 - sw, y: 1.45, w: sw, h: 0.3, fontSize: 11, bold: true, color: st.kleur, align: 'center', valign: 'middle' })
  const cw = (12.1 - 0.4 * 2) / 3
  ;[['Taak', v.taak], ['Wat moet het doen', v.doen], ['Verantwoording', v.verantwoording]].forEach(([k, txt], j) => {
    const xx = M + j * (cw + 0.4)
    label(sl, k, xx, 2.05, cw)
    T(sl, txt, { x: xx, y: 2.38, w: cw, h: 2.55, fontSize: 13, color: HEX.tekst, valign: 'top', lineSpacingMultiple: 1.05 })
  })
  const heeftNog = !!v.nogInTevullen
  const by = 5.05, bh = heeftNog ? 1.2 : 1.7
  kaart(sl, M, by, 12.1, bh, HEX.grijs)
  const namen = v.bij.filter(id => IDX[id]).map(id => IDX[id].naam)
  const runs = [{ text: 'Bij ons: ', options: { bold: true, color: HEX.tekst } }]
  namen.forEach((n, k) => { runs.push({ text: n, options: { bold: true, color: HEX.navy } }); if (k < namen.length - 1) runs.push({ text: '  ·  ', options: { color: HEX.muted } }) })
  T(sl, runs, { x: M + 0.25, y: by + 0.12, w: 11.6, h: 0.45, fontSize: 12, valign: 'top' })
  T(sl, v.standToelichting, { x: M + 0.25, y: by + 0.6, w: 11.6, h: bh - 0.7, fontSize: 12, color: HEX.zacht, valign: 'top' })
  if (heeftNog) {
    kaart(sl, M, 6.38, 12.1, 0.5, STAND.open.bg)
    T(sl, 'Nog in te vullen: ' + v.nogInTevullen, { x: M + 0.25, y: 6.38, w: 11.6, h: 0.5, fontSize: 13, bold: true, color: STAND.open.kleur, valign: 'middle' })
  }
  sl.addNotes(`Op de site: sectie 2, kaart ${i + 1} "${v.titel}". Stand: ${st.label}. ${act.duiding}`)
})

// ---------- 3. Organisatie ----------
const S3 = '3. Onze organisatieonderdelen'
pres.addSection({ title: S3 })
s = pres.addSlide({ masterName: 'Sectie', sectionTitle: S3 })
s.addText('3', { placeholder: 'nummer' }); s.addText('Onze organisatieonderdelen', { placeholder: 'title' })
s.addText('Alle teams, diensten en overleggen die op het canvas staan. Per onderdeel: wat het is, het doel als een bron dat noemt, en aan welke AI Act-verplichtingen het bijdraagt.', { placeholder: 'body' })
s.addNotes('Op de site: sectie 3, met dezelfde inleidende zin.')

const perOnd = {}
act.verplichtingen.forEach(v => v.bij.forEach(id => (perOnd[id] ||= []).push(v)))
const ingedeeld = new Set(GROEPEN.flatMap(g => g[1]))
const overig = canvas.entiteiten.filter(e => e.soort === 'organisatie' && !ingedeeld.has(e.id)).map(e => e.id)
const groepen = [...GROEPEN, ...(overig.length ? [['Overig', overig]] : [])]
const PER = 4
groepen.forEach(([titel, ids]) => {
  const lijst = ids.filter(id => IDX[id])
  const n = Math.ceil(lijst.length / PER), grootte = Math.ceil(lijst.length / n)
  for (let p = 0; p < lijst.length; p += grootte) {
    const deel = lijst.slice(p, p + grootte), pnr = p / grootte + 1
    const sl = inhoud(S3, `3 · Onze organisatieonderdelen · ${titel}${n > 1 ? ` (${pnr}/${n})` : ''}`, `${titel} · ${lijst.length}`)
    const kop = { bold: true, color: HEX.muted, fontSize: 10, fill: { color: HEX.grijs } }
    const rijen = [[
      { text: 'ONDERDEEL', options: kop }, { text: 'WAT HET IS', options: kop }, { text: 'DOEL', options: kop }, { text: 'AI ACT', options: kop },
    ]]
    deel.forEach(id => {
      const e = IDX[id], vv = perOnd[id] || []
      rijen.push([
        { text: e.naam, options: { bold: true, color: HEX.tekst, fontSize: 13 } },
        { text: e.samenvatting || '', options: { color: HEX.zacht, fontSize: 12 } },
        { text: e.doel || 'niet expliciet in de bronnen', options: { color: e.doel ? HEX.tekst : '9CA3AF', fontSize: 12 } },
        vv.length ? { text: vv.map((v, k) => ({ text: v.kort, options: { color: STAND[v.stand].kleur, bold: true, breakLine: k < vv.length - 1 } })), options: { fontSize: 11.5 } }
                  : { text: 'geen directe AI Act-taak', options: { color: '9CA3AF', fontSize: 11.5 } },
      ])
    })
    sl.addTable(rijen, { x: M, y: 1.5, w: 12.1, colW: [2.55, 4.85, 3.05, 1.65], fontFace: 'Arial', valign: 'top', margin: [0.08, 0.1, 0.08, 0.1], border: { type: 'solid', pt: 0.75, color: HEX.rand } })
    sl.addNotes(`Op de site: sectie 3, groep "${titel}". De kleur in de kolom AI Act is de stand van die verplichting (zie sectie 2).`)
  }
})

s = inhoud(S3, '3 · Onze organisatieonderdelen', 'Rollen die de AI Act vraagt en die nog niet zijn belegd')
const open = act.verplichtingen.filter(v => v.nogInTevullen)
open.forEach((v, i) => {
  const col = i % 2, rij = Math.floor(i / 2), w = 5.9, x = M + col * (w + 0.3), y = 1.65 + rij * 1.4
  kaart(s, x, y, w, 1.2, STAND.open.bg)
  T(s, v.nogInTevullen, { x: x + 0.3, y: y + 0.15, w: w - 0.6, h: 0.6, fontSize: 15, bold: true, color: STAND.open.kleur, valign: 'top' })
  T(s, `${v.artikel.split(';')[0]} · ${v.titel}`, { x: x + 0.3, y: y + 0.78, w: w - 0.6, h: 0.32, fontSize: 11, color: HEX.zacht })
})
s.addNotes('Op de site: het roze kader onderaan sectie 3.')

// ---------- Afsluiting ----------
pres.addSection({ title: 'Afsluiting' })
s = inhoud('Afsluiting', 'Extra uitleg', 'Open vragen om juridisch te laten duiden')
const vragen = [
  ['Grondrechteneffectbeoordeling (art. 27)', act.verplichtingen.find(v => v.id === 'grondrechten').taak],
  ['Registratie van gebruik (art. 26 lid 8 en art. 49)', act.verplichtingen.find(v => v.id === 'registratie').taak],
  ['Datums na juli 2026', u.bronnoot],
]
vragen.forEach(([k, x], i) => {
  const y = 1.6 + i * 1.7
  kaart(s, M, y, 12.1, 1.5, HEX.grijs)
  T(s, k, { x: M + 0.3, y: y + 0.18, w: 11.5, h: 0.35, fontSize: 15, bold: true, color: HEX.navy })
  T(s, x, { x: M + 0.3, y: y + 0.58, w: 11.5, h: 0.85, fontSize: 12.5, color: HEX.zacht, valign: 'top' })
})
s.addNotes('Extra dia: de teksten komen uit de kaarten "Grondrechteneffectbeoordeling" en "Registratie van gebruik" en uit de bronnoot onder de tijdlijn op de site.')

s = inhoud('Afsluiting', 'Bronnen', 'Bronnen')
const bronnen = canvas.bronnenlijst.filter(g => g.groep !== 'Sector en onderzoek' || true)
const kolommen = [bronnen.filter((_, i) => i % 2 === 0), bronnen.filter((_, i) => i % 2 === 1)]
kolommen.forEach((gs, c) => {
  let y = 1.5
  gs.forEach(g => {
    label(s, g.groep, M + c * 6.2, y, 5.9); y += 0.32
    g.items.forEach(b => {
      const r = b.url ? [{ text: b.t, options: { hyperlink: { url: b.url }, color: '2563EB' } }] : [{ text: b.t, options: { color: HEX.tekst } }]
      if (b.noot) r.push({ text: ' · ' + b.noot, options: { color: HEX.muted } })
      T(s, r, { x: M + c * 6.2, y, w: 5.9, h: 0.36, fontSize: 10.5, valign: 'top' }); y += 0.36
    })
    y += 0.15
  })
})
T(s, 'Geen juridisch advies. Bij elk onderdeel op het canvas staat de eigen bron in het detailpaneel.', { x: M, y: 6.65, w: 12.1, h: 0.3, fontSize: 10, color: HEX.muted })
s.addNotes('Op de site: de sectie "Bronnen" op de pagina Over. De links zijn klikbaar.')

;(async () => {
  await pres.writeFile({ fileName: UIT })
  if (applyTheme) await applyTheme(UIT, THEME)
  console.log('geschreven:', UIT)
})()
