import type { Metadata } from "next";

import { SiteFooter } from "@/components/chrome/site-footer";
import { SiteHeader } from "@/components/chrome/site-header";
import { ActionArrow, ActionLink } from "@/components/controls/action-link";
import { Button } from "@/components/ui/button";
import { isUnsubscribeToken } from "@/lib/emails/unsubscribe-token";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

type State = "confirm" | "done" | "unknown" | "failed";

const copy: Record<State, { heading: string; body: string }> = {
  confirm: {
    heading: "Unsubscribe from Paradize emails?",
    body: "You will stop getting emails from Paradize, early access news included.",
  },
  done: {
    heading: "You are unsubscribed.",
    body: "Paradize will not email you again.",
  },
  unknown: {
    heading: "This link did not work.",
    body: "It may have been cut short on the way here. Open it from the email again, or reply to that email and we will take you off the list.",
  },
  failed: {
    heading: "That did not go through.",
    body: "Nothing has changed yet. Try again in a moment.",
  },
};

/**
 * Where every email's unsubscribe link lands: /unsubscribe?t=<token>.
 *
 * Opening the link only asks. The button posts to /api/unsubscribe, which
 * does it and comes back here with `status` set; see that route for why
 * the link alone never unsubscribes. A plain form, so it works with
 * JavaScript off, as it often is in the browser a mail app opens.
 *
 * Kept out of search results: every visit carries someone's token.
 */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const token = typeof params.t === "string" ? params.t : "";
  const status = typeof params.status === "string" ? params.status : "";

  const state: State =
    status === "done"
      ? "done"
      : isUnsubscribeToken(token)
        ? status === "failed"
          ? "failed"
          : "confirm"
        : "unknown";

  const { heading, body } = copy[state];
  const asks = state === "confirm" || state === "failed";

  return (
    <>
      <SiteHeader />

      <main id="main" className="mx-auto max-w-page px-4 sm:px-7">
        <div className="pt-28 pb-24 sm:pt-36 sm:pb-32">
          <div className="flex items-start gap-4">
            <p className="mono text-dim shrink-0 -translate-y-[0.35em]">
              Email
            </p>
            <span className="ruler grow" />
          </div>

          <div className="mt-14 max-w-reading">
            <h1 className="text-heading">{heading}</h1>
            <p className="text-lead text-mute mt-6">{body}</p>

            <div className="mt-10">
              {asks ? (
                <form
                  method="post"
                  action={`/api/unsubscribe?t=${encodeURIComponent(token)}`}
                >
                  <Button
                    type="submit"
                    variant="action"
                    size="action"
                    className="group/action justify-start"
                  >
                    <ActionArrow />
                    Unsubscribe
                  </Button>
                </form>
              ) : (
                <ActionLink href="/">Back to the start</ActionLink>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
