# Redactieronde AI Canvas NHL Stenden

Dit is de vaste werkinstructie voor de terugkerende ronde die het canvas bijhoudt.
De ronde draait als geplande taak in Claude Code en volgt deze stappen in deze volgorde.
Uitgangspunt: **zuiver**. Alleen opnemen wat in een bron staat; bij twijfel niet opnemen
maar noteren in het logboek als "te controleren".

## Vaste gegevens

| Wat | Waarde |
|---|---|
| Code en data | GitHub `supergorkum/ai-canvas-nhlstenden`, branch `main` |
| Bron AI Netwerk | GitHub `supergorkum/ai-netwerk-nhlstenden`, branch `main` (alleen lezen) |
| Gegevensbestand | `public/data/canvas.json` |
| Netlify-project | `ai-canvas-nhlstenden` (site-id `90626f00-a6df-4085-bff5-6e5deb500269`) |
| Formulier | Netlify Forms, naam `meld-activiteit` |
| Drive-map | `AI Canvas NHL Stenden` (id `1CPbJ0-Jo8PxYjFV1iiSMNsqXHSRV34Uh`) |
| Inbox | `00 Inbox - zet hier nieuwe stukken` (id `1D-f8HCzoemmmQANEoNwbqw-S2FHBQRIK`) |
| Verwerkt | `10 Verwerkt` (id `1eoggNLg-cmbkytj_fV34D1y1mpPFNxVe`) met submappen hieronder |

Submappen van `10 Verwerkt`:

| Map | id | Voor |
|---|---|---|
| Beleid en kaders | `1JSxMPH5GEHQ5MSzPF-Y4stPL8hsb1B2D` | soort `beleid` |
| Projecten en pilots | `1Iy1F_IzT8fAPRFKHH1mokWwnKiAG6HC-` | `project`, `pilot`, `initiatief`, `opdracht` |
| Teams en organisatie | `1D_CjGh5LaXbg5ldiM9G2gqeXcvMCpGIF` | `organisatie` |
| Extern (SURF, Npuls, EduGen e.a.) | `1f3_B1eTqrwRenl9S8swG0FuYQpmYyXCS` | `extern` |
| Evenementen en verslagen | `1Fyz0FgOB2tYtSN5AL5yQGlajczwRU1wG` | `evenement`, verslagen |
| Overig en niet te plaatsen | `1jzaXNxvPtqCTMzec-sQcn_BBxW3Ah2Ow` | alles wat niet past |

Bij veel stukken over één onderwerp (bijv. vijf documenten over Npuls) maakt de ronde
binnen de passende map een submap met de naam van dat onderdeel.

## Stappen

1. **Ophalen.** Clone `supergorkum/ai-canvas-nhlstenden` (branch `main`), `npm ci`.
2. **Drive-inbox.** Lees elk bestand in de inbox. Per bestand:
   - Bepaal welke onderdelen (teams, pilots, beleid, partners, evenementen) erin genoemd worden
     en welke verbindingen er expliciet staan.
   - Bestaat het onderdeel al (vergelijk naam en synoniemen): vul aan, verander niets wat
     uit een andere bron komt zonder dat het document het tegenspreekt; noteer tegenspraak in het logboek.
   - Nieuw onderdeel: voeg toe met `herkomst: "drive"`, `bronLabel: "Drive: <bestandsnaam>"`,
     en een link naar het document.
   - Verplaats het bestand naar de passende submap van `10 Verwerkt` (`update_file` met `parentId`).
3. **Meldingen.** Haal nieuwe inzendingen op van formulier `meld-activiteit`
   (Netlify MCP, `manage-form-submissions`). Vergelijk met `meta.laatsteMelding`.
   - Nieuwe melding → onderdeel met `herkomst: "melding"` (stippellijn op de kaart).
   - `aanvulling_op` gevuld → item in `aanvullingen` bij dat onderdeel.
   - Contactpersoon alleen tonen als `naam_tonen = ja`. E-mailadressen **nooit** in canvas.json.
   - Melding die door een document of de AI Netwerk-site wordt bevestigd: herkomst ophogen naar die bron.
   - **Bron eerst.** Het formulier vraagt om een link, een toelichting ("Hoe weet je dit?") of het vinkje dat er geen bron is
     (velden `link`, `bron_hoe`, `bron_ontbreekt`). Per mail vraag je met `docs/MELDEN-PER-MAIL.md` om een bron. Open de bron zelf
     en vergelijk. Klopt het: noteer in `bronnen` van het onderdeel (uitkomst `bevestigd`, datum van controle) en verhoog de herkomst.
     Geen of niet te controleren bron: laat de melding op `herkomst: "melding"` staan en zet de uitkomst op `niet te controleren`.
4. **AI Netwerk-site.** Clone `supergorkum/ai-netwerk-nhlstenden` (branch `main`, alleen lezen, nooit naar pushen); bekijk de diff sinds
   `meta.aiNetwerkCommit` in `src/` en verwerk nieuwe of gewijzigde initiatieven, pilots, teams en beleid.
5. **Websites.** Probeer `www.nhlstenden.com` (nieuws, onderzoek/lectoraten) en `intranet.nhlstenden.com`.
   Lukt dat niet (netwerk of inloggen), noteer dat in `meta.bronnen` en ga door.
6. **Controleren.** `npm run build` (draait `scripts/valideer.mjs`). Bij fouten: herstellen, nooit forceren.
7. **Vastleggen.** Werk `meta.bijgewerkt` bij, voeg één regel toe aan `logboek`
   (wat is toegevoegd, aangevuld, verplaatst, en wat te controleren is). Commit en push naar `main` van `ai-canvas-nhlstenden`.
8. **Live zetten.** Netlify bouwt automatisch na de push (zodra de repo is gekoppeld).
9. **Rapport.** Sluit af met een korte samenvatting voor Edgar: nieuw, aangevuld, te controleren.

## Leidende bron

De AI-Koers is leidend voor taal en inhoud (nu versie 0.55d, Drive-bestand `CONCEPT NHL Stenden AI-Koers v0.55d.pdf`).
Komt er een nieuwe koersversie in de inbox: werk `public/data/koers.json` bij (koerslijnen, mijlpalen per golf,
indicatoren) en breng `canvas.json` in lijn met de nieuwe terminologie. Waar de AI Netwerk-site afwijkt van de koers,
volgt het canvas de koers en staat het verschil in het logboek.

## AI Act-overzicht

`public/data/aiact.json` koppelt de verplichtingen uit de AI Act aan onderdelen op het canvas. Komt er een nieuw
onderdeel bij dat een verplichting invult (bijvoorbeeld een meldprocedure voor AI-incidenten of een aangewezen
AI-officer), voeg het id toe aan `bij` en werk `stand` en `standToelichting` bij. De stand blijft een duiding van de
redactie; bevestiging door het AI Compliance Team gaat in het logboek.

## Bronnen en controle per onderdeel

Elk onderdeel heeft een lijst `bronnen` (label, url, soort, gecontroleerd, uitkomst, noot). In het canvas staat dit uitklapbaar in het
detailpaneel. Uitkomst `bevestigd` mag alleen met een datum en, bij niet-interne bronnen, een link die je zelf hebt geopend of in een zoekresultaat
hebt gezien. Per ronde ga je een aantal onderdelen met `nog niet gecontroleerd` na, te beginnen bij de externe en die met cijfers of data.
Verandert de bron? Pas de inhoud aan en noteer oud en nieuw in het logboek.

## Regels voor zuiverheid

- Niets verzinnen: geen namen, rollen, data of verbindingen die niet in de bron staan.
- Elke wijziging krijgt een `bronLabel`.
- Persoonsnamen alleen als ze in een bron staan of de melder toestemming gaf.
- Twijfel → logboek "te controleren", niet op de kaart.
