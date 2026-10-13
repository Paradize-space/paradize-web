/**
 * The story the network plays, over and over, on top of its everyday
 * traffic: a release goes out, one builder's shelf is checked, two
 * stores send what is missing, and the finished build is copied on.
 * Steps and their lengths in seconds; the scene reads where it is
 * from here.
 */

export const steps = [
  { id: "publish", length: 3.4 },
  { id: "check", length: 2.8 },
  { id: "find", length: 2.6 },
  { id: "ship", length: 3.2 },
  { id: "spread", length: 4 },
] as const;

export type Step = (typeof steps)[number]["id"];

/** When each step starts, in seconds into the loop. */
export const starts = steps.map((_, i) =>
  steps.slice(0, i).reduce((sum, s) => sum + s.length, 0),
);

export const LOOP = steps.reduce((sum, s) => sum + s.length, 0);

export const indexOf = (id: Step) => steps.findIndex((s) => s.id === id);

/** The step at a time in the loop, and how far through it, 0 to 1. */
export function at(t: number) {
  const time = ((t % LOOP) + LOOP) % LOOP;
  let index = steps.length - 1;
  for (let i = 1; i < steps.length; i++)
    if (time < starts[i]) {
      index = i - 1;
      break;
    }
  return {
    index,
    /** Seconds into the step. */
    time: time - starts[index],
    progress: (time - starts[index]) / steps[index].length,
  };
}

/** 0 before `from` seconds, 1 after `from + over`, eased between. */
export function ramp(time: number, from: number, over: number) {
  const x = Math.min(1, Math.max(0, (time - from) / over));
  return x * x * (3 - 2 * x);
}
