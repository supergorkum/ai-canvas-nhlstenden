# Van prototype naar SharePoint

Het prototype is zo opgezet dat de stap naar SharePoint klein blijft.

## Gegevens: drie lijsten

`canvas.json` heeft dezelfde vorm als drie SharePoint-lijsten:

| SharePoint-lijst | Bron in canvas.json | Kolommen |
|---|---|---|
| **AI-onderdelen** | `entiteiten[]` | Titel (`naam`), Soort (keuze: zie `SOORTEN` in `src/model.js`), Spoor (keuze: `SPOREN`), Status (keuze), Samenvatting (tekst), Details (meerregelig), Eigenaar (tekst of opzoeken), Periode, Mensen (personen of groepen), Links (hyperlink), Herkomst (keuze: `HERKOMST`), Bron (tekst), Sleutel (`id`) |
| **AI-verbindingen** | `relaties[]` | Van (opzoeken naar AI-onderdelen), Naar (opzoeken), Soort relatie (keuze: `RELATIESOORTEN`), Herkomst |
| **AI-meldingen** | Netlify Forms `meld-activiteit` | dezelfde velden als het formulier; Microsoft Forms of een SharePoint-lijstformulier kan dit overnemen |

## Weergave

- De landkaart is een React-component (`src/components/Landkaart.jsx`) zonder externe bibliotheken.
  Die past direct in een **SPFx-webpart** (SharePoint Framework gebruikt ook React).
  In de webpart wordt `fetch('./data/canvas.json')` vervangen door een PnPjs-aanroep op de twee lijsten.
- Huisstijlkleuren staan in `tailwind.config.js` en `src/model.js`.

## Redactieronde

De terugkerende ronde (`docs/REDACTIERONDE.md`) kan in SharePoint draaien als Power Automate-flow:
nieuwe melding → goedkeuring door redactie → item in AI-onderdelen. De Drive-inbox wordt dan een
SharePoint-documentbibliotheek met dezelfde mappen.
