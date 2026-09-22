/**
 * Fixtures for the marketplace preview.
 *
 * Three rules hold this file honest.
 *
 * The photographs are real components, because a mock-up of a parts
 * marketplace full of grey boxes teaches nobody anything. They are
 * stock images under the Unsplash Licence (all checked as free, not
 * Unsplash+) and the preview says on its face that they are stock.
 *
 * None of them shows a legible brand. The first pass used photographs
 * of a Pimoroni BME680, a MikroElektronika click shield and an Arduino
 * Uno — all with the maker's name readable, and the demo pushes the
 * camera in far enough to read it. A named third-party board inside a
 * listing card with an Add button reads as a supplier relationship,
 * and there is no supplier. These are unbranded boards: component
 * markings and silkscreen reference designators only.
 *
 * The listings describe a CLASS of part rather than naming a product,
 * for the same reason. And there are no prices and no sellers: nothing
 * is connected, so there is nothing truthful to put in those columns.
 */

export type Listing = {
  id: string;
  /** Generic class of part, not a product name. */
  title: string;
  spec: string;
  photo: string;
  alt: string;
  /** Photographer, for the footer credit. */
  by: string;
  handle: string;
  /** Does it satisfy the requirement the check flagged? */
  matches: boolean;
};

export const marketQuery = "sensor module · I2C";

export const listings: Listing[] = [
  {
    id: "l-1",
    title: "Environmental sensor breakout",
    spec: "I²C · 3.3 V · header not fitted",
    photo: "/parts/sensor-a.jpg",
    alt: "A close photograph of a green circuit board with a small shielded module soldered to it.",
    by: "Harrison Broadbent",
    handle: "harrisonbroadbent",
    matches: true,
  },
  {
    id: "l-2",
    title: "Temperature and humidity module",
    spec: "I²C · 3.3–5 V · pre-soldered",
    photo: "/parts/sensor-b.jpg",
    alt: "A close photograph of a green circuit board covered in surface-mount components.",
    by: "Akshat Sharma",
    handle: "asphotographypics",
    matches: false,
  },
  {
    id: "l-3",
    title: "Air-quality sensor add-on",
    spec: "I²C · 3.3 V · stacking header",
    photo: "/parts/sensor-c.jpg",
    alt: "A close photograph of a green circuit board showing plated holes and printed traces.",
    by: "Brian Wangenheim",
    handle: "brianwangenheim",
    matches: false,
  },
];

/** Photographs used for the parts already in the build. */
export const partPhotos: Record<string, { src: string; alt: string }> = {
  "controller-board": {
    src: "/parts/controller.jpg",
    alt: "A close photograph of a teal circuit board with a crystal and a microcontroller.",
  },
  // The same photograph the matching listing card uses, so the line
  // the check flags and the part that fills it read as one thing.
  "sensor-module": {
    src: "/parts/sensor-a.jpg",
    alt: "A close photograph of a green circuit board with a small shielded module soldered to it.",
  },
  "display-module": {
    src: "/parts/display.jpg",
    alt: "A character LCD module lit blue.",
  },
  "sensor-ribbon": {
    src: "/parts/ribbon.jpg",
    alt: "A fanned-out ribbon cable of coloured jumper wires.",
  },
};

/** The sample profile the preview opens on. Not a real person. */
export const demoProfile = {
  handle: "@deskworks",
  bio: "Small sensors and bench tools.",
  projects: [
    { name: "Desk Sensor", release: "Mk 1.2", current: true },
    { name: "Bench clock", release: "Mk 2.0", current: false },
    { name: "Filament dryer", release: "Mk 1.0", current: false },
  ],
};

/** Credits for the component photographs, for the footer. */
export const partCredits = [
  { by: "Harrison Broadbent", handle: "harrisonbroadbent" },
  { by: "Akshat Sharma", handle: "asphotographypics" },
  { by: "Brian Wangenheim", handle: "brianwangenheim" },
  { by: "Tanvesh Sarve", handle: "tanvesh01" },
  { by: "Thorium", handle: "232_038t" },
];
