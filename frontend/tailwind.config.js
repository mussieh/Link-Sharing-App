/** @type {import('tailwindcss').Config} */
import plugin from "tailwindcss/plugin";

export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        screens: {
            xxl: { max: "2560px" },
            xl: { max: "1440px" },
            lg: { max: "1024px" },
            md: { max: "768px" },
            sm: { max: "425px" },
            xs: { max: "375px" },
            xxs: { max: "325px" },
        },
        extend: {
            colors: {
                purple: "#633CFF",
                purpleHover: "#BEADFF",
                lightPurple: "#EFEBFF",
                darkGrey: "#333333",
                grey: "#737373",
                borders: "#D9D9D9",
                lightGrey: "#FAFAFA",
                white: "#FFFFFF",
                red: "#FF3939",
            },
            fontFamily: {
                sans: ["Instrument Sans", "sans-serif"],
            },
        },
    },
    plugins: [
        plugin(function ({ addBase }) {
            addBase({
                html: { fontSize: "10px" },
            });
        }),
    ],
};
