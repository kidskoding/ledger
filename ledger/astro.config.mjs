import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";

export default defineConfig({
  // The cached route is static; the live run streams, so it needs a server.
  output: "server",
  adapter: vercel(),
  integrations: [react()],
});
