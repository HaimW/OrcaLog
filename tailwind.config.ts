import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          deep: "#0B4F6C",
          teal: "#1B98A6",
          light: "#E0F7FA",
        },
        coral: "#FF6B6B",
      },
    },
  },
  plugins: [],
};
export default config;
