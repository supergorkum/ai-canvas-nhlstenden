import Logo from './Logo.jsx'
// Kop die alleen op papier verschijnt, binnen het blad zelf zodat A3 en A4 niet van pagina wisselen.
export default function PrintKop() {
  return (
    <div className="hidden print:flex items-center gap-2 pb-1 mb-2 border-b border-gray-300">
      <Logo kleur="zwart" className="h-12 w-auto" />
      <span className="w-px h-8 bg-gray-400" aria-hidden="true" />
      <span className="font-extrabold text-lg text-black">AI Canvas</span>
    </div>
  )
}
