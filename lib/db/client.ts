import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

/**
 * One database handle per server instance, or null until DATABASE_URL
 * is set.
 *
 * DATABASE_URL is Supabase's transaction pooler (port 6543). It lends a
 * connection per transaction, which suits functions that start and stop
 * all the time, but it cannot keep prepared statements, so they are off.
 * Vercel reuses an instance across requests, so the handle is kept on
 * globalThis rather than opened per request. Nothing connects until the
 * first query.
 */
function open() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;

  const client = postgres(url, {
    prepare: false,
    // A signup is one short insert; a few connections per instance is plenty.
    max: 3,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => {},
  });
  return drizzle(client, { schema });
}

type Database = NonNullable<ReturnType<typeof open>>;

const cache = globalThis as unknown as { __paradizeWebDb?: Database };

export function getDb(): Database | null {
  cache.__paradizeWebDb ??= open() ?? undefined;
  return cache.__paradizeWebDb ?? null;
}
