import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E1117",
        slate: "#5C6675",
        gray: "#A6ADBB",
        "gray-light": "#F1F2F4",
        "gray-border": "#E1E4E8",
        blue: "#0052CC",
        "blue-light": "#E6F0FF",
        "blue-dark": "#003D99",
        green: "#0E8345",
        red: "#D7263D",
        orange: "#E76F00",
        amber: "#F4B400",
        purple: "#7A4EBA",
      },
      maxWidth: {
        container: "1100px",
      },
    },
  },
  plugins: [],
};

export default config;
