import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import webExtension from "vite-plugin-web-extension"

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    watch: {
      include: "src/**",
    },
  },
  plugins: [
    react(),
    webExtension({
      disableAutoLaunch: true,
      manifest: "src/manifest.json",
      // additionalInputs: ["src/content/index.ts"],
    }),
  ],
})
