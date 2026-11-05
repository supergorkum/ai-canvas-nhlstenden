// Gedeelde begrippen van het AI Canvas. Dit bestand is de 'vertaaltabel' die later
// één-op-één terugkomt als keuzelijsten in SharePoint (zie docs/SHAREPOINT.md).

export const SOORTEN = {
  organisatie: { label: 'Team & organisatie', meervoud: 'Teams & organisaties', icon: '👥', kleur: '#1E3A8A' },
  beleid:      { label: 'Beleid & kader',     meervoud: 'Beleid & kaders',      icon: '📜', kleur: '#E91E8C' },
  project:     { label: 'Project',            meervoud: 'Projecten',            icon: '🛠️', kleur: '#2563EB' },
  pilot:       { label: 'Pilot',              meervoud: 'Pilots',               icon: '🧪', kleur: '#0E7490' },
  initiatief:  { label: 'Initiatief',         meervoud: 'Initiatieven',         icon: '✨', kleur: '#7C3AED' },
  opdracht:    { label: 'Opdracht',           meervoud: 'Opdrachten',           icon: '📌', kleur: '#9333EA' },
  extern:      { label: 'Extern',             meervoud: 'Externe samenwerkingen', icon: '🌐', kleur: '#B45309' },
  evenement:   { label: 'Evenement',          meervoud: 'Evenementen',          icon: '📅', kleur: '#0F766E' },
  tool:        { label: 'Tool & platform',    meervoud: 'Tools & platforms',    icon: '🧩', kleur: '#475569' },
}

// De zes sporen uit het AI Netwerk (src/data.js), met dezelfde kleuren.
export const SPOREN = {
  leren:                { titel: 'AI & Leren',               kort: 'Leren',        icon: '🎓', kleur: '#1E3A8A' },
  werken:               { titel: 'AI & Werken',              kort: 'Werken',       icon: '⚙️', kleur: '#0F766E' },
  verantwoordelijkheid: { titel: 'AI & Verantwoordelijkheid', kort: 'Verantwoord.', icon: '⚖️', kleur: '#E91E8C' },
  geletterdheid:        { titel: 'AI & Geletterdheid',       kort: 'Geletterdheid', icon: '📖', kleur: '#7C3AED' },
  werkveld:             { titel: 'AI & Werkveld',            kort: 'Werkveld',     icon: '🏭', kleur: '#B45309' },
  onderzoek:            { titel: 'AI & Onderzoek',           kort: 'Onderzoek',    icon: '🔬', kleur: '#0E7490' },
}

// Herkomst van een gegeven: hiermee blijft het canvas 'zuiver'.
export const HERKOMST = {
  'ai-netwerk': { label: 'AI Netwerk', uitleg: 'Overgenomen uit de AI Netwerk-site (ai-netwerk-nhlstenden.netlify.app).', kleur: '#1E3A8A', geverifieerd: true },
  'drive':      { label: 'Document',   uitleg: 'Afgeleid uit een document in de Drive-map AI Canvas.', kleur: '#0F766E', geverifieerd: true },
  'website':    { label: 'Website',    uitleg: 'Gevonden op nhlstenden.com of het intranet.', kleur: '#0E7490', geverifieerd: true },
  'melding':    { label: 'Melding',    uitleg: 'Gemeld via het formulier; nog niet door de redactie bevestigd.', kleur: '#B45309', geverifieerd: false },
  'redactie':   { label: 'Redactie',   uitleg: 'Toegevoegd door de redactie van het canvas.', kleur: '#475569', geverifieerd: true },
}

export const STATUS = {
  lopend: 'Lopend', 'in ontwikkeling': 'In ontwikkeling', verkenning: 'Verkenning', gepland: 'Gepland', afgerond: 'Afgerond', vastgesteld: 'Vastgesteld', concept: 'Concept', actief: 'Actief',
}

// Soorten die je via het formulier kunt melden (uitgebreider dan de kaartsoorten).
export const MELDSOORTEN = [
  { id: 'activiteit', label: 'Activiteit', icon: '⚡', uitleg: 'Iets wat je doet of organiseert met AI', kaart: 'initiatief' },
  { id: 'pilot', label: 'Pilot', icon: '🧪', uitleg: 'Een afgebakende proef met een AI-toepassing', kaart: 'pilot' },
  { id: 'initiatief', label: 'Initiatief', icon: '✨', uitleg: 'Een idee of beweging die op gang komt', kaart: 'initiatief' },
  { id: 'opdracht', label: 'Opdracht', icon: '📌', uitleg: 'Een opdracht van bestuur, directie of werkveld', kaart: 'opdracht' },
  { id: 'ai-team', label: 'AI-team', icon: '👥', uitleg: 'Een team, werkgroep of community rond AI', kaart: 'organisatie' },
  { id: 'organisatie', label: 'Organisatie of gremium', icon: '🏛️', uitleg: 'Academie, dienst, lectoraat of overleg', kaart: 'organisatie' },
  { id: 'beleid', label: 'Beleidsstuk', icon: '📜', uitleg: 'Beleid, kader, richtlijn of notitie', kaart: 'beleid' },
  { id: 'extern', label: 'Externe samenwerking', icon: '🌐', uitleg: 'SURF, Npuls, EduGen, werkveldpartner…', kaart: 'extern' },
  { id: 'evenement', label: 'Evenement', icon: '📅', uitleg: 'Bijeenkomst, webinar of training', kaart: 'evenement' },
  { id: 'anders', label: 'Iets anders', icon: '💡', uitleg: 'Past het nergens? Meld het toch', kaart: 'initiatief' },
]

export const RELATIESOORTEN = [
  'heeft opgesteld', 'is onderdeel van', 'werkt samen met', 'voert uit', 'valt onder',
  'neemt deel aan', 'levert input aan', 'gebruikt', 'financiert', 'is verbonden met',
]

// Leesbare tegenrichting, zodat een relatie vanaf beide kanten klopt.
export const OMGEKEERD = {
  'heeft opgesteld': 'is opgesteld door',
  'is onderdeel van': 'omvat',
  'werkt samen met': 'werkt samen met',
  'voert uit': 'wordt uitgevoerd door',
  'valt onder': 'heeft onder zich',
  'neemt deel aan': 'heeft als deelnemer',
  'levert input aan': 'krijgt input van',
  'gebruikt': 'wordt gebruikt door',
  'financiert': 'wordt gefinancierd door',
  'is verbonden met': 'is verbonden met',
  'trekt': 'wordt getrokken door',
  'rapporteert aan': 'krijgt rapportage van',
  'is gebaseerd op': 'is basis voor',
  'ondersteunt': 'wordt ondersteund door',
  'adviseert': 'wordt geadviseerd door',
  'onderzoekt': 'wordt onderzocht door',
  'beschrijft': 'wordt beschreven in',
  'organiseert': 'wordt georganiseerd door',
  'omvat': 'is onderdeel van',
  'heeft vastgesteld': 'is vastgesteld door',
  'stelt vast': 'wordt vastgesteld door',
  'publiceert': 'wordt gepubliceerd door',
  'is opdrachtgever van': 'heeft als opdrachtgever',
}

// Leesbaar vanaf de andere kant, ook voor relatiesoorten die (nog) niet in de tabel staan.
export const omgekeerd = soort => OMGEKEERD[soort] || `← ${soort}`
