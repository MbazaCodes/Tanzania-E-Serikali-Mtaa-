/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Plus Jakarta Sans", "sans-serif"],
        serif: ["Playfair Display", "serif"],
      },
      colors: {
        background: "hsl(150 10% 97%)",
        foreground: "hsl(160 30% 8%)",
        primary: "hsl(152 60% 28%)",
        "primary-foreground": "hsl(0 0% 100%)",
        secondary: "hsl(210 65% 42%)",
        "secondary-foreground": "hsl(0 0% 100%)",
        accent: "hsl(42 90% 55%)",
        "accent-foreground": "hsl(42 90% 12%)",
        "tz-green": "hsl(152 60% 28%)",
        "tz-blue": "hsl(210 65% 42%)",
        "tz-gold": "hsl(42 90% 55%)",
        border: "hsl(150 5% 85%)",
        destructive: "hsl(0 84% 60%)",
        ring: "hsl(152 60% 28%)",
      },
      borderRadius: {
        xs: "0.25rem",
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-in": "slide-in 0.3s ease-out forwards",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [],
};