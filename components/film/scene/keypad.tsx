"use client";

/* Animated imperatively from useFrame: positions, morph influences,
 * instance matrices and material opacity are mutated in place, which
 * is how React Three Fiber expects animation to run. The React
 * Compiler's immutability rule assumes the opposite, so it is off here. */
/* eslint-disable react-hooks/immutability */

import { useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type MutableRefObject,
} from "react";
import * as THREE from "three";

import type { Pose } from "../timeline";
import { FRAME_ORDER } from "./frame-order";
import {
  BOARD_DEPTH,
  BOARD_X0,
  BOARD_Z0,
  boardWidth,
  silkscreenTexture,
} from "./silkscreen";
import {
  ACCENT_KEY,
  boardGeometry,
  caseGeometry,
  controllerGeometries,
  COVER_X0,
  coverGeometry,
  encoderGeometries,
  glowGeometry,
  KEYS,
  KNOB_X,
  keycapGeometry,
  knobGeometry,
  LEFT,
  ledGeometry,
  padsGeometry,
  plateGeometry,
  plateScrewsGeometry,
  switchGeometries,
  WIDTH_A,
  WIDTH_B,
  Y,
} from "./geometry";
import {
  glowTexture,
  makeMaterials,
  MATCAPS,
  matcapUrl,
  shadowTexture,
} from "./materials";

/** How far each layer lifts when the keypad comes apart, in units. */
const LIFT = { board: 1.5, plate: 3.0, switches: 4.3, caps: 5.8 };
/** Where the upper layers wait, out of shot, before they land. */
const AWAY = { plate: 7, switches: 9, caps: 11 };

const clamp = (t: number) => Math.min(1, Math.max(0, t));
const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
/** Stagger a 0–1 dial so layer i moves inside its own window. */
const stagger = (t: number, i: number, n = 4, overlap = 0.55) => {
  const span = 1 / (n - (n - 1) * overlap);
  return ease(clamp((t - i * span * (1 - overlap)) / span));
};

/**
 * The parts of the keypad, each with its own materials so any one can
 * turn to glass. On the film it is the two the shelf lacks.
 */
export const PARTS = [
  "board",
  "plate",
  "switches",
  "caps",
  "encoder",
  "knob",
] as const;
export type Part = (typeof PARTS)[number];

const KIT_PARTS: readonly Part[] = ["encoder", "knob"];

const LED_OFF = new THREE.Color("#3a3833");
const LED_ON = new THREE.Color("#ffd9b0");
const GLOW_ON = new THREE.Color("#ffb877");
const BLACK = new THREE.Color("#000000");

export function Keypad({
  pose,
  anchors,
}: {
  pose: MutableRefObject<Pose>;
  /** Filled with one empty object per labelled part, for the label layer. */
  anchors: MutableRefObject<Record<string, THREE.Object3D | null>>;
}) {
  const textures = useLoader(THREE.TextureLoader, MATCAPS.map(matcapUrl));
  const m = useMemo(
    () =>
      makeMaterials(
        Object.fromEntries(MATCAPS.map((n, i) => [n, textures[i]])) as never,
      ),
    [textures],
  );
  const glowMap = useMemo(() => glowTexture(), []);
  const shadowMap = useMemo(() => shadowTexture(), []);
  // The board's artwork, one sheet per revision.
  const art = useMemo(() => {
    const sheet = (rev: "a" | "b") =>
      new THREE.MeshBasicMaterial({
        map: silkscreenTexture(rev),
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        toneMapped: false,
      });
    return { a: sheet("a"), b: sheet("b") };
  }, []);

  const geo = useMemo(() => {
    const knob = knobGeometry();
    const enc = encoderGeometries();
    return {
      // The knob as glass is a plain cylinder: every knurl tooth would
      // catch the rim light and turn the glass into stripes.
      knobShell: new THREE.CylinderGeometry(0.9, 0.9, 1.15, 48).translate(
        0,
        0.575,
        0,
      ),
      case: caseGeometry(),
      board: boardGeometry(),
      pads: padsGeometry(),
      ctrl: controllerGeometries(),
      plate: plateGeometry(),
      screws: plateScrewsGeometry(),
      cover: coverGeometry(),
      sw: switchGeometries(),
      cap: keycapGeometry(),
      knob,
      enc,
      led: ledGeometry(),
      glow: glowGeometry(),
    };
  }, []);
  // Outlines for the glass, one per shape. The board has none: it
  // widens by morphing, and outlines cannot follow a morph.
  const edges = useMemo(() => {
    const e = (g: THREE.BufferGeometry, angle = 30) =>
      new THREE.EdgesGeometry(g, angle);
    return {
      ctrl: e(geo.ctrl.board),
      chip: e(geo.ctrl.chip),
      port: e(geo.ctrl.port),
      plate: e(geo.plate),
      cover: e(geo.cover),
      swBase: e(geo.sw.base),
      swTop: e(geo.sw.top),
      cap: e(geo.cap, 40),
      encBody: e(geo.enc.body),
      encShaft: e(geo.enc.shaft),
      // The knurling would outline every tooth; the glass is outlined
      // by its smooth shell instead.
      knob: e(geo.knobShell),
    };
  }, [geo]);

  // Every part has its own copies of its materials, so it can turn to
  // glass without touching the rest, plus a glass shell (an orange
  // translucent copy of its shapes) and outlines. The copies are
  // transparent from the start: three.js compiles an opaque material
  // with its alpha pinned to 1, and flipping it later would mean a
  // shader recompile in the middle of the scroll.
  const skins = useMemo(() => {
    const own = <T extends THREE.Material>(mat: T) => {
      const c = mat.clone() as T;
      c.transparent = true;
      return c;
    };
    const skin = <S extends Record<string, THREE.Material>>(solid: S) => ({
      solid,
      ghost: m.ghost.clone(),
      edge: m.ghostEdge.clone(),
    });
    return {
      board: skin({
        pcb: own(m.pcb),
        gold: own(m.gold),
        chip: own(m.chip),
        port: own(m.aluminium),
      }),
      plate: skin({ brass: own(m.brass) }),
      switches: skin({
        housing: own(m.housing),
        smoke: own(m.smoke),
        stem: own(m.stem),
      }),
      caps: skin({ cap: own(m.cap), accent: own(m.accent) }),
      encoder: skin({ pcb: own(m.pcb), shaft: own(m.knob) }),
      knob: skin({ knob: own(m.knob), gold: own(m.gold) }),
    };
  }, [m]);
  const allSkins = useMemo(() => Object.values(skins), [skins]);

  // Each key's light and glow has a material of its own, so lighting a
  // key is a colour change (a uniform) rather than a rewrite of a GPU
  // buffer. Rewriting instance buffers mid-scroll stalled some Windows
  // drivers for a fifth of a second the first time it happened.
  const lights = useMemo(
    () =>
      KEYS.map(() => {
        const led = m.led.clone();
        led.color.copy(LED_OFF);
        const glow = m.glow.clone();
        glow.map = glowMap;
        glow.color.copy(BLACK);
        return { led, glow };
      }),
    [m.led, m.glow, glowMap],
  );

  const root = useRef<THREE.Group>(null);
  const caseMesh = useRef<THREE.Mesh>(null);
  const boardMesh = useRef<THREE.Mesh>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const board = useRef<THREE.Group>(null);
  const plate = useRef<THREE.Group>(null);
  const cover = useRef<THREE.Group>(null);
  const switches = useRef<THREE.Group>(null);
  const caps = useRef<THREE.Group>(null);
  const encoder = useRef<THREE.Group>(null);
  const knob = useRef<THREE.Group>(null);
  const boardGhost = useRef<THREE.Mesh>(null);
  /** The nine keycaps, in key order, so the build can press each one. */
  const capMeshes = useRef<(THREE.Group | null)[]>([]);

  // Morph slots: three sizes morphTargetInfluences only in the Mesh
  // constructor, and R3F assigns the geometry afterwards.
  //
  // No culling: the keypad is a few dozen small meshes, so testing them
  // against the view saves next to nothing, and drawing all of them
  // every frame means the warm-up frame puts every one on the GPU (a
  // part that first scrolls into view would otherwise upload then). It
  // also keeps the widened case from being clipped by the bounds it had
  // before it widened.
  useLayoutEffect(() => {
    caseMesh.current?.updateMorphTargets();
    boardMesh.current?.updateMorphTargets();
    boardGhost.current?.updateMorphTargets();
    root.current?.traverse((o) => {
      o.frustumCulled = false;
    });
  }, []);

  /** The build dial as last applied, so the keys are only redone on change. */
  const last = useRef({ build: -1 });
  /** Set for the warm-up frame, which draws the (invisible) glass too. */
  const warming = useRef(false);

  // Warm-up. The first time three.js draws a material it compiles a
  // shader program, and the first time it draws a texture it uploads
  // it; on a slow GPU driver that is a pause of a second or more. Do
  // all of it now, while the visitor is still on the title screen,
  // with the glass briefly visible so its programs are made too,
  // and draw one frame so the geometry is on the GPU as well.
  const { gl, scene, camera, invalidate } = useThree();
  useEffect(() => {
    let cancelled = false;
    const idle =
      window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200));
    const warm = () => {
      if (cancelled) return;
      for (const t of [...textures, glowMap, shadowMap, art.a.map!, art.b.map!])
        gl.initTexture(t);
      const shells = (on: boolean) =>
        allSkins.forEach((sk) => {
          sk.ghost.visible = on;
          sk.edge.visible = on;
        });
      shells(true);
      const ready = gl.compileAsync(scene, camera);
      shells(false);
      ready.then(() => {
        if (cancelled) return;
        warming.current = true;
        invalidate();
      });
    };
    idle(warm);
    return () => {
      cancelled = true;
    };
  }, [
    gl,
    scene,
    camera,
    invalidate,
    textures,
    glowMap,
    shadowMap,
    art,
    allSkins,
  ]);

  useFrame(() => {
    const p = pose.current;
    if (root.current) root.current.rotation.y = p.spin;

    // Layers land in order (plate, switches, caps) as the film opens.
    const away = (i: number) => 1 - stagger(p.assemble, i, 3, 0.45);
    // Apart, the top layer leaves first; together, the bottom one lands
    // first. One dial runs both ways, so giving the higher layers the
    // earlier windows keeps every layer clear of the one below it in
    // both directions. (Board first would rise through the plate on the
    // way up; caps first would sink through it on the way down.)
    const lift = {
      board: LIFT.board * stagger(p.explode, 3),
      plate: LIFT.plate * stagger(p.explode, 2) + AWAY.plate * away(0),
      switches: LIFT.switches * stagger(p.explode, 1) + AWAY.switches * away(1),
      caps: LIFT.caps * stagger(p.explode, 0) + AWAY.caps * away(2),
    };
    if (board.current) board.current.position.y = lift.board;
    if (plate.current) plate.current.position.y = lift.plate;
    if (switches.current) switches.current.position.y = lift.switches;
    if (caps.current) caps.current.position.y = lift.caps;

    // The revision: the case and board widen first, then the knob and
    // its encoder rise into the new bay.
    const widen = ease(clamp(p.rev / 0.6));
    const knobIn = ease(clamp((p.rev - 0.35) / 0.65));
    for (const mesh of [
      caseMesh.current,
      boardMesh.current,
      boardGhost.current,
    ])
      if (mesh?.morphTargetInfluences) mesh.morphTargetInfluences[0] = widen;
    if (cover.current) cover.current.scale.x = Math.max(0.0001, widen);
    // The new board's artwork arrives once the board has grown.
    const revB = clamp((widen - 0.7) / 0.3);
    art.a.opacity = 1 - revB;
    art.b.opacity = revB;
    if (shadow.current) {
      const w = WIDTH_A + (WIDTH_B - WIDTH_A) * widen;
      shadow.current.scale.x = w / WIDTH_A;
      shadow.current.position.x = LEFT + w / 2;
    }
    if (knob.current) {
      knob.current.position.y = Y.knob + lift.caps + (1 - knobIn) * 2.2;
      knob.current.scale.setScalar(Math.max(0.0001, knobIn));
    }
    if (encoder.current) {
      encoder.current.position.y = lift.board;
      encoder.current.scale.setScalar(Math.max(0.0001, knobIn));
    }

    // Glass: the shelf dial turns the kit parts, held back until it is
    // a quarter of the way so it never bleeds into the scene before.
    const shelf = clamp((p.ghost - 0.25) / 0.75);
    for (const part of PARTS) {
      const g = KIT_PARTS.includes(part) ? shelf : 0;
      const sk = skins[part];
      for (const mat of Object.values(sk.solid)) {
        mat.opacity = 1 - g;
        mat.depthWrite = g < 0.5;
      }
      const shown = g > 0.01 || warming.current;
      sk.ghost.visible = shown;
      sk.ghost.uniforms.opacity.value = g;
      sk.edge.visible = shown;
      sk.edge.opacity = 0.45 * g;
    }
    warming.current = false;

    // The build: each key presses home in turn and its light comes on.
    // Only recomputed when the build dial has actually moved.
    if (Math.abs(p.build - last.current.build) > 0.0005) {
      last.current.build = p.build;
      KEYS.forEach((_, i) => {
        const t = clamp(p.build * KEYS.length - i);
        const cap = capMeshes.current[i];
        if (cap) cap.position.y = Y.cap - Math.sin(t * Math.PI) * 0.18;
        lights[i].led.color.copy(LED_OFF).lerp(LED_ON, t);
        lights[i].glow.color.copy(BLACK).lerp(GLOW_ON, t * 0.55);
      });
    }
  }, FRAME_ORDER.model);

  const anchor = (key: string) => (el: THREE.Object3D | null) => {
    anchors.current[key] = el;
  };

  return (
    <group ref={root}>
      {/* Shadow on the table, baked once, stretched with the case. */}
      <mesh
        ref={shadow}
        position={[0, 0.003, 0.25]}
        rotation-x={-Math.PI / 2}
        renderOrder={-1}
      >
        <planeGeometry args={[9.5, 10.9]} />
        <meshBasicMaterial
          map={shadowMap}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={caseMesh} geometry={geo.case} material={m.aluminium} />
      <group ref={anchor("case")} position={[-4.6, 0.6, 3.6]} />

      <group ref={board}>
        <mesh
          ref={boardMesh}
          geometry={geo.board}
          material={skins.board.solid.pcb}
          position-y={Y.board}
        />
        <mesh
          ref={boardGhost}
          geometry={geo.board}
          material={skins.board.ghost}
          position-y={Y.board}
        />
        <mesh geometry={geo.pads} material={skins.board.solid.gold} />
        <Piece
          geometry={geo.ctrl.board}
          edges={edges.ctrl}
          material={skins.board.solid.pcb}
          skin={skins.board}
        />
        <Piece
          geometry={geo.ctrl.chip}
          edges={edges.chip}
          material={skins.board.solid.chip}
          skin={skins.board}
        />
        <Piece
          geometry={geo.ctrl.port}
          edges={edges.port}
          material={skins.board.solid.port}
          skin={skins.board}
        />
        {(["a", "b"] as const).map((rev) => (
          <mesh
            key={rev}
            material={art[rev]}
            position={[
              BOARD_X0 + boardWidth(rev) / 2,
              Y.board + 0.163,
              BOARD_Z0 + BOARD_DEPTH / 2,
            ]}
            rotation-x={-Math.PI / 2}
            // After the board, which is in the transparent pass too.
            renderOrder={1}
          >
            <planeGeometry args={[boardWidth(rev), BOARD_DEPTH]} />
          </mesh>
        ))}
        {KEYS.map(([x, z], i) => (
          <mesh
            key={i}
            geometry={geo.led}
            material={lights[i].led}
            position={[x, Y.board + 0.17, z - 0.45]}
          />
        ))}
        <group ref={anchor("board")} position={[-4.6, 0.6, 1.8]} />
      </group>

      <group ref={encoder} position={[KNOB_X, 0, 0]}>
        <Piece
          geometry={geo.enc.body}
          edges={edges.encBody}
          material={skins.encoder.solid.pcb}
          skin={skins.encoder}
        />
        <Piece
          geometry={geo.enc.shaft}
          edges={edges.encShaft}
          material={skins.encoder.solid.shaft}
          skin={skins.encoder}
        />
        <group ref={anchor("encoder")} position={[1.0, 0.8, 0]} />
      </group>

      <group ref={plate}>
        <Piece
          geometry={geo.plate}
          edges={edges.plate}
          material={skins.plate.solid.brass}
          skin={skins.plate}
          position-y={Y.plate}
        />
        <mesh geometry={geo.screws} material={m.knob} />
        <group ref={cover} position={[COVER_X0, Y.plate, 0]}>
          <Piece
            geometry={geo.cover}
            edges={edges.cover}
            material={skins.plate.solid.brass}
            skin={skins.plate}
          />
        </group>
        {KEYS.map(([x, z], i) => (
          <mesh
            key={i}
            geometry={geo.glow}
            material={lights[i].glow}
            position={[x, Y.plate + 0.16, z]}
            renderOrder={2}
          />
        ))}
        <group ref={anchor("plate")} position={[-4.6, 1.1, 0]} />
      </group>

      <group ref={switches}>
        <Piece
          geometry={geo.sw.base}
          edges={edges.swBase}
          material={skins.switches.solid.housing}
          skin={skins.switches}
        />
        <Piece
          geometry={geo.sw.top}
          edges={edges.swTop}
          material={skins.switches.solid.smoke}
          skin={skins.switches}
        />
        <mesh geometry={geo.sw.stem} material={skins.switches.solid.stem} />
        <group ref={anchor("switches")} position={[-4.6, 1.6, -1.8]} />
      </group>

      <group ref={caps}>
        {KEYS.map(([x, z], i) => (
          <group
            key={i}
            ref={(el) => {
              capMeshes.current[i] = el;
            }}
            position={[x, Y.cap, z]}
          >
            <Piece
              geometry={geo.cap}
              edges={edges.cap}
              material={
                i === ACCENT_KEY
                  ? skins.caps.solid.accent
                  : skins.caps.solid.cap
              }
              skin={skins.caps}
            />
          </group>
        ))}
        <group ref={anchor("caps")} position={[-4.6, 2.4, -3.6]} />
      </group>

      <group ref={knob} position={[KNOB_X, Y.knob, 0]}>
        <Piece
          geometry={geo.knob}
          shell={geo.knobShell}
          edges={edges.knob}
          material={skins.knob.solid.knob}
          skin={skins.knob}
        />
        <mesh material={skins.knob.solid.gold} position={[0, 1.16, 0.55]}>
          <boxGeometry args={[0.08, 0.02, 0.4]} />
        </mesh>
        <group ref={anchor("knob")} position={[1.3, 0.6, 0]} />
      </group>
    </group>
  );
}

/**
 * One shape of a part, drawn three ways that share a transform: solid,
 * as glass, and as the glass's outline. Which of them shows is down to
 * the part's materials, set every frame.
 */
function Piece({
  geometry,
  shell = geometry,
  edges,
  material,
  skin,
  ...place
}: {
  geometry: THREE.BufferGeometry;
  /** The shape drawn as glass, when it is not the solid's own. */
  shell?: THREE.BufferGeometry;
  edges: THREE.BufferGeometry;
  material: THREE.Material;
  skin: { ghost: THREE.Material; edge: THREE.Material };
  "position-y"?: number;
}) {
  return (
    <>
      <mesh geometry={geometry} material={material} {...place} />
      <mesh geometry={shell} material={skin.ghost} {...place} />
      <lineSegments geometry={edges} material={skin.edge} {...place} />
    </>
  );
}
