import { defineConfig } from "@maizzle/framework";

/**
 * Every email the site sends is a Maizzle template in emails/. Shared by
 * `npm run emails:dev` (the preview server) and `npm run emails:build`,
 * which compiles them into lib/emails/generated.ts for the server code.
 */
export default defineConfig({
  content: ["emails/*.vue"],
  output: { path: ".maizzle/dist" },
  plaintext: true,
  // Left unminified. The text/plain part is made from the same HTML, and
  // minifying removes the line breaks it is built from. An email here is
  // a few KB, far under the ~102 KB where Gmail clips.
  html: { minify: false },
  server: { port: 3333 },
});
