/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(217, 30%, 98%)',
        accent: 'hsl(35, 95%, 55%)',
        primary: 'hsl(222, 100%, 50%)',
        surface: 'hsl(0, 0%, 100%)',
        'text-primary': 'hsl(217, 30%, 15%)',
        'text-secondary': 'hsl(217, 30%, 40%)',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        'xl': '24px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(0, 0%, 0%, 0.08)',
        'modal': '0 24px 48px hsla(0, 0%, 0%, 0.16)',
      },
      spacing: {
        'sm': '8px',
        'md': '12px',
        'lg': '20px',
        'xl': '32px',
      },
      typography: {
        'body': 'text-base leading-7',
        'caption': 'text-sm text-secondary',
        'display': 'font-bold text-5xl',
        'heading': 'font-semibold text-3xl',
        'subheading': 'font-semibold text-xl',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1.5rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },
    },
  },
  plugins: [],
}

