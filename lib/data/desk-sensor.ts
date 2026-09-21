/**
 * Local fixture data for the concept demonstration on the landing page.
 *
 * Everything here describes a FICTIONAL project ("Desk Sensor"). It is not
 * connected to an account, a repository, a supplier or a live inventory, and
 * the UI labels it as sample data wherever it is shown.
 *
 * Vocabulary used across the demo:
 *   project         the evolving design
 *   release         a fixed, published snapshot of that design
 *   personal build  someone's physical implementation of a release
 *   fork            a separate development line derived from another project
 */

export type ItemKind = "component" | "tool";

/** One line in the person's own inventory. */
export type InventoryRecord = {
  id: string;
  name: string;
  /** Short identifier, rendered in monospace. */
  ref: string;
  kind: ItemKind;
  /** Units the person owns in total. */
  owned: number;
  /** Units not committed to another build. Owning is not the same as available. */
  available: number;
  /** Where the remaining units sit, when they are committed elsewhere. */
  allocation?: { build: string; note: string };
};

/** A release's requirement for one inventory item. */
export type Requirement = {
  itemId: string;
  /** Components are counted. Tools are needed, not consumed. */
  quantity: number;
};

export type ReleaseInstruction = {
  step: string;
  title: string;
  detail: string;
};

/** How the object is drawn for this release. */
export type Geometry = {
  /** Rev A carries the sensor on the main board; Rev B moves it to a ribbon. */
  sensorMount: "board" | "ribbon";
  hasDisplay: boolean;
  /** Overall width across the assembly, in mm, for the dimension line. */
  overallWidth: string;
};

export type Release = {
  id: string;
  /** Release label, e.g. "Mk 1.2". */
  name: string;
  hardwareRevision: string;
  firmwareVersion: string;
  isLatest: boolean;
  /** Where this release sits in the project history. */
  standing: string;
  note: string;
  changes: string[];
  requirements: Requirement[];
  geometry: Geometry;
  instructionCount: number;
  instructions: ReleaseInstruction[];
};

export type Project = {
  slug: string;
  name: string;
  summary: string;
  releases: Release[];
};

/** The person's inventory in the demonstration. */
export const inventory: Record<string, InventoryRecord> = {
  "controller-board": {
    id: "controller-board",
    name: "Controller board",
    ref: "PZ-CTL-04",
    kind: "component",
    owned: 1,
    available: 1,
  },
  "sensor-module": {
    id: "sensor-module",
    name: "Sensor module",
    ref: "PZ-SNS-11",
    kind: "component",
    owned: 0,
    available: 0,
  },
  "display-module": {
    id: "display-module",
    name: "Display module",
    ref: "PZ-DSP-02",
    kind: "component",
    owned: 1,
    available: 0,
    allocation: {
      build: "Bench clock",
      note: "Installed in another personal build. An inventory check never reclaims a part from a build you have already assembled.",
    },
  },
  "sensor-ribbon": {
    id: "sensor-ribbon",
    name: "Ribbon cable, 6-way",
    ref: "PZ-CBL-06",
    kind: "component",
    owned: 2,
    available: 2,
  },
  "soldering-iron": {
    id: "soldering-iron",
    name: "Soldering iron",
    ref: "TL-SLD-01",
    kind: "tool",
    owned: 1,
    available: 1,
  },
};

export const deskSensor: Project = {
  slug: "desk-sensor",
  name: "Desk Sensor",
  summary:
    "A desk-mounted environment sensor: one controller board, one sensor module and a small display in a printed enclosure.",
  releases: [
    {
      id: "mk-1-2",
      name: "Mk 1.2",
      hardwareRevision: "Rev B",
      firmwareVersion: "v0.8.4",
      isLatest: true,
      standing: "Current release",
      note: "Rev B moves the sensor off the main board onto a short ribbon, so heat from the regulator stops skewing readings. Firmware v0.8.4 carries the matching pin map.",
      changes: [
        "Sensor moved to a ribbon-mounted module",
        "Pin map updated for Rev B",
        "Default sample interval 1 s to 5 s",
      ],
      requirements: [
        { itemId: "controller-board", quantity: 1 },
        { itemId: "sensor-module", quantity: 1 },
        { itemId: "display-module", quantity: 1 },
        { itemId: "sensor-ribbon", quantity: 1 },
        { itemId: "soldering-iron", quantity: 1 },
      ],
      geometry: {
        sensorMount: "ribbon",
        hasDisplay: true,
        overallWidth: "126.0",
      },
      instructionCount: 9,
      instructions: [
        {
          step: "01",
          title: "Print the enclosure",
          detail:
            "Two parts, no supports. Rev B shell only, since the Rev A shell has no ribbon slot.",
        },
        {
          step: "02",
          title: "Fit the controller board",
          detail: "Four M2 screws. Leave the ribbon header clear.",
        },
        {
          step: "03",
          title: "Mount the sensor on the ribbon",
          detail:
            "Solder the 6-way ribbon to the sensor module before seating it in the lid.",
        },
      ],
    },
    {
      id: "mk-1-1",
      name: "Mk 1.1",
      hardwareRevision: "Rev A",
      firmwareVersion: "v0.7.2",
      isLatest: false,
      standing: "Previous release",
      note: "Rev A keeps the sensor on the main board. Simpler to assemble, but readings drift while the board is warm.",
      changes: [
        "Display module added to the build",
        "Enclosure lid reprinted for the display cutout",
      ],
      requirements: [
        { itemId: "controller-board", quantity: 1 },
        { itemId: "sensor-module", quantity: 1 },
        { itemId: "display-module", quantity: 1 },
        { itemId: "soldering-iron", quantity: 1 },
      ],
      geometry: {
        sensorMount: "board",
        hasDisplay: true,
        overallWidth: "84.0",
      },
      instructionCount: 7,
      instructions: [
        {
          step: "01",
          title: "Print the enclosure",
          detail: "Rev A shell, two parts, no supports.",
        },
        {
          step: "02",
          title: "Fit the controller board",
          detail: "Four M2 screws. The sensor sits on the board itself.",
        },
        {
          step: "03",
          title: "Seat the display in the lid",
          detail: "Friction fit, then connect the 4-way header.",
        },
      ],
    },
    {
      id: "mk-1-0",
      name: "Mk 1.0",
      hardwareRevision: "Rev A",
      firmwareVersion: "v0.5.0",
      isLatest: false,
      standing: "First release",
      note: "The first published snapshot: controller and sensor only, readings over serial. Same board revision as Mk 1.1, so the hardware did not change between them, the firmware did.",
      changes: ["First published release", "Serial output only, no display"],
      requirements: [
        { itemId: "controller-board", quantity: 1 },
        { itemId: "sensor-module", quantity: 1 },
        { itemId: "soldering-iron", quantity: 1 },
      ],
      geometry: {
        sensorMount: "board",
        hasDisplay: false,
        overallWidth: "84.0",
      },
      instructionCount: 5,
      instructions: [
        {
          step: "01",
          title: "Print the enclosure",
          detail: "Rev A shell, no display cutout.",
        },
        {
          step: "02",
          title: "Fit the controller board",
          detail: "Four M2 screws.",
        },
        {
          step: "03",
          title: "Flash the firmware",
          detail: "Over USB, then read the output on serial at 115200 baud.",
        },
      ],
    },
  ],
};

export const defaultReleaseId = deskSensor.releases[0].id;

export function getRelease(releaseId: string): Release {
  return (
    deskSensor.releases.find((release) => release.id === releaseId) ??
    deskSensor.releases[0]
  );
}

export function getItem(itemId: string): InventoryRecord {
  const item = inventory[itemId];
  if (!item) throw new Error(`Unknown inventory item: ${itemId}`);
  return item;
}

/* ------------------------------------------------------------------ */
/* Derived state                                                       */
/* ------------------------------------------------------------------ */

export type RequirementStatus = "ready" | "missing" | "in-use" | "tool-ready";

export type CheckedRequirement = {
  item: InventoryRecord;
  required: number;
  status: RequirementStatus;
  /** Plain-language reading of owned against available. */
  holding: string;
};

/**
 * Compare a release's requirements against the inventory.
 *
 * This is an inventory *check*: nothing is reserved, consumed or moved between
 * builds. A part that is owned but installed in another build is not available.
 */
export function checkRequirements(release: Release): CheckedRequirement[] {
  return release.requirements.map(({ itemId, quantity }) => {
    const item = getItem(itemId);

    if (item.kind === "tool") {
      return {
        item,
        required: quantity,
        status: item.available > 0 ? "tool-ready" : "missing",
        holding:
          item.available > 0
            ? "Reusable tool, available"
            : "Reusable tool, not in your inventory",
      };
    }

    if (item.available >= quantity) {
      return {
        item,
        required: quantity,
        status: "ready",
        holding: `${quantity} required, ${item.available} available`,
      };
    }

    if (item.owned >= quantity) {
      return {
        item,
        required: quantity,
        status: "in-use",
        holding: `${quantity} required, ${item.owned} owned but installed in another build`,
      };
    }

    return {
      item,
      required: quantity,
      status: "missing",
      holding: `${quantity} required, none available`,
    };
  });
}

export const statusCopy: Record<
  RequirementStatus,
  { label: string; glyph: string; description: string }
> = {
  ready: {
    label: "Ready",
    glyph: "●",
    description: "In your inventory and free to use.",
  },
  missing: {
    label: "Missing",
    glyph: "○",
    description: "Not in your inventory. Needs sourcing.",
  },
  "in-use": {
    label: "In use",
    glyph: "◐",
    description: "Owned, but committed to another build.",
  },
  "tool-ready": {
    label: "Tool ready",
    glyph: "▲",
    description: "A reusable tool you already have, not a purchase.",
  },
};
