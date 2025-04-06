import { Config } from 'tailwindcss';

const config: Config = {
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'text-pri': 'var(--text-pri)',
        'text-alt': 'var(--text-alt)',
        'btn-primary': '#9E090F', // Add this line
      },
      keyframes: {
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
          marquee: {
            // Start position: text fully visible on the left
            '0%': { transform: 'translateX(0%)' },
            // End position: text fully scrolled off to the left
            '100%': { transform: 'translateX(-100%)' },
            // Note: This simple version causes the text to "jump" back
            // instantly from the end to the start. See notes below for smoother loops.
        },
      },
      animation: {
        "caret-blink": "caret-blink 1.25s ease-out infinite",
          marquee: 'marquee 10s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;