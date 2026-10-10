import "server-only";

import { Resolver } from "node:dns/promises";

/**
 * Cheap checks the waitlist route runs before any database or email work,
 * so a request that fails one costs a short invocation and nothing else.
 * Floods are stopped earlier still, by the Vercel Firewall rules in
 * docs/DEVELOPMENT.md; nothing here can prevent an invocation.
 */

/** A real signup body is well under this: one address and three words. */
export const MAX_BODY_BYTES = 1024;

/**
 * Reads the body, but stops once it passes `max` bytes and returns null.
 * Content-Length can't be trusted on its own: a chunked request has none,
 * and `request.text()` would read all of it into memory first.
 */
export async function readBodyWithin(
  request: Request,
  max: number,
): Promise<string | null> {
  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

/**
 * The form posts from the page it is on, so Origin must name this host.
 * Browsers always send Origin on a POST. A script can forge it, so this
 * only turns away the lazy ones, and other sites' pages posting here.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * Addresses this instance stored in the last few minutes. A repeat is
 * answered from here without touching the database. Only an address that
 * was actually stored is remembered, so a failed attempt is never turned
 * into a false "saved". Per instance and in memory: it thins out bursts,
 * it is not a record.
 */
const RECENT_MS = 10 * 60 * 1000;
const RECENT_MAX = 5000;
const recent = new Map<string, number>();

export function storedRecently(email: string): boolean {
  const expires = recent.get(email);
  if (expires === undefined) return false;
  if (expires > Date.now()) return true;
  recent.delete(email);
  return false;
}

export function rememberStored(email: string): void {
  recent.delete(email);
  recent.set(email, Date.now() + RECENT_MS);
  // Maps iterate in insertion order, so the first key is the oldest.
  if (recent.size > RECENT_MAX) {
    const oldest = recent.keys().next().value;
    if (oldest !== undefined) recent.delete(oldest);
  }
}

/**
 * Whether the address's domain publishes mail servers (MX records).
 *
 * "no" means the domain cannot receive mail: it does not exist, has no MX
 * records, or publishes a null MX ("." under RFC 7505, which says it
 * accepts no mail). "unknown" means DNS itself failed or timed out; the
 * caller lets those through rather than turn a real person away over a
 * resolver hiccup.
 */
const resolver = new Resolver({ timeout: 2000, tries: 2 });

export async function acceptsMail(
  email: string,
): Promise<"yes" | "no" | "unknown"> {
  const domain = email.slice(email.lastIndexOf("@") + 1);
  try {
    const records = await resolver.resolveMx(domain);
    const usable = records.filter((record) => record.exchange !== "");
    return usable.length > 0 ? "yes" : "no";
  } catch (error) {
    const code = (error as { code?: string }).code;
    return code === "ENOTFOUND" || code === "ENODATA" ? "no" : "unknown";
  }
}
