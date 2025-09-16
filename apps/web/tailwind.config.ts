import type { Config } from "tailwindcss";
import sharedConfig from "@repo/ui/tailwind.config";

const config: Pick<Config, "content" | "presets" | "theme"> = {
  content: [
    "./src/app/**/*.tsx",
    "./src/components/**/*.tsx",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  presets: [sharedConfig],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'headline': ['Playfair Display', 'serif'],
        'body': ['Roboto', 'sans-serif'],
        'sans': ['Roboto', 'sans-serif'],
        'serif': ['Playfair Display', 'serif'],
      },
    },
  },
};

export default config;
