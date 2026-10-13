import * as THREE from "three";

/**
 * Materials, with the studio light baked in.
 *
 * Each surface is a MeshMatcapMaterial: one texture lookup by surface
 * angle, no lights, no shadows, no environment map. The matcaps in
 * /public/film/matcaps were rendered once from physical materials under
 * the studio's lighting (a large overhead softbox, two long strip
 * lights at the sides, a low front fill; ACES, exposure 0.92), which is
 * what the scene used to compute every frame. The look is the same; the
 * cost per pixel is a fraction.
 *
 * Source materials, should they need re-baking:
 *   aluminium  #d3d6da  metal 0.85  rough 0.46
 *   knob       #e4e6e9  metal 0.95  rough 0.24
 *   brass      #d1aa62  metal 0.95  rough 0.32
 *   pcb        #141516  metal 0.10  rough 0.50  clearcoat 0.35
 *   cap        #d9d3c6              rough 0.82  sheen 0.35
 *   accent     #f05a1e              rough 0.78  sheen 0.20
 *   housing    #232428              rough 0.55
 *   smoke      #2c2f35              rough 0.18  clearcoat 0.60
 *   stem       #d8402f              rough 0.45
 *   gold       #d2ab55  metal 1.00  rough 0.25
 *   chip       #0c0c0d  metal 0.20  rough 0.60
 */

export const MATCAPS = [
  "aluminium",
  "knob",
  "brass",
  "pcb",
  "cap",
  "accent",
  "housing",
  "smoke",
  "stem",
  "gold",
  "chip",
] as const;

export type MatcapName = (typeof MATCAPS)[number];

export const matcapUrl = (name: MatcapName) => `/film/matcaps/${name}.webp`;

/** The orange that marks what you are missing. */
export const SIGNAL = new THREE.Color("#f05a1e");

export function makeMaterials(textures: Record<MatcapName, THREE.Texture>) {
  const matcap = (name: MatcapName) => {
    const t = textures[name];
    t.colorSpace = THREE.SRGBColorSpace;
    // Already tone mapped when baked.
    return new THREE.MeshMatcapMaterial({ matcap: t, toneMapped: false });
  };

  const solid = Object.fromEntries(
    MATCAPS.map((n) => [n, matcap(n)]),
  ) as Record<MatcapName, THREE.MeshMatcapMaterial>;

  return {
    ...solid,
    /** The kit parts when you do not own them: orange glass. */
    ghost: ghostMaterial(),
    ghostEdge: new THREE.LineBasicMaterial({
      color: SIGNAL,
      transparent: true,
      opacity: 0,
    }),
    /** Per-key light colour comes from instanceColor; this is the base. */
    led: new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false }),
    glow: new THREE.MeshBasicMaterial({
      color: "#ffffff",
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
  };
}

export type Materials = ReturnType<typeof makeMaterials>;

/**
 * Glass for a part the shelf lacks: almost clear face-on and bright at
 * the silhouette, where real glass catches the light, so the part reads
 * as a solid you could hold rather than a cage of lines. `opacity` is
 * a uniform, 0 to 1. Morph targets are kept so the board can use it.
 */
export function ghostMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      color: { value: SIGNAL.clone() },
      opacity: { value: 0 },
    },
    vertexShader: /* glsl */ `
      #include <common>
      #include <morphtarget_pars_vertex>
      varying vec3 vNormalView;
      varying vec3 vToCamera;
      void main() {
        #include <beginnormal_vertex>
        #include <morphnormal_vertex>
        #include <defaultnormal_vertex>
        #include <begin_vertex>
        #include <morphtarget_vertex>
        #include <project_vertex>
        vNormalView = normalize(transformedNormal);
        vToCamera = normalize(-mvPosition.xyz);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 color;
      uniform float opacity;
      varying vec3 vNormalView;
      varying vec3 vToCamera;
      void main() {
        float rim = 1.0 - abs(dot(normalize(vNormalView), normalize(vToCamera)));
        float edge = pow(rim, 2.4);
        float alpha = opacity * (0.1 + 0.85 * edge);
        gl_FragColor = vec4(color * (0.75 + 0.9 * edge), clamp(alpha, 0.0, 1.0));
      }
    `,
    transparent: true,
    depthWrite: false,
  });
}

/** A soft radial spot, made once on a canvas, for the key glow. */
export function glowTexture() {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  grad.addColorStop(0, "rgba(255,255,255,0.9)");
  grad.addColorStop(0.45, "rgba(255,255,255,0.35)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * The keypad's shadow on the table, drawn once on a canvas: a blurred
 * rounded rectangle. It stretches with the case between revisions, so
 * nothing has to render a shadow pass ever again.
 */
export function shadowTexture() {
  const w = 512;
  const h = 384;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.filter = "blur(26px)";
  g.fillStyle = "rgba(0,0,0,0.62)";
  const pad = 70;
  const r = 40;
  g.beginPath();
  g.roundRect(pad, pad, w - pad * 2, h - pad * 2, r);
  g.fill();
  g.filter = "blur(8px)";
  g.fillStyle = "rgba(0,0,0,0.55)";
  g.beginPath();
  g.roundRect(pad + 14, pad + 14, w - pad * 2 - 28, h - pad * 2 - 28, r - 10);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
