/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          dark: '#2563EB',
          light: '#60A5FA',
        },
        secondary: {
          DEFAULT: '#06B6D4',
          dark: '#0891B2',
        },
        accent: {
          DEFAULT: '#22C55E',
          dark: '#16A34A',
        },
        danger: {
          DEFAULT: '#EF4444',
          dark: '#DC2626',
        },
        warning: '#F59E0B',
        'bg-dark': '#0B1220',
        'bg-card': '#111827',
        'bg-card-2': '#1a2235',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3B82F6, #06B6D4)',
        'gradient-accent': 'linear-gradient(135deg, #22C55E, #06B6D4)',
        'gradient-danger': 'linear-gradient(135deg, #EF4444, #DC2626)',
        'gradient-gold': 'linear-gradient(135deg, #F59E0B, #EF4444)',
      },
      animation: {
        'gradient-shift': 'gradientShift 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
      },
      boxShadow: {
        'glow-blue': '0 0 30px rgba(59, 130, 246, 0.15), 0 0 60px rgba(59, 130, 246, 0.05)',
        'glow-green': '0 0 30px rgba(34, 197, 94, 0.15), 0 0 60px rgba(34, 197, 94, 0.05)',
        'glow-red': '0 0 30px rgba(239, 68, 68, 0.15), 0 0 60px rgba(239, 68, 68, 0.05)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
