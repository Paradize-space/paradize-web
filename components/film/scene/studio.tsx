"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Suspense,
  useMemo,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from "react";
import * as THREE from "three";

import type { Tier } from "../quality";
import { renderSettings } from "../quality";
import type { Pose, Shot } from "../timeline";
import { FRAME_ORDER } from "./frame-order";
import { Keypad } from "./keypad";

/**
 * The studio: a transparent canvas, no lights at all (the materials
 * carry their own), and `frameloop="demand"`: nothing is drawn unless
 * something calls invalidate(), which only the film's director does,
 * and only while the film is on screen and the scroll has moved.
 *
 * The pool of lamplight on the bench is not in the 3D scene. It is a
 * CSS gradient behind the canvas, moved to wherever the camera puts the
 * bench: as a full-screen transparent plane it cost a quarter of every
 * frame on slow machines; as a composited layer it costs nothing.
 */

/** Radius of the pool of light, in scene units, and where it falls. */
const POOL = { radius: 15, x: 0.6, z: 0 };
/** The pool element's own size in CSS pixels, before it is scaled. */
const POOL_PX = 1000;

/**
 * How far to scale a shot's sideways shift at a given screen width, so
 * the picture centres in the space right of the words. The words' right
 * edge is the copy panel's (film.module.css): 1.75rem in, min(29rem,
 * 33vw) wide, with the root size growing past 1920px (globals.css).
 */
function roomScale(width: number) {
  const rem = width >= 1920 ? Math.min(width / 120, 28) : 16;
  const words = 1.75 * rem + Math.min(29 * rem, 0.33 * width);
  const atDesign = (1.75 * 16 + Math.min(29 * 16, 0.33 * 1440)) / 1440;
  return words / width / atDesign;
}

/**
 * Points the camera along a shot. The picture fills the screen and
 * leaves room for words: to the left when wide, underneath when narrow.
 */
function CameraRig({ shot }: { shot: MutableRefObject<Shot> }) {
  const look = useRef(new THREE.Vector3());
  useFrame(({ camera, size }) => {
    const cam = camera as THREE.PerspectiveCamera;
    const s = shot.current;
    const wide = size.width >= 1024;
    // A portrait frame sees far less across, so the camera backs off
    // along its own line of sight in proportion to how narrow it is.
    const aspect = size.width / size.height;
    const back = aspect < 1 ? 1 + (1 - aspect) * 1.7 : 1;
    cam.position.set(
      s.target[0] + (s.position[0] - s.target[0]) * back,
      s.target[1] + (s.position[1] - s.target[1]) * back,
      s.target[2] + (s.position[2] - s.target[2]) * back,
    );
    look.current.set(s.target[0], s.target[1], s.target[2]);
    cam.lookAt(look.current);
    cam.fov = s.fov;
    // Wide: slide the picture right and leave the left for the words.
    // Narrow: lift it, because the words sit underneath. The shifts are
    // set for a 1440px screen; elsewhere they are scaled so the picture
    // stays centred in the room the words leave, which on a wide
    // display is proportionally much more.
    const dx = wide ? -s.shift * roomScale(size.width) * size.width : 0;
    const dy = wide ? 0 : (s.lift ?? 0.27) * size.height;
    if (dx || dy)
      cam.setViewOffset(
        size.width,
        size.height,
        dx,
        dy,
        size.width,
        size.height,
      );
    else cam.clearViewOffset();
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
  }, FRAME_ORDER.camera);
  return null;
}

/**
 * Places the pool of light: projects its centre and two points on its
 * rim (across and along the line of sight) and stretches the gradient
 * to the ellipse they make.
 */
function FloorPool({ el }: { el: MutableRefObject<HTMLDivElement | null> }) {
  const v = useMemo(
    () => ({
      c: new THREE.Vector3(),
      p: new THREE.Vector3(),
      right: new THREE.Vector3(),
      along: new THREE.Vector3(),
    }),
    [],
  );
  useFrame(({ camera, size }) => {
    const node = el.current;
    if (!node) return;
    const toScreen = (w: THREE.Vector3) => {
      w.project(camera);
      return [((w.x + 1) / 2) * size.width, ((1 - w.y) / 2) * size.height];
    };
    // Directions on the bench: across the view, and away from the camera.
    camera.getWorldDirection(v.along);
    v.along.setY(0).normalize();
    v.right.set(-v.along.z, 0, v.along.x);
    const [cx, cy] = toScreen(v.c.set(POOL.x, 0, POOL.z));
    const [rx0, ry0] = toScreen(
      v.p.set(POOL.x, 0, POOL.z).addScaledVector(v.right, POOL.radius),
    );
    const [ax0, ay0] = toScreen(
      v.p.set(POOL.x, 0, POOL.z).addScaledVector(v.along, POOL.radius),
    );
    const rx = Math.hypot(rx0 - cx, ry0 - cy);
    const ry = Math.max(Math.hypot(ax0 - cx, ay0 - cy), rx * 0.18);
    const x = (cx - POOL_PX / 2).toFixed(1);
    const y = (cy - POOL_PX / 2).toFixed(1);
    const sx = ((rx * 2) / POOL_PX).toFixed(4);
    const sy = ((ry * 2) / POOL_PX).toFixed(4);
    node.style.setProperty(
      "transform",
      `translate3d(${x}px, ${y}px, 0) scale(${sx}, ${sy})`,
    );
  }, FRAME_ORDER.labels);
  return null;
}

/**
 * Lowers the resolution if frames come slowly while the film plays.
 * Only back-to-back frames count (a gap means the scroll had paused),
 * and it only ever steps down, so it cannot see-saw.
 */
function Governor({ min }: { min: number }) {
  const state = useRef({ last: 0, samples: [] as number[] });
  useFrame(({ viewport, setDpr }) => {
    const st = state.current;
    const now = performance.now();
    const dt = now - st.last;
    st.last = now;
    if (dt > 100 || viewport.dpr <= min) return;
    st.samples.push(dt);
    if (st.samples.length < 30) return;
    const median = st.samples.sort((a, b) => a - b)[15];
    st.samples.length = 0;
    // Slower than about 42 frames a second: a fifth fewer pixels.
    if (median > 24) setDpr(Math.max(min, viewport.dpr * 0.8));
  });
  return null;
}

/**
 * Part labels as plain DOM over the canvas, each following an anchor in
 * the model: projected on every rendered frame and moved with a
 * transform. On phones they are hidden; the copy names the parts.
 */
function LabelProjector({
  anchors,
  els,
  pose,
}: {
  anchors: MutableRefObject<Record<string, THREE.Object3D | null>>;
  els: MutableRefObject<Record<string, HTMLElement | null>>;
  pose: MutableRefObject<Pose>;
}) {
  const v = useRef(new THREE.Vector3());
  useFrame(({ camera, size }) => {
    const p = pose.current;
    const c = (t: number) => Math.min(1, Math.max(0, t));
    const show = size.width < 640 ? 0 : c((p.explode - 0.72) / 0.28) * p.labels;
    const opacity = (key: string) =>
      key === "kit"
        ? size.width < 640
          ? 0
          : c((p.ghost - 0.6) / 0.4)
        : key === "knob"
          ? show * c((p.rev - 0.6) / 0.4)
          : show;
    for (const [key, el] of Object.entries(els.current)) {
      const a = anchors.current[key === "kit" ? "knob" : key];
      if (!el || !a) continue;
      const o = opacity(key);
      el.style.opacity = o.toFixed(3);
      if (o < 0.001) continue;
      // The parts moved this frame and the renderer has not yet
      // updated their world matrices; bring this one up to date first.
      a.updateWorldMatrix(true, false);
      v.current.setFromMatrixPosition(a.matrixWorld).project(camera);
      const x = ((v.current.x + 1) / 2) * size.width;
      const y = ((1 - v.current.y) / 2) * size.height;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
  }, FRAME_ORDER.labels);
  return null;
}

export function Studio({
  tier,
  pose,
  shot,
  labels,
  className,
  children,
}: {
  tier: Tier;
  pose: MutableRefObject<Pose>;
  shot: MutableRefObject<Shot>;
  labels: Record<string, ReactNode>;
  className?: string;
  /** Scene-graph children, e.g. a director. */
  children?: ReactNode;
}) {
  const anchors = useRef<Record<string, THREE.Object3D | null>>({});
  const els = useRef<Record<string, HTMLElement | null>>({});
  const pool = useRef<HTMLDivElement | null>(null);
  const { dpr, minDpr, antialias } = renderSettings(tier);

  return (
    <div className={className} style={{ position: "relative" }}>
      <div
        ref={pool}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: POOL_PX,
          height: POOL_PX,
          borderRadius: "50%",
          background:
            "radial-gradient(closest-side, rgb(50 46 40) 0%, rgb(36 33 29 / 0.92) 30%, rgb(16 15 13 / 0.6) 62%, rgb(1 1 1 / 0) 100%)",
          transformOrigin: "50% 50%",
          transform: "scale(0)",
          willChange: "transform",
          pointerEvents: "none",
        }}
      />
      <Canvas
        frameloop="demand"
        dpr={dpr}
        flat
        camera={{ fov: shot.current.fov, near: 0.5, far: 120 }}
        gl={{
          antialias,
          alpha: true,
          stencil: false,
          powerPreference: "high-performance",
        }}
      >
        <CameraRig shot={shot} />
        <FloorPool el={pool} />
        <Governor min={minDpr} />
        <Suspense fallback={null}>
          <Keypad pose={pose} anchors={anchors} />
        </Suspense>
        <LabelProjector anchors={anchors} els={els} pose={pose} />
        {children}
      </Canvas>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {Object.entries(labels).map(([key, node]) => (
          <div
            key={key}
            ref={(el) => {
              els.current[key] = el;
            }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              opacity: 0,
              willChange: "transform, opacity",
            }}
          >
            {node}
          </div>
        ))}
      </div>
    </div>
  );
}
