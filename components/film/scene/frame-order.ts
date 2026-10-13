/**
 * The order the per-frame work runs in, as useFrame priorities.
 *
 * With on-demand rendering each scroll step draws exactly one frame,
 * so anything that reads another part's result has to run after it in
 * that same frame, or it shows the previous position once the scroll
 * stops. Negative priorities only order the callbacks; R3F still does
 * the drawing itself afterwards.
 */
export const FRAME_ORDER = {
  /** Camera position, aim and lens. */
  camera: -4,
  /** The keypad's parts move to the pose. */
  model: -3,
  /** Labels project the parts' new positions through the new camera. */
  labels: -1,
} as const;
