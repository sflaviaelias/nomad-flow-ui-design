
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        // Terracotta palette + complimentaries
        terracotta: {
          DEFAULT: "#E2725B",
          light: "#F9E1DA",
          dark: "#C2513B",
        },
        accent: {
          DEFAULT: "#6D4530",
          light: "#DFC8BC",
        },
        background: {
          DEFAULT: "#FCF7F4",
          dark: "#EDE7E2",
        },
        cream: "#F8F6F0",
        card: "#FFF",
      },
      borderRadius: {
        lg: "8px",
        md: "7px",
        sm: "6px",
      },
      boxShadow: {
        soft: "0 4px 24px 0 rgba(100,60,40,0.07)",
        card: "0 1px 8px 0 rgba(200,120,90,0.06)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
