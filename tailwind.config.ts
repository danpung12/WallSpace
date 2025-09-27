import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'theme-brown-lightest': '#F5F3F0',
        'theme-brown-light': '#E9E4DD',
        'theme-brown-medium': '#D4C8B8',
        'theme-brown-dark': '#A18F79',
        'theme-brown-darkest': '#4D4337',
      },
      fontFamily: {
        display: ['Pretendard', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
};
export default config;
