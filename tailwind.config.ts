import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1E293B",
        navy: "#1B2A4A",
        slate: "#64748B",
        approved: "#0F6E56",
        pending: "#854F0B",
        rejected: "#A32D2D",
      },
    },
  },
  plugins: [],
};
export default config;
