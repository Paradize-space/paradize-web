import "server-only";

import { count, eq, gte } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { waitlist } from "@/lib/db/schema";

import type { WaitlistInterest } from "./signup";

/**
 * Waitlist storage adapter.
 *
 * Signups are rows in the `waitlist` table (lib/db/schema.ts), written
 * with Drizzle over a Postgres connection to Supabase. Nothing else in
 * the app knows how a signup is stored.
 *
 * TO CONNECT
 * ----------
 * Set DATABASE_URL to the Supabase transaction pooler's connection
 * string (port 6543) as a server-side env var, and apply the migrations
 * in drizzle/ (`npm run db:migrate`). It carries the database password,
 * so it must never get a NEXT_PUBLIC_ prefix.
 *
 * Until it is set, `storeSignup` returns `{ status: "unconfigured" }`.
 * The route logs that and gives the visitor the same "not stored" as any
 * other failure. It never reports success for an address it did not store.
 */

export type WaitlistSignup = {
  email: string;
  interests: WaitlistInterest[];
  source: string;
  submittedAt: string;
};

export type WaitlistResult =
  // `isNew` is false when the address was already on the list. The form
  // is told "stored" either way, so it never reveals who has signed up.
  | { status: "stored"; isNew: boolean }
  | { status: "unconfigured" }
  | { status: "error"; message: string };

export function isWaitlistConfigured(): boolean {
  return getDb() !== null;
}

/**
 * Names a failed query by its error code only: a Postgres SQLSTATE, or
 * the driver's own code for a connection that never opened. Drizzle's
 * error carries the query's parameters, the address among them, and its
 * message prints them. These messages end up in Vercel's logs.
 */
function describeFailure(error: unknown): string {
  const cause = error instanceof Error && error.cause ? error.cause : error;
  const code =
    cause && typeof cause === "object" && "code" in cause
      ? String(cause.code)
      : "no code";
  return `Database query failed (${code}).`;
}

export async function storeSignup(
  signup: WaitlistSignup,
): Promise<WaitlistResult> {
  const db = getDb();
  if (!db) return { status: "unconfigured" };

  try {
    // ON CONFLICT (email) DO NOTHING ... RETURNING. Postgres only returns
    // rows it inserted, so an address already on the list comes back as
    // an empty array, which is how `isNew` is known.
    const inserted = await db
      .insert(waitlist)
      .values({
        email: signup.email,
        interests: signup.interests,
        source: signup.source,
        createdAt: new Date(signup.submittedAt),
      })
      .onConflictDoNothing({ target: waitlist.email })
      .returning({ id: waitlist.id });

    return { status: "stored", isNew: inserted.length > 0 };
  } catch (error) {
    return { status: "error", message: describeFailure(error) };
  }
}

/** How many thank-you emails went out since `since`, for the daily cap. */
export async function countConfirmationsSince(since: Date): Promise<number> {
  const db = getDb();
  if (!db) return 0;

  try {
    const [row] = await db
      .select({ sent: count() })
      .from(waitlist)
      .where(gte(waitlist.confirmationSentAt, since));
    return row?.sent ?? 0;
  } catch (error) {
    throw new Error(describeFailure(error));
  }
}

/** Records that the thank-you email went out, so a missing one shows up. */
export async function markConfirmationSent(email: string): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    await db
      .update(waitlist)
      .set({ confirmationSentAt: new Date() })
      .where(eq(waitlist.email, email));
  } catch (error) {
    throw new Error(describeFailure(error));
  }
}
