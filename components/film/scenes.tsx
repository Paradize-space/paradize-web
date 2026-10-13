import type { ReactNode } from "react";

import { kit, latest, macropad } from "@/lib/data/macropad";

import type { SceneId } from "./timeline";
import s from "./film.module.css";

/**
 * What the film says at each step, and the piece of Paradize you would
 * be looking at there.
 *
 * The keypad shows what happens to the object; the card beside it shows
 * the product doing it — the release page, the comparison between two
 * releases, the shelf check, the build checklist. Both draw on the same
 * sample data, so the card and the object always agree.
 */

const first = macropad.releases[0];
const path = `@${macropad.owner} / ${macropad.name.toLowerCase()}`;
/** "Mk 1.0" never breaks across a line. */
const nb = (t: string) => t.replace(/ /g, " ");

function Card({
  head,
  tag,
  children,
}: {
  head: string;
  tag?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={s.card}>
      <p className={s.cardHead}>
        <span>{head}</span>
        {tag ? <span className={s.cardTag}>{tag}</span> : null}
      </p>
      {children}
    </div>
  );
}

function ReleaseCard() {
  return (
    <Card head={`${path} / ${first.name}`} tag="Published">
      <p className={s.cardLabel}>Files</p>
      <ul className={s.rows}>
        {first.files.map((f) => (
          <li key={f.name}>
            <span className={s.mono}>{f.name}</span>
            <span className={s.dim}>{f.kind}</span>
          </li>
        ))}
      </ul>
      <p className={s.cardFoot}>
        <span>Parts list · {first.parts.length} lines</span>
        <span>Build steps · {first.steps.length}</span>
      </p>
    </Card>
  );
}

function CompareCard() {
  // What the new release adds comes first: it is the point of the
  // scene, and on a phone the card only has room for three lines.
  const lines: [string, string][] = [
    ...latest.parts
      .filter((p) => !first.parts.some((q) => q.id === p.id))
      .map((p): [string, string] => ["+", p.name]),
    ["~", `Case ${first.width} → ${latest.width} mm`],
    ["~", `Board ${first.board} → ${latest.board}`],
    ["~", `Firmware ${first.firmware} → ${latest.firmware}`],
  ];
  return (
    <Card head={`Compare ${first.name} → ${latest.name}`} tag="Both kept">
      <ul className={s.rows}>
        {lines.map(([mark, text]) => (
          <li key={text}>
            <span>
              <span className={mark === "+" ? s.add : s.change}>{mark}</span>
              {text}
            </span>
          </li>
        ))}
      </ul>
      <p className={s.cardFoot}>
        <span>Fork {nb(first.name)}</span>
        <span>Fork {nb(latest.name)}</span>
      </p>
    </Card>
  );
}

function ShelfCard() {
  const have = latest.parts.filter((p) => p.owned);
  return (
    <Card head={`Shelf check · ${latest.name}`} tag={`${kit.length} missing`}>
      <ul className={s.rows}>
        <li>
          <span>
            <span className={s.dotOk} />
            {have.length} parts on your shelf
          </span>
          <span className={s.dim}>ready</span>
        </li>
        {kit.map((p) => (
          <li key={p.id}>
            <span>
              <span className={s.dotMissing} />
              {p.name}
            </span>
            <span className={s.missing}>missing</span>
          </li>
        ))}
      </ul>
      <p className={s.kitLine}>
        <span>Kit · {kit.length} lines</span>
        <span>{kit.map((p) => p.ref).join(" · ")}</span>
      </p>
      <p className={s.note}>
        Kits from sellers on the Paradize marketplace come later.
      </p>
    </Card>
  );
}

function BuildCard() {
  return (
    <Card
      head={`Build · ${latest.name}`}
      tag={<span data-build-count>0 / {latest.steps.length}</span>}
    >
      <div className={s.progress}>
        <span data-build-bar />
      </div>
      <ol className={s.steps}>
        {latest.steps.map((step, i) => (
          <li key={step} data-step={i}>
            <span className={s.tick} />
            {step}
          </li>
        ))}
      </ol>
      <p className={s.cardFoot}>
        <span>Parts set aside on your shelf</span>
        <span>Share build</span>
      </p>
    </Card>
  );
}

export const sceneCopy: Record<
  SceneId,
  { kicker: string; title: ReactNode; body: ReactNode; card?: ReactNode }
> = {
  why: {
    kicker: "How Paradize works",
    title: "Hardware gets passed around as a photo and a thread.",
    body: (
      <>
        By the time you see the photo, the board is two revisions on and the
        parts list is lost in the replies.
      </>
    ),
  },
  what: {
    kicker: "Paradize",
    title: "Where hardware projects live.",
    body: (
      <>
        A maker publishes a project once. Anyone can check it against the parts
        they own and build the same thing.{" "}
        <span className={s.aside}>
          {macropad.name}, a sample project, runs through every step below.
        </span>
      </>
    ),
  },
  publish: {
    kicker: "Publish",
    title: "Publish it once, as a release.",
    body: (
      <>
        Drawings, parts list, firmware and build steps, fixed under one number.
      </>
    ),
    card: <ReleaseCard />,
  },
  revise: {
    kicker: "Revise",
    title: "Improve it without breaking it.",
    body: (
      <>
        {nb(latest.name)} adds a knob as a new release. {nb(first.name)} stays
        exactly as it was.
      </>
    ),
    card: <CompareCard />,
  },
  check: {
    kicker: "Check",
    title: "Hold it up against your shelf.",
    body: (
      <>
        Every line is checked against the parts you own. What you lack turns to
        glass, and that is the kit.
      </>
    ),
    card: <ShelfCard />,
  },
  build: {
    kicker: "Build",
    title: "Build it, step by step.",
    body: (
      <>Starting a build sets its parts aside. Tick off the steps as you go.</>
    ),
    card: <BuildCard />,
  },
};
