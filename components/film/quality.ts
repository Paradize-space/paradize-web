/**
 * How hard to push the GPU, decided once from what the device says
 * about itself. The scene is cheap at every tier (baked light, about
 * twenty draw calls, nothing drawn unless the scroll moves); the tiers
 * trade pixel density and antialiasing, which is where the cost is.
 *
 *   low   few cores, little memory, Save-Data on, or no GPU at all
 *         (the browser is drawing in software): 1x pixels, no MSAA
 *   mid   phones and tablets: up to 1.5x, MSAA
 *   high  everything else: up to 2x, MSAA
 *
 * If frames still come slowly, the governor in the studio lowers the
 * resolution further while the film plays.
 */

export type Tier = "low" | "mid" | "high";

type DeviceHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

/** True when WebGL is running on the CPU (SwiftShader, llvmpipe, WARP). */
function softwareRenderer() {
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    if (!gl) return true;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = info
      ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
      : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /swiftshader|llvmpipe|softpipe|basic render|software/i.test(name);
  } catch {
    return false;
  }
}

export function detectTier(): Tier {
  if (typeof navigator === "undefined") return "mid";
  const nav = navigator as DeviceHints;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  if (nav.connection?.saveData || cores <= 4 || memory <= 4) return "low";
  if (softwareRenderer()) return "low";
  if (window.matchMedia("(pointer: coarse)").matches) return "mid";
  return "high";
}

export function renderSettings(tier: Tier) {
  const ratio =
    typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  const cap = tier === "low" ? 1 : tier === "mid" ? 1.5 : 2;
  const dpr = Math.min(ratio, cap);
  return {
    dpr,
    /** The lowest the governor may take the resolution. */
    minDpr: Math.min(dpr, 0.75),
    antialias: tier !== "low",
  };
}
