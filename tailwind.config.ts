import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:      '#03050d',
        bg2:     '#070a18',
        bg3:     '#0c1028',
        blue:    '#4a9eff',
        orange:  '#ff8c3a',
        green:   '#3affb0',
        pink:    '#ff4a7a',
        purple:  '#c084ff',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        serif: ['Crimson Pro', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
