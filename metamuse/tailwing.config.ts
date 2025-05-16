import { Config } from "tailwindcss";

const config: Config = {
  // Make sure the base directives are included
  darkMode: "class",
  theme: {
    // Make sure you're not completely overriding the base theme
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Base brand colors
        "ink-blue": "var(--ink-blue)",
        "sunset-orange": "var(--sunset-orange)",
        "aqua-blue": "var(--aqua-blue)",
        "off-white": "var(--off-white)",
        "deep-teal": "var(--deep-teal)",

        // Semantic colors
        primary: "var(--primary)",
        "on-primary": "var(--on-primary)",
        secondary: "var(--secondary)",
        "on-secondary": "var(--on-secondary)",
        tertiary: "var(--tertiary)",
        "on-tertiary": "var(--on-tertiary)",

        // UI colors
        background: "var(--background)",
        surface: "var(--surface)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-on-secondary": "var(--text-on-secondary)",
        "text-on-tertiary": "var(--text-on-tertiary)",
        "text-on-primary": "var(--text-on-primary)",

        // Explicitly define border color for border utilities
        border: "var(--border)",

        // Status colors
        success: "var(--success)",
        error: "var(--error)",
        warning: "var(--warning)",
        info: "var(--info)",
      },
      // Make border colors use the default color when no color is specified
      borderColor: {
        DEFAULT: "var(--border)",
      },
      // Make background colors use the default color when no color is specified
      backgroundColor: {
        DEFAULT: "var(--background)",
      },
      fontFamily: {
        // Google fonts
        syne: ["var(--font-syne)"],
        "source-sans": ["var(--font-source-sans-3)"],
        "jakarta-sans": ["var(--font-plus-jakarta-sans)"],
        "rubik-mono": ["var(--font-rubik-mono-one)"],
        "space-grotesk": ["var(--font-space-grotesk)"],

        // Local fonts
        "clash-display": ["var(--font-clash-display)"],
        satoshi: ["var(--font-satoshi)"],

        // Functional typographic classes
        heading: ["var(--font-clash-display)", "sans-serif"],
        body: ["var(--font-satoshi)", "sans-serif"],
        "section-header": ["var(--font-syne)", "sans-serif"],
        "alt-heading": ["var(--font-space-grotesk)", "sans-serif"],
        "alt-text": ["var(--font-source-sans-3)", "sans-serif"],
      },
      keyframes: {
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      animation: {
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        marquee: "marquee 10s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), "@tailwindcss/postcss"],
};

export default config;