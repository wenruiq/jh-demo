import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large vendor libraries into separate chunks
          "vendor-react": ["react", "react-dom"],
          "vendor-recharts": ["recharts"],
          "vendor-markdown": ["react-markdown", "remark-gfm"],
          "vendor-tiptap": [
            "@tiptap/react",
            "@tiptap/starter-kit",
            "@tiptap/extension-mention",
            "@tiptap/extension-placeholder",
          ],
          "vendor-radix": [
            "@radix-ui/react-collapsible",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-select",
            "@radix-ui/react-slot",
            "@radix-ui/react-tabs",
          ],
          "vendor-icons": ["lucide-react"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-state": ["zustand", "sonner"],
          "vendor-table": ["@tanstack/react-table"],
        },
      },
    },
  },
})
