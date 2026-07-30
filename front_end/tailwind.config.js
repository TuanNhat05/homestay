/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        ink: '#e2e8f0',
        'ink-muted': '#94a3b8',
        'ink-dim': '#64748b',
        surface: {
          DEFAULT: '#0f172a',
          card: 'rgba(30, 41, 59, 0.7)',
          hover: 'rgba(51, 65, 85, 0.5)',
          border: 'rgba(148, 163, 184, 0.12)',
        },
        pine: '#34d399',
        'pine-deep': '#059669',
        coral: '#fb7185',
        amber: '#fbbf24',
        ocean: '#38bdf8',
        violet: '#a78bfa',
        sidebar: {
          from: '#0f172a',
          to: '#1e1b4b',
        },
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(30,41,59,0.4) 100%)',
        'gradient-pine': 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
        'gradient-violet': 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
        'gradient-amber': 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
        'gradient-coral': 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)',
        'gradient-login': 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #134e4a 100%)',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.3)',
        glow: '0 0 20px rgba(52, 211, 153, 0.15)',
        'glow-ocean': '0 0 20px rgba(56, 189, 248, 0.15)',
        'glow-violet': '0 0 20px rgba(167, 139, 250, 0.15)',
        card: '0 4px 24px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        pulse_dot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out both',
        slideIn: 'slideIn 0.3s ease-out both',
        scaleIn: 'scaleIn 0.3s ease-out both',
        'pulse-dot': 'pulse_dot 2s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
