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
        notion: {
          bg: '#FFFFFF',
          sidebar: '#F7F7F5',
          hover: '#F0F0EE',
          border: '#E8E8E5',
          border2: '#EBEBEA',
          text: '#191919',
          muted: '#6B6B6B',
          faint: '#A0A0A0',
          accent: '#2383E2',
          'accent-hover': '#1a6fc9',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
};

export default config;
