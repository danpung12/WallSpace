// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#83B4F9',
          emphasis: '#4880EE',
          light: '#c0d9ff',
        },
        border: '#d1d5db',
        background: '#ffffff',
        foreground: '#111827',
        ring: '#4880EE',
      },
      fontFamily: {
        sans: ['Pretendard', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
