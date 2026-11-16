// Logo NHL Stenden (zo_NL, CMYK-bestanden van de huisstijl). Wit op donkerblauw, zwart op wit.
const BASIS = import.meta.env.BASE_URL
export default function Logo({ kleur = 'wit', className = '' }) {
  return <img src={`${BASIS}logo-nhl-stenden-${kleur}.png`} alt="NHL Stenden" className={className} width="900" height="549" draggable="false" />
}
