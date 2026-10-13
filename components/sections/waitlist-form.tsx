"use client";

import { useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  HONEYPOT_FIELD,
  isValidEmail,
  waitlistInterests,
} from "@/lib/waitlist/signup";
import type { WaitlistInterest } from "@/lib/waitlist/signup";
import { cn } from "@/lib/utils";

/**
 * The waitlist form.
 *
 * The one rule this file exists to enforce: an address is only ever
 * reported as saved when the server says it was saved. The route
 * answers 201 when the address was stored; anything else renders as
 * "not stored", never as a thank-you. Showing a success state for an
 * address that went nowhere is the single most common lie on a
 * pre-launch page and it is not worth telling.
 *
 * Why it failed stays on the server. A visitor is told the address was
 * not saved and nothing about the backend: no setting names, no
 * services, no configuration state.
 */
type State =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "stored" }
  | { kind: "invalid"; message: string }
  | { kind: "error" };

/**
 * The same form is used in two places: at the foot of a page, framed as
 * a faceplate, and inside the waitlist panel, where the panel is the
 * frame. Ids are generated per instance so both can be on one page.
 */
export function WaitlistForm({
  framed = true,
  initialInterests = [],
}: {
  framed?: boolean;
  /** Ticked when the form opens, e.g. Research from the research page. */
  initialInterests?: WaitlistInterest[];
}) {
  const uid = useId();
  const ids = {
    email: `${uid}-email`,
    error: `${uid}-email-error`,
    hint: `${uid}-email-hint`,
    trap: `${uid}-website`,
  };
  const frame = framed
    ? "screws border-line-2 bg-bg/90 border backdrop-blur-[2px]"
    : "";
  const [email, setEmail] = useState("");
  const [interests, setInterests] =
    useState<WaitlistInterest[]>(initialInterests);
  const [state, setState] = useState<State>({ kind: "idle" });

  // A ref as well as state: two rapid submits can both read `sending:
  // false` before React has re-rendered, and the ref closes that window.
  const inFlight = useRef(false);

  // The honeypot. Read at submit time rather than held in state, since
  // nothing on the page should ever react to it.
  const trap = useRef<HTMLInputElement>(null);

  const toggle = (value: WaitlistInterest, checked: boolean) =>
    setInterests((current) =>
      checked
        ? [...current, value]
        : current.filter((entry) => entry !== value),
    );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;

    if (!isValidEmail(email)) {
      setState({
        kind: "invalid",
        message: "Enter an email address in the form name@example.com.",
      });
      return;
    }

    inFlight.current = true;
    setState({ kind: "sending" });

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          interests,
          [HONEYPOT_FIELD]: trap.current?.value ?? "",
        }),
      });

      if (response.status === 201) setState({ kind: "stored" });
      else if (response.status === 400)
        setState({
          kind: "invalid",
          message: "That address was not accepted. Check it and try again.",
        });
      else setState({ kind: "error" });
    } catch {
      setState({ kind: "error" });
    } finally {
      inFlight.current = false;
    }
  }

  const invalid = state.kind === "invalid";

  if (state.kind === "stored") {
    return (
      <div className={cn(frame, framed && "px-6 py-8")}>
        {framed ? <span className="screw-b" aria-hidden="true" /> : null}
        <p className="mono text-ok">Saved</p>
        <p className="text-sub mt-3">You are on the list.</p>
        <p className="text-small text-mute mt-3 max-w-[40ch]">
          We will write when there is something real to show. No other mail.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className={frame}>
      {framed ? <span className="screw-b" aria-hidden="true" /> : null}

      {/* Honeypot. Moved off-screen rather than display:none, which some
          bots know to skip; out of the tab order and hidden from screen
          readers, so no person reaches it. */}
      <div
        aria-hidden="true"
        className="absolute -left-[10000px] h-px w-px overflow-hidden"
      >
        <label htmlFor={ids.trap}>Leave this field empty</label>
        <input
          ref={trap}
          id={ids.trap}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      {framed ? (
        <div className="border-line border-b px-6 py-4">
          <p className="mono text-dim">Request form</p>
        </div>
      ) : null}

      <div className={cn("flex flex-col gap-6", framed && "px-6 py-6")}>
        <Field data-invalid={invalid || undefined}>
          <FieldLabel htmlFor={ids.email} className="mono text-dim">
            Email address (required)
          </FieldLabel>
          <Input
            id={ids.email}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="name@example.com"
            value={email}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? ids.error : ids.hint}
            onChange={(e) => {
              setEmail(e.target.value);
              if (state.kind !== "idle") setState({ kind: "idle" });
            }}
            className="border-line-2 bg-bg h-11 rounded-none"
          />
          {invalid ? (
            <FieldError id={ids.error} className="text-small">
              {state.message}
            </FieldError>
          ) : (
            <FieldDescription id={ids.hint} className="text-small">
              No account, no other details. One address, and what you want to
              hear about.
            </FieldDescription>
          )}
        </Field>

        <fieldset className="flex flex-col gap-3">
          <legend className="mono text-dim mb-1">Interest (optional)</legend>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {waitlistInterests.map((interest) => (
              <label
                key={interest.value}
                className="mono text-fg flex cursor-pointer items-center gap-2.5"
              >
                <Checkbox
                  checked={interests.includes(interest.value)}
                  onCheckedChange={(checked) =>
                    toggle(interest.value, checked === true)
                  }
                  className="rounded-none"
                />
                {interest.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-4">
          <Button
            type="submit"
            variant="action"
            size="action"
            disabled={state.kind === "sending"}
          >
            {state.kind === "sending" ? "Sending…" : "Join the waitlist"}
          </Button>
        </div>

        {/* The success case returns a different tree above, so this only
            ever has to announce the one way it can fail. */}
        <p aria-live="polite" className="sr-only">
          {state.kind === "error"
            ? "Something went wrong. Your address was not saved."
            : ""}
        </p>

        {state.kind === "error" ? (
          <div className="border-gone/40 bg-gone/5 border px-4 py-4">
            <p className="mono text-gone">Not stored</p>
            <p className="text-small mt-2 max-w-[46ch]">
              Something went wrong, so your address was not saved. Please try
              again in a moment.
            </p>
          </div>
        ) : null}
      </div>
    </form>
  );
}
