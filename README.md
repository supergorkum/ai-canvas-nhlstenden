# AI Canvas NHL Stenden

De landkaart van alle AI-activiteiten binnen NHL Stenden: teams, projecten, pilots,
initiatieven, beleid en externe samenwerkingen, en hoe ze met elkaar verbonden zijn.

- **Canvas** (startpagina, past op één A4): zes sporen, Koers & Kaders en Extern als vakken met aantallen en de dragende onderdelen. Klik een vak voor laag 2: alle onderdelen van dat spoor met hun verbanden in tekst.
- **Samenhang** (A3): koordendiagram van de verbindingen tussen de sporen, met de tien dragers ernaast.
- **Treinnetwerk** (A3): de dragers als treinlijnen, de verbonden onderdelen als stations, overstapstations waar lijnen samenkomen, met een dienstregeling.
- **Verbanden**: in het midden *Koers & Kaders*, daaromheen de zes sporen van het AI Netwerk als eilanden,
  op de buitenbaan de externe samenwerkingen. Klik voor details, verbindingen en een plusknop om aan te vullen.
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
| `src/layout.js` | plaatsing op de landkaart |
| `src/components/` | Landkaart, Detailpaneel, Meldformulier, Overzicht, Over |
| `scripts/valideer.mjs` | controle op de gegevens, draait bij elke build |
| `docs/REDACTIERONDE.md` | werkinstructie van de terugkerende ronde |
| `docs/SHAREPOINT.md` | vertaling naar SharePoint-lijsten en een SPFx-webpart |

Huisstijl en sporen zijn overgenomen van het AI Netwerk NHL Stenden.
