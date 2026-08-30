import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";

export default defineConfig({
  // The cached route is static; the live run streams, so it needs a server.
  output: "server",
  adapter: vercel(),
  integrations: [react()],
  vite: {
    // React 19's dev JSX runtime gets mangled by Vite's CJS interop unless it
    // is pre-bundled explicitly; without this the island throws
    // "_jsxDEV is not a function" and hydration wipes the server-rendered DOM.
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
    },
  },
});
