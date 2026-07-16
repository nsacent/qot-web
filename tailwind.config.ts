import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                qot: {
                    orange: "var(--qot-orange)",
                    orangeDark: "var(--qot-orange-dark)",
                    orangeSoft: "var(--qot-orange-soft)",

                    cream: "var(--qot-cream)",
                    cream2: "var(--qot-cream-2)",

                    ink: "var(--qot-ink)",
                    muted: "var(--qot-muted)",

                    green: "var(--qot-green)",
                    greenDark: "var(--qot-green-dark)",
                    greenSoft: "var(--qot-green-soft)",

                    red: "var(--qot-red)",
                    redSoft: "var(--qot-red-soft)",

                    blue: "var(--qot-blue)",
                    blueSoft: "var(--qot-blue-soft)",
                },
            },
            boxShadow: {
                qot: "0 18px 55px rgba(15, 23, 42, 0.08)",
                qotHover: "0 22px 65px rgba(15, 23, 42, 0.13)",
                qotOrange: "0 16px 35px rgba(249, 115, 22, 0.25)",
            },
            borderRadius: {
                qot: "34px",
                qotCard: "28px",
                qotButton: "18px",
            },
        },
    },
    plugins: [],
};

export default config;