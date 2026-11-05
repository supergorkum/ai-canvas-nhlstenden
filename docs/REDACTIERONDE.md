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
4. **AI Netwerk-site.** Clone `supergorkum/ai-netwerk-nhlstenden` (branch `main`, alleen lezen, nooit naar pushen); bekijk de diff sinds
   `meta.aiNetwerkCommit` in `src/` en verwerk nieuwe of gewijzigde initiatieven, pilots, teams en beleid.
5. **Websites.** Probeer `www.nhlstenden.com` (nieuws, onderzoek/lectoraten) en `intranet.nhlstenden.com`.
   Lukt dat niet (netwerk of inloggen), noteer dat in `meta.bronnen` en ga door.
6. **Controleren.** `npm run build` (draait `scripts/valideer.mjs`). Bij fouten: herstellen, nooit forceren.
7. **Vastleggen.** Werk `meta.bijgewerkt` bij, voeg één regel toe aan `logboek`
   (wat is toegevoegd, aangevuld, verplaatst, en wat te controleren is). Commit en push naar `main` van `ai-canvas-nhlstenden`.
8. **Live zetten.** Netlify bouwt automatisch na de push (zodra de repo is gekoppeld).
9. **Rapport.** Sluit af met een korte samenvatting voor Edgar: nieuw, aangevuld, te controleren.

## Regels voor zuiverheid

- Niets verzinnen: geen namen, rollen, data of verbindingen die niet in de bron staan.
- Elke wijziging krijgt een `bronLabel`.
- Persoonsnamen alleen als ze in een bron staan of de melder toestemming gaf.
- Twijfel → logboek "te controleren", niet op de kaart.
