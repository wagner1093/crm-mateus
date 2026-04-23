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
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'Montserrat', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#007AFF", // Apple Blue
          foreground: "#FFFFFF",
        },
        sidebar: {
          DEFAULT: "rgba(255, 255, 255, 0.7)",
          foreground: "#1D1D1F",
          accent: "#F5F5F7",
        },
        muted: {
          DEFAULT: "#8E8E93",
          foreground: "#636366",
        },
        border: "rgba(0, 0, 0, 0.1)",
        ring: "#007AFF",
        card: {
          DEFAULT: "rgba(255, 255, 255, 0.6)",
          foreground: "#1D1D1F",
          border: "rgba(255, 255, 255, 0.3)",
        }
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        'apple': '20px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      }
    },
  },
  plugins: [],
};
export default config;
