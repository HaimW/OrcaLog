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
          deep: "var(--color-ocean-deep)",
          teal: "var(--color-ocean-teal)",
          light: "var(--color-ocean-light)",
        },
        coral: "var(--color-coral)",
      },
    },
  },
  plugins: [],
};
export default config;
