// DE SERVICE WORKER van het AI Canvas.
//
// WAAROM HIJ ER IS. Chrome, Edge en Samsung Internet bieden alleen een echte
// installatieknop aan (beforeinstallprompt) als er een service worker met een
// fetch-handler staat. Dezelfde reden als bij Sepupu.
//
// WAT HIJ ANDERS DOET DAN BIJ SEPUPU. Sepupu bewaart niets, omdat
// familiegegevens nooit verouderd mogen zijn. Het canvas is een statische
// site: de gegevens staan in een paar JSON-bestanden die bij elke publicatie
// worden vervangen. Daarom bewaart deze worker wel een kopie, maar altijd als
// tweede keus: eerst het net, en alleen als dat niet lukt de laatst
// opgehaalde versie. Zo zie je met verbinding altijd de nieuwste stand, en
// zonder verbinding (in de trein, in een zaal zonder wifi) toch het canvas.
//
// Bewust buiten schot: alles wat geen GET is (het meldformulier) en alles van
// een ander domein (lettertypes, externe links).

const CACHE = 'ai-canvas-v1'
const OFFLINE = './offline.html'

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll([new Request(OFFLINE, { cache: 'reload' }), new Request('./', { cache: 'reload' })]))
      .catch(() => {})
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(namen => Promise.all(namen.filter(n => n !== CACHE).map(n => caches.delete(n))))
      .catch(() => {})
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const v = event.request
  if (v.method !== 'GET') return
  const url = new URL(v.url)
  if (url.origin !== self.location.origin) return
  event.respondWith(
    fetch(v)
      .then(antwoord => {
        if (antwoord && antwoord.ok) {
          const kopie = antwoord.clone()
          caches.open(CACHE).then(c => c.put(v, kopie)).catch(() => {})
        }
        return antwoord
      })
      .catch(() =>
        caches.match(v, { ignoreSearch: v.mode === 'navigate' }).then(bewaard => {
          if (bewaard) return bewaard
          if (v.mode === 'navigate') return caches.match('./').then(r => r || caches.match(OFFLINE))
          return new Response('', { status: 503 })
        })
      )
  )
})
