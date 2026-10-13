/**
 * Macropad — the sample project the homepage film follows.
 *
 * FICTIONAL. A small macro keypad invented to demonstrate the product,
 * not a real Paradize project, account or listing. Every surface that
 * shows it says "sample project".
 *
 * Two releases, so there is a revision to show physically: Mk 1.0 is a
 * square nine-key pad on board Rev A; Mk 1.1 widens the case for a
 * rotary knob on board Rev B. The knob and its encoder are the two
 * lines the sample shelf does not hold, which is the point of the
 * marketplace page: the part the new revision added is the part you
 * need.
 */

export type PadPart = {
  id: string;
  ref: string;
  name: string;
  qty: number;
  /** On the sample shelf. */
  owned: boolean;
};

export type PadRelease = {
  id: string;
  name: string;
  board: string;
  firmware: string;
  /** Case width in millimetres; depth is 69 for both. */
  width: number;
  knob: boolean;
  change: string;
  /** What the release's files tab lists. */
  files: { name: string; kind: string }[];
  parts: PadPart[];
  steps: string[];
};

const core: PadPart[] = [
  {
    id: "controller",
    ref: "MP-CTL-01",
    name: "Controller board",
    qty: 1,
    owned: true,
  },
  {
    id: "switches",
    ref: "MP-SW-RED",
    name: "Key switches",
    qty: 9,
    owned: true,
  },
  { id: "keycaps", ref: "MP-CAP-9", name: "Keycap set", qty: 1, owned: true },
  { id: "plate", ref: "MP-PLT", name: "Switch plate", qty: 1, owned: true },
  { id: "screws", ref: "M2-6", name: "M2 screws", qty: 4, owned: true },
];

export const macropad = {
  name: "Macropad",
  // Mira is one of the made-up people on the marketplace page.
  owner: "mira",
  releases: [
    {
      id: "mk-1-0",
      name: "Mk 1.0",
      board: "Rev A",
      firmware: "v1.0.0",
      width: 69,
      knob: false,
      change: "First release: nine keys, USB-C.",
      files: [
        { name: "macropad.kicad_sch", kind: "Schematic" },
        { name: "macropad.kicad_pcb", kind: "Board, Rev A" },
        { name: "case.step", kind: "Case, 69 mm" },
        { name: "firmware-1.0.0.uf2", kind: "Firmware" },
      ],
      parts: core,
      steps: [
        "Seat the switches in the plate",
        "Solder the switches",
        "Mount the controller",
        "Close the case",
        "Fit the keycaps",
      ],
    },
    {
      id: "mk-1-1",
      name: "Mk 1.1",
      board: "Rev B",
      firmware: "v1.1.0",
      width: 91,
      knob: true,
      change: "Rotary knob added; case widened to 91 mm.",
      files: [
        { name: "macropad.kicad_sch", kind: "Schematic" },
        { name: "macropad.kicad_pcb", kind: "Board, Rev B" },
        { name: "case.step", kind: "Case, 91 mm" },
        { name: "firmware-1.1.0.uf2", kind: "Firmware" },
      ],
      parts: [
        ...core,
        {
          id: "encoder",
          ref: "MP-ENC-24",
          name: "Rotary encoder",
          qty: 1,
          owned: false,
        },
        {
          id: "knob",
          ref: "MP-KNB-AL",
          name: "Aluminium knob",
          qty: 1,
          owned: false,
        },
      ],
      steps: [
        "Seat the switches in the plate",
        "Solder the switches and the encoder",
        "Mount the controller",
        "Close the case",
        "Fit the keycaps",
        "Press on the knob",
      ],
    },
  ] satisfies PadRelease[],
};

export const latest = macropad.releases[macropad.releases.length - 1];
export const kit = latest.parts.filter((p) => !p.owned);
