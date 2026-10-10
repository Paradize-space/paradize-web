import "server-only";

import {
  Configuration,
  SendApi,
  type V1SendRequest,
} from "hostinger-mail-api-sdk";

import { SITE_NAME } from "@/lib/site";

import type { WaitlistInterest } from "./signup";

/**
 * The one email a signup gets, sent from the paradize.space mailbox
 * through the Hostinger Mail API, with Hostinger's own SDK.
 *
 * It goes out from a real mailbox, so a reply lands in that inbox, and
 * the API keeps a copy in its Sent folder. The mailbox's SPF and DKIM
 * records are Hostinger's own, so no DNS change is needed.
 *
 * TO CONNECT
 * ----------
 * HOSTINGER_MAIL_TOKEN       hPanel → Emails → the domain → Agentic Mail →
 *                            API access. Server-side only.
 * HOSTINGER_MAIL_MAILBOX_ID  the mailbox's `resourceId` (AC…), listed by
 *                            GET https://api.mail.hostinger.com/api/v1/me
 *
 * Without both, signups are still stored and no email is sent. Business
 * Starter allows 1,000 sends a day per mailbox; past that the API refuses,
 * the signup is still kept, and its `confirmation_sent_at` stays empty.
 */

type ConfirmationEmail = { subject: string; text: string };

export type ConfirmationResult =
  | { status: "sent" }
  | { status: "unconfigured" }
  | { status: "unwritten" }
  | { status: "error"; message: string };

/**
 * What the email says. Plain text only: from a real mailbox, a plain
 * message reads as written by a person, and there is no HTML to render
 * badly in someone's client.
 *
 * Return `null` to send nothing. That is the state until the copy is
 * written, so no placeholder can ever reach a real inbox.
 */
export function confirmationEmail(
  interests: WaitlistInterest[],
): ConfirmationEmail | null {
  // TODO: write the subject and body.
  void interests;
  return null;
}

export async function sendConfirmation(
  email: string,
  interests: WaitlistInterest[],
): Promise<ConfirmationResult> {
  const token = process.env.HOSTINGER_MAIL_TOKEN;
  const mailbox = process.env.HOSTINGER_MAIL_MAILBOX_ID;
  if (!token || !mailbox) return { status: "unconfigured" };

  const message = confirmationEmail(interests);
  if (!message) return { status: "unwritten" };

  // The SDK's generated type marks every field required (cc, html,
  // attachments, the reply references); Hostinger's API reference makes
  // all but a recipient optional. Sending empty ones could add an empty
  // HTML part, so only the fields this email uses are sent.
  const request = {
    to: [email],
    displayName: SITE_NAME,
    subject: message.subject,
    text: message.text,
  } satisfies Partial<V1SendRequest>;

  try {
    // Resolves on 204: sent, and saved to the mailbox's Sent folder.
    // Anything else rejects.
    await new SendApi(new Configuration({ accessToken: token })).sendEmail(
      mailbox,
      request as V1SendRequest,
      { timeout: 8000 },
    );
    return { status: "sent" };
  } catch (error) {
    return { status: "error", message: describeFailure(error) };
  }
}

/**
 * Names a failed send by its HTTP status and error code only. The SDK
 * rejects with an axios error, which also carries the request: the
 * Authorization header with the token, and the body with the recipient.
 * Hostinger's error body can echo the recipient back too. These messages
 * end up in Vercel's logs, so the error itself is never logged.
 */
function describeFailure(error: unknown): string {
  const failure = error as {
    code?: unknown;
    response?: { status?: number; data?: { code?: unknown } };
  } | null;

  // No response at all: a timeout (ECONNABORTED) or a network failure.
  if (!failure?.response) {
    const code = typeof failure?.code === "string" ? failure.code : "no code";
    return `Hostinger Mail request failed (${code}).`;
  }

  const { status, data } = failure.response;
  const code = typeof data?.code === "string" ? data.code : "no code";
  return `Hostinger Mail responded with ${status} (${code}).`;
}
