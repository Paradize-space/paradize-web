/**
 * What a signup is, shared by the form and the server.
 *
 * The form imports this into the browser bundle, so it stays free of
 * anything server-side. Storage lives in adapter.ts.
 */

/** Also the values of the `waitlist_interest` enum in Postgres. */
export const interestValues = ["platform", "marketplace", "research"] as const;

export type WaitlistInterest = (typeof interestValues)[number];

export const waitlistInterests: {
  value: WaitlistInterest;
  label: string;
}[] = [
  { value: "platform", label: "Platform" },
  { value: "marketplace", label: "Marketplace" },
  { value: "research", label: "Research" },
];

/**
 * The honeypot: a field that is off-screen, out of the tab order and
 * hidden from screen readers, so a person never fills it and a form-
 * filling bot usually does. "website" is not a field browsers autofill
 * from a saved profile, which keeps real people from tripping it.
 */
export const HONEYPOT_FIELD = "website";

/** A deliberately plain check: reject what is obviously not an address. */
export function isValidEmail(value: string): boolean {
  const email = value.trim();
  if (email.length < 6 || email.length > 254) return false;
  if (/\s/.test(email)) return false;
  return /^[^@]+@[^@.]+(\.[^@.]+)+$/.test(email);
}
