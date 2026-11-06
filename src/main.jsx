import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)

// De service worker (public/sw.js): nodig voor het installatie-aanbod en om het
// canvas zonder verbinding te kunnen openen. Na het laden, zodat hij de eerste
// weergave niet vertraagt; een browser die het niet kent merkt er niets van.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    try { navigator.serviceWorker.register('./sw.js').catch(() => {}) } catch { /* geen installatie-aanbod, verder niets */ }
  })
}
