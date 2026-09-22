/**
 * The beats of the marketplace preview.
 *
 * Pure data: what is on screen, how long it holds, what the camera
 * frames and where the pointer rests. Kept out of the component
 * because it is the thing most likely to be edited — retiming the
 * flow or adding a beat should not mean opening a file full of JSX
 * and camera arithmetic.
 */

export type Screen = "profile" | "project" | "market";

export type Phase =
  | "profile"
  | "open"
  | "detail"
  | "clone"
  | "apparatus"
  | "check"
  | "shortfall"
  | "search"
  | "results"
  | "add"
  | "cart";

/** Something on screen the camera or the pointer can be aimed at. */
export type Mark =
  | "projectRow"
  | "clone"
  | "list"
  | "shortfall"
  | "search"
  | "results"
  | "add"
  | null;

export type Beat = {
  phase: Phase;
  screen: Screen;
  /** Milliseconds before the next beat. */
  hold: number;
  caption: string;
  /** What the camera frames, and how close it sits. */
  look: Mark;
  scale: number;
  /** Where the pointer rests. It only ever sits on something pressable. */
  point: Mark;
  /** Draw the click ring on this beat. */
  press?: boolean;
};

export const PHASES: Beat[] = [
  {
    phase: "profile",
    screen: "profile",
    hold: 1800,
    caption: "Someone's profile",
    look: null,
    scale: 1,
    point: "projectRow",
  },
  {
    phase: "open",
    screen: "profile",
    hold: 1300,
    caption: "Open a project",
    look: "projectRow",
    scale: 1.25,
    point: "projectRow",
    press: true,
  },
  {
    phase: "detail",
    screen: "project",
    hold: 2200,
    caption: "What the release is",
    look: null,
    scale: 1,
    point: "clone",
  },
  {
    phase: "clone",
    screen: "project",
    hold: 1500,
    caption: "Clone it",
    look: "clone",
    scale: 1.5,
    point: "clone",
    press: true,
  },
  {
    phase: "apparatus",
    screen: "project",
    hold: 1900,
    caption: "The apparatus it needs",
    look: "list",
    scale: 1,
    point: null,
  },
  // Wide, and deliberately so. Every row spans the window, so a row's
  // name and its state sit ~900px apart: there is no zoom that holds
  // both, and framing either one alone makes the other vanish. The
  // motion here is the states landing in sequence, not the camera.
  {
    phase: "check",
    screen: "project",
    hold: 2400,
    caption: "Against what you hold",
    look: null,
    scale: 1,
    point: null,
  },
  {
    phase: "shortfall",
    screen: "project",
    hold: 1600,
    caption: "One line short",
    look: "shortfall",
    scale: 1.4,
    point: null,
  },
  {
    phase: "search",
    screen: "market",
    hold: 2200,
    caption: "Look for the line you lack",
    look: "search",
    scale: 1.3,
    point: "search",
  },
  {
    phase: "results",
    screen: "market",
    hold: 2400,
    caption: "What is out there",
    look: "results",
    scale: 1,
    point: null,
  },
  {
    phase: "add",
    screen: "market",
    hold: 1500,
    caption: "Add it to the cart",
    look: "add",
    scale: 1.5,
    point: "add",
    press: true,
  },
  // Ends wide. The point of the last beat is seeing the whole thing
  // resolved, so the camera pulls all the way back rather than pushing
  // into the one control that changed.
  {
    phase: "cart",
    screen: "market",
    hold: 2600,
    caption: "One line, sourced",
    look: null,
    scale: 1,
    point: null,
  },
];

/**
 * Where a beat sits in the running order.
 *
 * Everything that resolves during the flow — cloned, checked, in the
 * cart — is derived by comparing the current index against this rather
 * than by tracking its own state, so a beat can be moved or inserted
 * without any of those going out of step with it.
 */
export const order = (p: Phase) => PHASES.findIndex((s) => s.phase === p);
