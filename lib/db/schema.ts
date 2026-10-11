/**
 * The site's tables. One so far.
 *
 * After changing this file, write a migration with `npm run db:generate`
 * and apply it with `npm run db:migrate` (see drizzle.config.ts).
 */
import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Relative, not `@/`: drizzle-kit loads this file outside Next's resolver.
import { interestValues } from "../waitlist/signup";

export const waitlistInterest = pgEnum("waitlist_interest", interestValues);

/**
 * Row-level security is on with no policies. The site connects as the
 * table's owner, which RLS does not restrict; Supabase's Data API roles
 * get no rows and can write none, so the publishable key cannot reach it.
 */
export const waitlist = pgTable(
  "waitlist",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    email: text("email").notNull().unique(),
    interests: waitlistInterest("interests").array().notNull().default([]),
    source: text("source").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    // Set when the mail API accepts the thank-you email. Rows where it is
    // still null never got one, and can be sent again by hand.
    confirmationSentAt: timestamp("confirmation_sent_at", {
      withTimezone: true,
    }),
    // The secret in the unsubscribe link of every email to this address.
    // Random, so knowing an address is not enough to unsubscribe it.
    unsubscribeToken: uuid("unsubscribe_token")
      .notNull()
      .unique()
      .defaultRandom(),
    // Set when the address unsubscribes. The row is kept: it is what stops
    // the form adding the address back, and what every send must check.
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  },
  (t) => [
    // The route lowercases addresses before inserting. This keeps anything
    // else from adding a second spelling of the same address, which the
    // unique constraint alone would allow.
    check("waitlist_email_lowercase", sql`${t.email} = lower(${t.email})`),
  ],
).enableRLS();
