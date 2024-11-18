/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1E2019",
        secondary: "#394032",
        secondary2: "#E1EFE6",
        accent: "#688E26",
        accentLight: "#FF9E62",
        border: "#E9E9E9",
        error: "#F73826",
        success: "#089C05",
        emphasis: "#FDFFFC",
        emphasisDark: "#282828",
        disabled: "#AAA8A8"
      }
    },
    fontFamily: {}
  },
  plugins: [],
}

