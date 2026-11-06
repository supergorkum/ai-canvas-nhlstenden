# AI Canvas NHL Stenden

De landkaart van alle AI-activiteiten binnen NHL Stenden: teams, projecten, pilots,
initiatieven, beleid en externe samenwerkingen, en hoe ze met elkaar verbonden zijn.

- **Canvas** (startpagina, past op één A4): zes sporen, Koers & Kaders en Extern als vakken met aantallen en de dragende onderdelen. Klik een vak voor laag 2: alle onderdelen van dat spoor met hun verbanden in tekst.
- **Samenhang** (A3): koordendiagram van de verbindingen tussen de sporen, met de tien dragers ernaast.
- **Treinnetwerk** (A3): de realisatie van de AI-Koers als spoorkaart. Zes koerslijnen en de sandbox rijden door de drie golven (funderen, uitbouwen, verankeren) naar hun indicator voor 2030; de stations zijn de mijlpalen uit de tijdlijn (`public/data/koers.json`). Dienstregeling op de achterkant.
- **Organisatie & AI Act**: uitleg hoe je de AI Act leest (risiconiveaus, rollen, tijdlijn inclusief de Digital Omnibus), vijftien verplichtingen met taak, uitvoering, verantwoording en de stand bij NHL Stenden, en alle organisatieonderdelen met doel en AI Act-bijdrage (`public/data/aiact.json`).
- **Meld activiteit**: formulier in vier stappen (Netlify Forms, `meld-activiteit`).
- **Zuiver**: elk onderdeel heeft een herkomst en bron; meldingen staan tot bevestiging met een stippellijn.

## Werken

```bash
npm ci
npm run dev       # lokaal bekijken
npm run build     # valideert public/data/canvas.json en bouwt naar dist/
```

## Structuur

| Pad | Wat |
|---|---|
| `public/data/canvas.json` | alle gegevens: `entiteiten`, `relaties`, `aanvullingen`, `logboek`, `meta` |
| `src/model.js` | soorten, sporen, herkomst, relatiesoorten (de keuzelijsten) |
| `public/data/aiact.json` | AI Act-uitleg en verplichtingen, gekoppeld aan onderdelen op het canvas |
| `public/data/koers.json` | koerslijnen, mijlpalen per golf en indicatoren uit de AI-Koers (leidend: v0.55d) |
| `src/components/` | Canvas, Spoorblad, Samenhang, Treinnetwerk, Detailpaneel, Meldformulier, Overzicht, Over |
| `scripts/valideer.mjs` | controle op de gegevens, draait bij elke build |
| `docs/REDACTIERONDE.md` | werkinstructie van de terugkerende ronde |
| `docs/SHAREPOINT.md` | vertaling naar SharePoint-lijsten en een SPFx-webpart |

Huisstijl en sporen zijn overgenomen van het AI Netwerk NHL Stenden.
