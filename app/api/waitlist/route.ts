import { NextResponse } from "next/server";

import {
  isValidEmail,
  storeSignup,
  waitlistInterests,
  type WaitlistInterest,
} from "@/lib/waitlist/adapter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedInterests = new Set(waitlistInterests.map((i) => i.value));

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { status: "invalid", message: "Expected a JSON body." },
      { status: 400 },
    );
  }

  const body = (payload ?? {}) as {
    email?: unknown;
    interests?: unknown;
  };

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

  const interests = Array.isArray(body.interests)
    ? (body.interests.filter(
        (value): value is WaitlistInterest =>
          typeof value === "string" &&
          allowedInterests.has(value as WaitlistInterest),
      ) as WaitlistInterest[])
    : [];

  const result = await storeSignup({
    email: email.toLowerCase(),
    interests,
    source: "paradize.space/#early-access",
    submittedAt: new Date().toISOString(),
  });

  if (result.status === "stored") {
    return NextResponse.json({ status: "stored" }, { status: 201 });
  }

  if (result.status === "unconfigured") {
    // 501: the route works, the store behind it has not been connected yet.
    return NextResponse.json({ status: "unconfigured" }, { status: 501 });
  }

  console.error("[waitlist] store failed:", result.message);
  return NextResponse.json({ status: "error" }, { status: 502 });
}
