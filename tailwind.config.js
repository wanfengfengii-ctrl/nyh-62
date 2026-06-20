/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        wood: {
          50: "#FAF6F0",
          100: "#F5EFE3",
          200: "#E8D9BE",
          300: "#D4B98C",
          400: "#B8956A",
          500: "#8B4513",
          600: "#6B3410",
          700: "#4A240B",
          800: "#2C1405",
          900: "#1A0B03",
        },
        olive: {
          400: "#7B8F3F",
          500: "#556B2F",
          600: "#3F5020",
        },
        amber: {
          400: "#E5B84A",
          500: "#DAA520",
          600: "#B8860B",
        },
        rust: {
          400: "#B5633D",
          500: "#A0522D",
          600: "#8B4020",
        },
        parchment: "#F5F0E6",
        slate: {
          850: "#1F2329",
          950: "#111418",
        },
      },
      fontFamily: {
        display: ['"Cinzel"', "serif"],
        body: ['"Source Serif Pro"', "Georgia", "serif"],
      },
      boxShadow: {
        vintage: "0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
        "vintage-sm": "0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
        pressed: "inset 0 2px 6px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        drip: "drip 1.5s ease-in infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        drip: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0.9" },
          "70%": { transform: "translateY(40px) scale(0.9)", opacity: "0.7" },
          "100%": { transform: "translateY(60px) scale(0.5)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
