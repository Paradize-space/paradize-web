import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import { partsFor, type Piece } from "./parts";

/**
 * The shot page. Photographs one product at a time, the way a listing
 * photo is lit: a soft key from above and in front, a cool rim from
 * behind, a dim room for the reflections, and a soft contact shadow on
 * an otherwise transparent background, so the picture sits on any
 * page. Drawn at twice the size and scaled down. Driven by render.cjs.
 */

type Shot = {
  /** A part from parts.ts. */
  id: string;
  width: number;
  height: number;
};

declare global {
  interface Window {
    __shoot: (s: Shot) => Promise<string>;
  }
}

const SUPERSAMPLE = 2;

function subject(id: string): Piece[] {
  return partsFor[id]();
}

window.__shoot = async ({ id, width, height }) => {
  await document.fonts.ready;
  await document.fonts.load("66px 'Fragment Mono'").catch(() => {});
  const w = width * SUPERSAMPLE;
  const h = height * SUPERSAMPLE;
  const canvas = document.createElement("canvas");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(1);
  renderer.setSize(w, h, false);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.5;

  const group = new THREE.Group();
  for (const p of subject(id)) {
    const mesh = new THREE.Mesh(p.geometry, p.material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  scene.add(group);

  // Frame it: centre the subject and fit its bounding sphere.
  const box = new THREE.Box3().setFromObject(group);
  const centre = box.getCenter(new THREE.Vector3());
  const radius = box.getBoundingSphere(new THREE.Sphere()).radius;
  group.position.sub(new THREE.Vector3(centre.x, box.min.y, centre.z));

  const catcher = new THREE.Mesh(
    new THREE.PlaneGeometry(radius * 8, radius * 8).rotateX(-Math.PI / 2),
    new THREE.ShadowMaterial({ opacity: 0.45 }),
  );
  catcher.receiveShadow = true;
  scene.add(catcher);

  const key = new THREE.DirectionalLight(0xfff1e0, 2.4);
  key.position.set(radius * 1.2, radius * 3.2, radius * 2.2);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  const sc = key.shadow.camera;
  sc.left = sc.bottom = -radius * 2;
  sc.right = sc.top = radius * 2;
  sc.near = radius * 0.5;
  sc.far = radius * 10;
  key.shadow.radius = 6;
  key.shadow.bias = -0.0003;
  key.shadow.normalBias = 0.02;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xcfdcff, 1.4);
  rim.position.set(-radius * 3, radius * 1.5, -radius * 3);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 0.35);
  fill.position.set(-radius * 2, radius, radius * 3);
  scene.add(fill);

  const camera = new THREE.PerspectiveCamera(
    26,
    width / height,
    radius * 0.1,
    radius * 20,
  );
  const height0 = (box.max.y - box.min.y) * 0.4;
  camera.position.set(radius * 1.6, radius * 2.3, radius * 3.1);
  camera.lookAt(0, height0, 0);
  // Fit the subject's projected outline to the frame, with a margin:
  // project the corners of its box and move the camera in or out until
  // the widest of them sits at the edge.
  const target = new THREE.Vector3(0, height0, 0);
  const dir = camera.position.clone().sub(target).normalize();
  const fitted = new THREE.Box3().setFromObject(group);
  const corners = [0, 1, 2, 3, 4, 5, 6, 7].map(
    (i) =>
      new THREE.Vector3(
        i & 1 ? fitted.max.x : fitted.min.x,
        i & 2 ? fitted.max.y : fitted.min.y,
        i & 4 ? fitted.max.z : fitted.min.z,
      ),
  );
  let dist = radius * 4;
  for (let k = 0; k < 6; k++) {
    camera.position.copy(dir.clone().multiplyScalar(dist).add(target));
    camera.lookAt(target);
    camera.updateMatrixWorld();
    const extent = Math.max(
      ...corners.map((c) => {
        const v = c.clone().project(camera);
        return Math.max(Math.abs(v.x), Math.abs(v.y));
      }),
    );
    dist *= extent / 0.86;
  }
  camera.position.copy(dir.clone().multiplyScalar(dist).add(target));
  camera.lookAt(target);

  renderer.render(scene, camera);
  const small = document.createElement("canvas");
  small.width = width;
  small.height = height;
  const ctx = small.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(canvas, 0, 0, width, height);
  renderer.dispose();
  return small.toDataURL("image/webp", 0.9);
};
