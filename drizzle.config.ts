import { defineConfig } from "drizzle-kit";

/**
 * `npm run db:generate` writes a migration into drizzle/ from the schema.
 * `npm run db:migrate` applies the pending ones to DATABASE_URL.
 *
 * Migrate over Supabase's session pooler (port 5432), not the transaction
 * pooler the site uses: a migration is one long session, which is what
 * transaction mode cannot hold. The direct connection works too, but only
 * over IPv6 unless the project has the IPv4 add-on.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
