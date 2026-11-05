/** Huisstijl overgenomen van het AI Netwerk NHL Stenden */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        nhl: {
          nacht: '#0F1E52',
          blauw: '#1E3A8A',
          'blauw-dark': '#162D6E',
          'blauw-light': '#2563EB',
          roze: '#E91E8C',
          'roze-light': '#F472B6',
          'roze-dark': '#BE185D',
          grijs: '#F8F9FB',
          'grijs-mid': '#E2E8F0',
          'grijs-donker': '#64748B',
        },
      },
      fontFamily: { sans: ['Inter', 'Arial', 'sans-serif'] },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideIn: { '0%': { transform: 'translateX(24px)', opacity: 0 }, '100%': { transform: 'translateX(0)', opacity: 1 } },
        slideUp: { '0%': { transform: 'translateY(16px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
      },
      animation: { 'fade-in': 'fadeIn .25s ease-out', 'slide-in': 'slideIn .3s ease-out', 'slide-up': 'slideUp .3s ease-out' },
    },
  },
  plugins: [],
}
