import type { RequirementStatus } from "@/lib/data/desk-sensor";

/**
 * How each requirement state is coloured.
 *
 * Shared rather than declared next to the table that first needed it:
 * the marketplace page explains these states and the platform table
 * uses them, and the two drifting apart would be worse than the import.
 *
 * Green, amber and red are spent here and nowhere else on the site.
 */
export const statusTone: Record<RequirementStatus, string> = {
  ready: "border-ok/30 bg-ok/10 text-ok",
  missing: "border-gone/35 bg-gone/10 text-gone",
  "in-use": "border-warn/30 bg-warn/10 text-warn",
  "tool-ready": "border-line-2 bg-slab text-mute",
};
