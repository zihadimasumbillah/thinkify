/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Thinkify Neon Cyberpunk Color Palette
        primary: {
          DEFAULT: '#4ADE80', // Neon Green
          50: '#E8FDF0',
          100: '#D1FBE1',
          200: '#A3F7C3',
          300: '#75F3A5',
          400: '#5CE992',
          500: '#4ADE80',
          600: '#22C55E',
          700: '#16A34A',
          800: '#15803D',
          900: '#166534',
        },
        dark: {
          DEFAULT: '#121212', // Deep Matte Charcoal
          50: '#2A2A2A',
          100: '#252525',
          200: '#202020',
          300: '#1A1A1A',
          400: '#151515',
          500: '#121212',
          600: '#0E0E0E',
          700: '#0A0A0A',
          800: '#060606',
          900: '#030303',
        },
        accent: {
          purple: '#A855F7',
          blue: '#3B82F6',
          pink: '#EC4899',
          cyan: '#22D3D8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 5px theme(colors.primary.DEFAULT), 0 0 20px theme(colors.primary.DEFAULT)',
        'neon-lg': '0 0 10px theme(colors.primary.DEFAULT), 0 0 40px theme(colors.primary.DEFAULT), 0 0 80px theme(colors.primary.DEFAULT)',
        'neon-purple': '0 0 5px theme(colors.accent.purple), 0 0 20px theme(colors.accent.purple)',
        'inner-glow': 'inset 0 0 20px rgba(74, 222, 128, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #4ADE80, 0 0 10px #4ADE80' },
          '100%': { boxShadow: '0 0 10px #4ADE80, 0 0 30px #4ADE80' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-grid': 'linear-gradient(rgba(74, 222, 128, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(74, 222, 128, 0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '50px 50px',
      },
    },
  },
  plugins: [],
};
