import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        zillow: {
          blue: "#006AFF",
          "blue-dark": "#0050C8",
          "blue-light": "#E6F0FF",
          ink: "#28282E",
          slate: "#54545B",
          gray: "#9A9A9F",
          "gray-light": "#F4F4F4",
          "gray-border": "#E4E4E7",
          yellow: "#FFE606",
          green: "#00BD66",
          orange: "#FF6633",
          red: "#E22B2B",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Open Sans'",
          "'Segoe UI'",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
      },
      maxWidth: {
        container: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
