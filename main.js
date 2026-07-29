// ============================================================
//  LUMEN Atelier — 3D Bag Shop
//  Three.js scene + interactions (rotate / color / cart)
// ============================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// If a model file named "bag.glb" exists in this folder (e.g. exported from
// Tripo3D / other 3D generative-AI tools), it is loaded automatically and
// replaces the procedural bag below. Otherwise the procedural bag is used.
const EXTERNAL_MODEL_URL = './bag.glb';

// ---------- Basic scene setup ----------
const canvas = document.getElementById('scene');
const stageEl = document.querySelector('.stage');

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();

// Image-based lighting for a premium, realistic look (no external files).
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// ---------- Camera ----------
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(0, 1.1, 6.2);

// ---------- Lights ----------
const hemi = new THREE.HemisphereLight(0xffffff, 0x8d8272, 0.55);
scene.add(hemi);

const key = new THREE.DirectionalLight(0xffffff, 2.1);
key.position.set(4, 7, 5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 1;
key.shadow.camera.far = 25;
key.shadow.camera.left = -6;
key.shadow.camera.right = 6;
key.shadow.camera.top = 6;
key.shadow.camera.bottom = -6;
key.shadow.bias = -0.0004;
key.shadow.radius = 6;
scene.add(key);

const rim = new THREE.DirectionalLight(0xfff0e0, 0.8);
rim.position.set(-5, 3, -4);
scene.add(rim);

// ---------- Ground (soft contact shadow) ----------
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40),
  new THREE.ShadowMaterial({ opacity: 0.22 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1.35;
ground.receiveShadow = true;
scene.add(ground);

// ============================================================
//  Procedural handbag model
//  Grouped so the whole bag rotates as one object.
// ============================================================
const bag = new THREE.Group();
scene.add(bag);

// Material whose color the user can change.
const leatherMat = new THREE.MeshStandardMaterial({
  color: 0x1a1a1a,
  roughness: 0.55,
  metalness: 0.05,
});

// Gold hardware.
const goldMat = new THREE.MeshStandardMaterial({
  color: 0xcaa96a,
  roughness: 0.28,
  metalness: 1.0,
});

// Stitching / accent (slightly lighter than body, follows body tint).
const stitchMat = new THREE.MeshStandardMaterial({
  color: 0x2a2a2a,
  roughness: 0.7,
  metalness: 0.0,
});

// --- Body ---
const body = new THREE.Mesh(
  new RoundedBoxGeometry(2.6, 2.0, 1.15, 6, 0.28),
  leatherMat
);
body.castShadow = true;
body.receiveShadow = true;
bag.add(body);

// --- Front flap ---
const flap = new THREE.Mesh(
  new RoundedBoxGeometry(2.5, 1.15, 0.12, 5, 0.16),
  leatherMat
);
flap.position.set(0, 0.42, 0.62);
flap.castShadow = true;
bag.add(flap);

// --- Clasp (gold) ---
const clasp = new THREE.Mesh(
  new RoundedBoxGeometry(0.55, 0.34, 0.16, 4, 0.06),
  goldMat
);
clasp.position.set(0, -0.18, 0.7);
clasp.castShadow = true;
bag.add(clasp);

const claspBtn = new THREE.Mesh(
  new THREE.CylinderGeometry(0.1, 0.1, 0.2, 24),
  goldMat
);
claspBtn.rotation.x = Math.PI / 2;
claspBtn.position.set(0, -0.18, 0.8);
bag.add(claspBtn);

// --- Handle (rounded arch tube) ---
function makeHandle(offsetX) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.7 + offsetX, 1.0, 0),
    new THREE.Vector3(-0.55 + offsetX, 1.7, 0),
    new THREE.Vector3(0 + offsetX, 1.95, 0),
    new THREE.Vector3(0.55 + offsetX, 1.7, 0),
    new THREE.Vector3(0.7 + offsetX, 1.0, 0),
  ]);
  const geo = new THREE.TubeGeometry(curve, 40, 0.07, 16, false);
  const mesh = new THREE.Mesh(geo, leatherMat);
  mesh.castShadow = true;
  return mesh;
}
const handle = makeHandle(0);
bag.add(handle);

// Handle anchors (gold rings)
[-0.7, 0.7].forEach((x) => {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.035, 12, 24), goldMat);
  ring.position.set(x, 1.0, 0);
  bag.add(ring);
});

// --- Feet ---
[[-0.9, -0.42], [0.9, -0.42]].forEach(([x, z]) => {
  const foot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), goldMat);
  foot.position.set(x, -1.02, z);
  foot.scale.y = 0.6;
  foot.castShadow = true;
  bag.add(foot);
});

// --- Stitch line accents on the flap ---
const stitchTop = new THREE.Mesh(
  new THREE.BoxGeometry(2.35, 0.02, 0.02),
  stitchMat
);
stitchTop.position.set(0, 0.9, 0.69);
bag.add(stitchTop);

bag.position.y = -0.15;

// ============================================================
//  Optional: load an AI-generated model (Tripo3D .glb)
//  Drop a file named "bag.glb" in this folder and it is used
//  automatically; the 6 color swatches keep working on it.
// ============================================================
function fitModelToStage(model) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const scale = 2.6 / maxDim;                // fit into the stage
  model.scale.setScalar(scale);
  // Re-center at origin after scaling.
  model.position.sub(center.multiplyScalar(scale));
  model.position.y += 0.1;
}

// Color the loaded model starts with = whatever swatch is currently active.
function activeSwatchColor() {
  const el = document.querySelector('.swatch.active');
  return new THREE.Color(el?.dataset.color || '#1a1a1a');
}

new GLTFLoader().load(
  EXTERNAL_MODEL_URL,
  (gltf) => {
    const model = gltf.scene;
    const initColor = activeSwatchColor();
    const mats = new Set();

    // Keep the model's surface detail (normal + roughness maps) so it still
    // looks like real croc leather, but drop the baked base-color image so the
    // color swatches drive a clean, obvious color change.
    model.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      o.receiveShadow = true;
      const m = o.material;
      m.map = null;                 // remove baked albedo → color = swatch
      m.emissiveMap = null;
      if (m.emissive) m.emissive.setRGB(0, 0, 0);
      m.metalnessMap = null;        // uniform non-metal so the color reads
      m.metalness = 0.15;
      // m.normalMap and m.roughnessMap are kept for realistic leather detail.
      m.color.copy(initColor);
      m.needsUpdate = true;
      mats.add(m);
    });

    // Point the swatches at the model's material(s).
    colorTargets = [...mats];
    stitchTarget = null;

    fitModelToStage(model);
    bag.clear();            // remove the procedural bag
    bag.add(model);
    console.info('[LUMEN] External model loaded:', EXTERNAL_MODEL_URL, '· materials:', mats.size);
  },
  undefined,
  () => {
    // No bag.glb present (or failed to load) → keep the procedural bag.
    console.info('[LUMEN] No external model found — using procedural bag.');
  }
);

// ============================================================
//  Controls
// ============================================================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.minDistance = 4.2;
controls.maxDistance = 9;
controls.minPolarAngle = Math.PI * 0.25;
controls.maxPolarAngle = Math.PI * 0.62;
controls.target.set(0, 0.1, 0);
controls.autoRotate = false;
controls.autoRotateSpeed = 1.6;

// ============================================================
//  Interaction state
// ============================================================
let targetRotationY = 0;        // smooth button-driven rotation target
let colorLerp = null;           // {from[], to, t} for smooth color transitions

// Materials whose color the swatches drive. Defaults to the procedural bag's
// materials; replaced by the loaded model's material(s) if bag.glb is present.
let colorTargets = [leatherMat];
let stitchTarget = stitchMat;   // procedural-only accent; null once a model loads

// --- Rotate buttons ---
function rotateBy(rad) {
  targetRotationY += rad;
}
document.getElementById('rotate-left')?.addEventListener('click', () => rotateBy(-Math.PI / 4));
document.getElementById('rotate-right')?.addEventListener('click', () => rotateBy(Math.PI / 4));

// --- Reset view ---
document.getElementById('reset-view')?.addEventListener('click', () => {
  targetRotationY = 0;
  controls.autoRotate = false;
  autoBtn?.classList.remove('active');
  camera.position.set(0, 1.1, 6.2);
  controls.target.set(0, 0.1, 0);
});

// --- Auto-rotate toggle ---
const autoBtn = document.getElementById('auto-rotate');
autoBtn?.addEventListener('click', () => {
  controls.autoRotate = !controls.autoRotate;
  autoBtn.classList.toggle('active', controls.autoRotate);
});

// --- Color swatches ---
const swatches = document.querySelectorAll('.swatch');
const colorNameEl = document.getElementById('color-name');

function changeColor(hex, name, stitchHex) {
  const to = new THREE.Color(hex);
  // Remember each target's current color so we can lerp from it smoothly.
  colorLerp = { from: colorTargets.map((m) => m.color.clone()), to, t: 0 };
  if (stitchTarget) stitchTarget.color.set(stitchHex || hex);
  if (colorNameEl) colorNameEl.textContent = name;
}

swatches.forEach((sw) => {
  sw.addEventListener('click', () => {
    swatches.forEach((s) => s.classList.remove('active'));
    sw.classList.add('active');
    changeColor(sw.dataset.color, sw.dataset.name, sw.dataset.stitch);
  });
});

// ============================================================
//  Add to cart
// ============================================================
let cartCount = 0;
const cartCountEl = document.getElementById('cart-count');
const qtyEl = document.getElementById('qty');
const toast = document.getElementById('toast');

document.getElementById('qty-minus')?.addEventListener('click', () => {
  const v = Math.max(1, parseInt(qtyEl.textContent, 10) - 1);
  qtyEl.textContent = v;
});
document.getElementById('qty-plus')?.addEventListener('click', () => {
  const v = Math.min(9, parseInt(qtyEl.textContent, 10) + 1);
  qtyEl.textContent = v;
});

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2200);
}

document.getElementById('add-to-cart')?.addEventListener('click', () => {
  const qty = parseInt(qtyEl.textContent, 10);
  cartCount += qty;
  if (cartCountEl) {
    cartCountEl.textContent = cartCount;
    cartCountEl.classList.remove('pop');
    void cartCountEl.offsetWidth; // reflow to restart animation
    cartCountEl.classList.add('pop');
  }
  showToast(`장바구니에 ${qty}개 담았습니다 · ${colorNameEl?.textContent ?? ''}`);
});

document.getElementById('buy-now')?.addEventListener('click', () => {
  showToast('구매하기는 데모에서 비활성화되어 있습니다 🙂');
});

// ============================================================
//  Resize
// ============================================================
function resize() {
  const w = stageEl.clientWidth;
  const h = stageEl.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

// ============================================================
//  Render loop
// ============================================================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  // Smooth button rotation (only affects bag when auto-rotate is off).
  if (!controls.autoRotate) {
    bag.rotation.y += (targetRotationY - bag.rotation.y) * Math.min(1, dt * 6);
  } else {
    targetRotationY = bag.rotation.y; // keep target in sync so it doesn't snap on toggle
  }

  // Smooth color transition across all active materials.
  if (colorLerp) {
    colorLerp.t = Math.min(1, colorLerp.t + dt * 4);
    colorTargets.forEach((m, i) => {
      m.color.copy(colorLerp.from[i] ?? colorLerp.from[0]).lerp(colorLerp.to, colorLerp.t);
    });
    if (colorLerp.t >= 1) colorLerp = null;
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

// Reveal the stage once the first frame is ready.
requestAnimationFrame(() => stageEl.classList.add('ready'));
