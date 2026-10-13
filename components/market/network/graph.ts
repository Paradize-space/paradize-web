/**
 * The marketplace network: builders and stores scattered over a disc,
 * joined two ways. A store sends a builder parts ("supply"); a builder
 * builds from another builder's project ("build"). Made from a seed,
 * so the server and every visit draw the same one.
 *
 * Four of the nodes are the story's cast and sit where the camera
 * frames them best; the rest are anonymous and fill in around them.
 */

export type Kind = "builder" | "store";

export type GraphNode = {
  kind: Kind;
  /** On a disc of radius 1: x across, z towards the viewer, y up. */
  x: number;
  y: number;
  z: number;
  /** A character from the story, if this node is one. */
  name?: string;
  /** Offset for the node's slow shimmer, so they do not pulse together. */
  phase: number;
};

export type GraphEdge = {
  kind: "supply" | "build";
  /** Supply runs store to builder; build runs maker to the one copying. */
  from: number;
  to: number;
  /** How high the arc rises over the disc. */
  lift: number;
};

export type Graph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  /** Node index of each named character. */
  cast: Record<string, number>;
  /** The node indices of the maker and the builder. */
  roles: { maker: number; builder: number };
  /** The edges the story lights, by role. */
  story: {
    /** The maker to the builders who start on the release. */
    follow: number[];
    /** Each store to the builder, by store name. */
    supply: Record<string, number>;
    /** The builder to those who build from their copy. */
    copy: number[];
    /** For each copy edge, a store that then supplies that builder. */
    resupply: number[];
  };
};

export type Cast = {
  maker: string;
  builder: string;
  stores: string[];
};

const TAU = Math.PI * 2;

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Where the cast sit on the disc, in front, where the camera is close. */
const SEATS = {
  maker: [-0.46, -0.06],
  builder: [0.12, 0.38],
  stores: [
    [-0.32, 0.66],
    [0.6, 0.42],
  ],
} as const;

export function makeGraph({
  builders,
  stores,
  cast,
  seed = 7,
}: {
  builders: number;
  stores: number;
  cast: Cast;
  seed?: number;
}): Graph {
  const rnd = seeded(seed);
  const nodes: GraphNode[] = [];
  const place = (kind: Kind, x: number, z: number, name?: string) => {
    nodes.push({
      kind,
      x,
      y: (rnd() - 0.5) * 0.05,
      z,
      name,
      phase: rnd() * TAU,
    });
    return nodes.length - 1;
  };

  const seat: Record<string, number> = {};
  seat[cast.maker] = place("builder", ...SEATS.maker, cast.maker);
  seat[cast.builder] = place("builder", ...SEATS.builder, cast.builder);
  cast.stores.forEach((name, i) => {
    const [x, z] = SEATS.stores[i % SEATS.stores.length];
    seat[name] = place("store", x, z, name);
  });

  // Scatter the rest, keeping a little room round each node.
  const clear = (x: number, z: number, gap: number) =>
    nodes.every((n) => Math.hypot(n.x - x, n.z - z) > gap);
  const scatter = (kind: Kind, count: number, inner: number, gap: number) => {
    for (
      let made = 0, tries = 0;
      made < count && tries < count * 400;
      tries++
    ) {
      const a = rnd() * TAU;
      const r = Math.sqrt(inner * inner + (1 - inner * inner) * rnd());
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (!clear(x, z, gap)) continue;
      place(kind, x, z);
      made++;
    }
  };
  scatter("store", stores - cast.stores.length, 0.12, 0.3);
  scatter("builder", builders - 2, 0.04, 0.085);

  const all = nodes.map((_, i) => i);
  const storeIds = all.filter((i) => nodes[i].kind === "store");
  const builderIds = all.filter((i) => nodes[i].kind === "builder");
  const dist = (a: number, b: number) =>
    Math.hypot(nodes[a].x - nodes[b].x, nodes[a].z - nodes[b].z);
  const edges: GraphEdge[] = [];
  const has = new Set<string>();
  const link = (kind: GraphEdge["kind"], from: number, to: number) => {
    const key = from < to ? `${from}-${to}` : `${to}-${from}`;
    if (has.has(key))
      return edges.findIndex(
        (e) =>
          (e.from === from && e.to === to) || (e.from === to && e.to === from),
      );
    has.add(key);
    edges.push({ kind, from, to, lift: 0.05 + 0.2 * dist(from, to) });
    return edges.length - 1;
  };
  /** Pick one of `pool`, favouring the near ones. */
  const near = (to: number, pool: number[], falloff: number) => {
    const w = pool.map((i) => 1 / (dist(i, to) + falloff) ** 2);
    let r = rnd() * w.reduce((a, b) => a + b, 0);
    for (let k = 0; k < pool.length; k++) if ((r -= w[k]) <= 0) return pool[k];
    return pool[pool.length - 1];
  };

  // The story's edges first, so they are certain to exist.
  const builderId = seat[cast.builder];
  const makerId = seat[cast.maker];
  const supply: Record<string, number> = {};
  for (const name of cast.stores)
    supply[name] = link("supply", seat[name], builderId);
  const others = builderIds.filter((i) => i !== builderId && i !== makerId);
  const byDistance = (from: number) =>
    [...others].sort((a, b) => dist(a, from) - dist(b, from));
  const follow = [
    link("build", makerId, builderId),
    ...byDistance(makerId)
      .slice(0, 3)
      .map((i) => link("build", makerId, i)),
  ];
  // Theo's copies go further afield: the network carries a build on.
  const copiers = byDistance(builderId).filter(
    (i) => dist(i, builderId) > 0.35,
  );
  const copyTo = [copiers[0], copiers[3], copiers[7]].filter(
    (i) => i !== undefined,
  );
  const copy = copyTo.map((i) => link("build", builderId, i));
  const resupply = copyTo.map((i) => link("supply", near(i, storeIds, 0.2), i));

  // Everyone else: each builder buys from one to three stores, mostly
  // near ones, and some build from another builder's project, more
  // often from builders already copied.
  for (const b of builderIds) {
    const n = 1 + (rnd() < 0.55 ? 1 : 0) + (rnd() < 0.2 ? 1 : 0);
    for (let k = 0; k < n; k++) link("supply", near(b, storeIds, 0.25), b);
  }
  const fans = new Map<number, number>();
  for (const b of builderIds) {
    if (b === makerId || rnd() > 0.32) continue;
    const pool = builderIds.filter((i) => i !== b);
    const w = pool.map(
      (i) => (1 + 2 * (fans.get(i) ?? 0)) / (dist(i, b) + 0.35),
    );
    let r = rnd() * w.reduce((a, c) => a + c, 0);
    let pick = pool[0];
    for (let k = 0; k < pool.length; k++)
      if ((r -= w[k]) <= 0) {
        pick = pool[k];
        break;
      }
    link("build", pick, b);
    fans.set(pick, (fans.get(pick) ?? 0) + 1);
  }

  return {
    nodes,
    edges,
    cast: seat,
    roles: { maker: makerId, builder: builderId },
    story: { follow, supply, copy, resupply },
  };
}
