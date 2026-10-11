import { NextResponse } from "next/server";

import { unsubscribe } from "@/lib/waitlist/adapter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The button on /unsubscribe posts here, with the token from the email's
 * link in the query string, and the visitor is sent back to the page to
 * read the outcome.
 *
 * Unsubscribing takes this POST, never the GET of the link itself. Mail
 * security scanners (Outlook Safe Links, Mimecast and the like) open every
 * link in an email as it arrives; if opening the link unsubscribed, they
 * would unsubscribe people before they had read a word.
 *
 * No Origin check and no BotID, unlike the signup route: the token is the
 * whole credential. It is random, so a forged request can only ever
 * unsubscribe an address whose email the sender is holding. The body is
 * never read.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("t") ?? "";
  const result = await unsubscribe(token);

  const back = new URL("/unsubscribe", url);
  switch (result.status) {
    case "unsubscribed":
      back.searchParams.set("status", "done");
      break;
    case "unknown":
      back.searchParams.set("status", "unknown");
      break;
    default:
      // Kept on the token, so the page offers the button again.
      console.error(
        "[unsubscribe] failed:",
        result.status === "error" ? result.message : "DATABASE_URL is not set.",
      );
      back.searchParams.set("t", token);
      back.searchParams.set("status", "failed");
  }

  // 303: the browser follows it with a GET, so a refresh never re-posts.
  return NextResponse.redirect(back, 303);
}
