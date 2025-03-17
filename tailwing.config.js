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
    },
  },
  plugins: [],
};

export default config;