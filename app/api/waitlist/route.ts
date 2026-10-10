import { checkBotId } from "botid/server";
import { after, NextResponse } from "next/server";

import {
  countConfirmationsSince,
  markConfirmationSent,
  storeSignup,
  type WaitlistSignup,
} from "@/lib/waitlist/adapter";
import { sendConfirmation } from "@/lib/waitlist/confirmation";
import {
  acceptsMail,
  isSameOrigin,
  MAX_BODY_BYTES,
  rememberStored,
  storedRecently,
} from "@/lib/waitlist/guards";
import {
  HONEYPOT_FIELD,
  isValidEmail,
  waitlistInterests,
  type WaitlistInterest,
} from "@/lib/waitlist/signup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedInterests = new Set(waitlistInterests.map((i) => i.value));

/**
 * Hostinger allows 1,000 sends a day from the mailbox. The cap stays under
 * it so a burst of signups can never get the mailbox suspended; signups
 * past it are still stored, with `confirmation_sent_at` left empty.
 */
const DAILY_EMAIL_CAP = 900;

// Failures answer with the same bare body. Why one failed is for the
// server log only: anyone can call this route, and the response is no
// place to describe the backend or which check caught them.
const refused = (status: number) =>
  NextResponse.json({ status: "error" }, { status });

const notAccepted = () =>
  NextResponse.json(
    {
      status: "invalid",
      message: "That address was not accepted. Check it and try again.",
    },
    { status: 400 },
  );

/**
 * The checks run cheapest first, and every one of them before the
 * database or the mail API is touched. Floods should never get this far:
 * the Vercel Firewall rate-limits this route before a function starts.
 */
export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return refused(413);
  }

  if (!isSameOrigin(request)) {
    console.warn("[waitlist] refused: cross-origin or no Origin header.");
    return refused(403);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return refused(413);

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { status: "invalid", message: "Expected a JSON body." },
      { status: 400 },
    );
  }

  const body = (payload ?? {}) as Record<string, unknown>;

  // A filled honeypot is a bot: no person can see or reach the field. It
  // is told "stored", the one deliberate exception to never claiming a
  // save, so it has no signal to adapt to. Nothing is stored or sent.
  const trap = body[HONEYPOT_FIELD];
  if (typeof trap === "string" && trap.trim() !== "") {
    console.warn("[waitlist] honeypot filled; answered as stored.");
    return NextResponse.json({ status: "stored" }, { status: 201 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!isValidEmail(email)) {
    return NextResponse.json(
      {
        status: "invalid",
        message: "Enter an email address in the form name@example.com.",
      },
      { status: 400 },
    );
  }

  // BotID, at the free basic level. It only runs for real on Vercel;
  // anywhere else it reports a human, so local runs work. A flagged
  // request is told the truth ("not stored"), unlike the honeypot,
  // because BotID can be wrong about a real person.
  try {
    const verdict = await checkBotId({
      developmentOptions: { isDevelopment: process.env.VERCEL !== "1" },
      advancedOptions: { checkLevel: "basic" },
    });
    if (verdict.isBot || verdict.isVerifiedBot) {
      console.warn("[waitlist] refused: BotID flagged the request.");
      return refused(403);
    }
  } catch (error) {
    // Usually OIDC turned off in the Vercel project. Refuse rather than
    // let every request through unchecked.
    console.error(
      "[waitlist] bot check unavailable:",
      error instanceof Error ? error.message : "unknown error",
    );
    return refused(503);
  }

  const address = email.toLowerCase();

  if (storedRecently(address)) {
    return NextResponse.json({ status: "stored" }, { status: 201 });
  }

  const mail = await acceptsMail(address);
  if (mail === "no") return notAccepted();
  if (mail === "unknown") {
    console.warn("[waitlist] mail-domain check failed in DNS; let through.");
  }

  const interests = Array.isArray(body.interests)
    ? (body.interests.filter(
        (value): value is WaitlistInterest =>
          typeof value === "string" &&
          allowedInterests.has(value as WaitlistInterest),
      ) as WaitlistInterest[])
    : [];

  const signup: WaitlistSignup = {
    email: address,
    interests,
    source: "paradize.space/#early-access",
    submittedAt: new Date().toISOString(),
  };

  const result = await storeSignup(signup);

  if (result.status === "stored") {
    rememberStored(address);
    // Only a new address gets the email, so the form can't be used to
    // send the same inbox mail over and over. It goes out after the
    // response, so the form never waits on it, and a failed send never
    // turns a stored signup into an error. `after` keeps the function
    // alive until it finishes; a plain unawaited promise would be cut off.
    if (result.isNew) after(() => confirm(signup));
    return NextResponse.json({ status: "stored" }, { status: 201 });
  }

  if (result.status === "unconfigured") {
    console.error("[waitlist] not stored: DATABASE_URL is not set.");
    return refused(503);
  }

  console.error("[waitlist] store failed:", result.message);
  return refused(502);
}

async function confirm(signup: WaitlistSignup) {
  try {
    const day = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if ((await countConfirmationsSince(day)) >= DAILY_EMAIL_CAP) {
      console.warn("[waitlist] daily email cap reached; no confirmation sent.");
      return;
    }
  } catch (error) {
    console.error("[waitlist] could not check the email cap:", error);
    return;
  }

  const sent = await sendConfirmation(signup.email, signup.interests);

  if (sent.status === "error") {
    console.error("[waitlist] confirmation failed:", sent.message);
    return;
  }
  if (sent.status !== "sent") {
    console.warn(`[waitlist] no confirmation sent: ${sent.status}`);
    return;
  }

  try {
    await markConfirmationSent(signup.email);
  } catch (error) {
    // The email went out; only the record of it is missing.
    console.error("[waitlist] could not record confirmation:", error);
  }
}
