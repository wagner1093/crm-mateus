import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['var(--font-sans)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        heading: ['var(--font-sans)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'DM Mono', 'ui-monospace', 'monospace'],
        dmsans:  ['var(--font-dmsans)', 'DM Sans', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--text-1)",
        primary: {
          DEFAULT: "#2563EB",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#A1A1AA",
          foreground: "#52525B",
        },
        border: "rgba(0,0,0,0.07)",
        ring: "#2563EB",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#111118",
        }
      },
      borderRadius: {
        'sm':  '6px',
        'DEFAULT': '8px',
        'md':  '10px',
        'lg':  '12px',
        'xl':  '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        'xs':  '0 1px 2px rgba(0,0,0,0.05)',
        'sm':  '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'DEFAULT': '0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'md':  '0 4px 16px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04)',
        'lg':  '0 8px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)',
        'xl':  '0 16px 40px rgba(0,0,0,0.10), 0 8px 16px rgba(0,0,0,0.06)',
        'none': 'none',
      },
      fontSize: {
        'xxs': ['10px', { lineHeight: '14px', letterSpacing: '0.04em' }],
        'xs':  ['11px', { lineHeight: '16px' }],
        'sm':  ['13px', { lineHeight: '20px' }],
        'base':['14px', { lineHeight: '22px' }],
        'md':  ['15px', { lineHeight: '22px' }],
        'lg':  ['17px', { lineHeight: '26px', letterSpacing: '-0.01em' }],
        'xl':  ['20px', { lineHeight: '28px', letterSpacing: '-0.02em' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.025em' }],
        '3xl': ['30px', { lineHeight: '38px', letterSpacing: '-0.03em' }],
      },
    },
  },
  plugins: [],
};
export default config;
