/**
 * The marketplace page's network: the people in its one story, and the
 * part each store sends.
 *
 * MADE UP. Mira, Theo, Kai and Lumen are invented for the illustration,
 * as is every unnamed builder and store around them; the page says
 * "Illustration · sample people and stores". There are no prices and
 * no counts, because any figure would be invented. The photographs are
 * rendered by tools/part-shots.
 */

import { latest, macropad } from "./macropad";

const photo = (id: string) => `/market/parts/${id}.webp`;

export const project = {
  name: macropad.name,
  release: latest.name,
  /** The builder who publishes it. */
  maker: macropad.owner,
};

/** The builder who builds it, and whose shelf is checked. */
export const builder = "theo";

/** The release's parts, and which of them are already on Theo's shelf. */
export const parts = latest.parts.map((p) => ({
  id: p.id,
  name: p.name,
  owned: p.owned,
  photo: photo(p.id),
}));

export const missing = parts.filter((p) => !p.owned);

/** The stores that send Theo the missing parts, one part each. */
export const stores = [
  { handle: "kai", sells: "Encoders", part: "encoder" },
  { handle: "lumen", sells: "Knobs", part: "knob" },
].map((s) => {
  const part = parts.find((p) => p.id === s.part);
  if (!part) throw new Error(`${latest.name} has no ${s.part}`);
  return { ...s, partName: part.name, photo: part.photo };
});
