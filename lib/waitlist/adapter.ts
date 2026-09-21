/**
 * Waitlist storage adapter.
 *
 * There is no waitlist store in this repository yet, so submission is isolated
 * behind this one module. Nothing else in the app knows how a signup is stored.
 *
 * TO CONNECT BEFORE LAUNCH
 * ------------------------
 * Set WAITLIST_WEBHOOK_URL (server-side env var) to an endpoint that persists
 * the signup: a form backend, an ESP list endpoint, a serverless function
 * writing to a database, or an internal API. Optionally set
 * WAITLIST_WEBHOOK_TOKEN, which is sent as `Authorization: Bearer <token>`.
 * The endpoint receives a JSON body shaped like `WaitlistSignup`.
 *
 * Until that variable is set, `storeSignup` returns `{ status: "unconfigured" }`
 * and the form shows an explicit preview state. It never reports success for an
 * address it did not store.
 *
 * To swap in a different provider (EmailJS, Resend, Supabase, a Google Sheet),
 * replace the body of `storeSignup` and keep the return contract.
 */

export type WaitlistInterest = "platform" | "marketplace" | "research";

export type WaitlistSignup = {
  email: string;
  interests: WaitlistInterest[];
  source: string;
  submittedAt: string;
};

export type WaitlistResult =
  | { status: "stored" }
  | { status: "unconfigured" }
  | { status: "error"; message: string };

export const waitlistInterests: {
  value: WaitlistInterest;
  label: string;
}[] = [
  { value: "platform", label: "Platform" },
  { value: "marketplace", label: "Marketplace" },
  { value: "research", label: "Research" },
];

/** A deliberately plain check: reject what is obviously not an address. */
export function isValidEmail(value: string): boolean {
  const email = value.trim();
  if (email.length < 6 || email.length > 254) return false;
  if (/\s/.test(email)) return false;
  return /^[^@]+@[^@.]+(\.[^@.]+)+$/.test(email);
}

export function isWaitlistConfigured(): boolean {
  return Boolean(process.env.WAITLIST_WEBHOOK_URL);
}

export async function storeSignup(
  signup: WaitlistSignup,
): Promise<WaitlistResult> {
  const endpoint = process.env.WAITLIST_WEBHOOK_URL;
  if (!endpoint) return { status: "unconfigured" };

  const token = process.env.WAITLIST_WEBHOOK_TOKEN;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(signup),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return {
        status: "error",
        message: `Waitlist store responded with ${response.status}.`,
      };
    }

    return { status: "stored" };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unknown transport failure.",
    };
  }
}
