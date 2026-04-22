import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ─── Scene Setup ─────────────────────────────────────────────────────────────
const container = document.getElementById('canvas-container');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.4, 5.5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 1.2, 0);
controls.minDistance = 3;
controls.maxDistance = 9;
controls.minPolarAngle = 0.2;
controls.maxPolarAngle = Math.PI / 2 + 0.1;

// ─── Lighting ─────────────────────────────────────────────────────────────────
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
keyLight.position.set(3, 6, 4);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 20;
keyLight.shadow.camera.left = -4;
keyLight.shadow.camera.right = 4;
keyLight.shadow.camera.top = 6;
keyLight.shadow.camera.bottom = -2;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x8090ff, 0.8);
fillLight.position.set(-4, 3, 2);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 1.0);
rimLight.position.set(0, 4, -5);
scene.add(rimLight);

// ─── Floor ────────────────────────────────────────────────────────────────────
const floorGeo = new THREE.CircleGeometry(4, 64);
const floorMat = new THREE.MeshStandardMaterial({
  color: 0x111122,
  roughness: 0.8,
  metalness: 0.1,
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// ─── Background gradient ──────────────────────────────────────────────────────
scene.background = new THREE.Color(0x0d0d1a);
scene.fog = new THREE.FogExp2(0x0d0d1a, 0.08);

// ─── Character builders ───────────────────────────────────────────────────────

function makeMaterial(color, roughness = 0.4, metalness = 0.0, emissive = 0x000000) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity: 0.15 });
}

function makeSphere(r, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}

function makeBox(w, h, d, mat, x, y, z, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d, 4, 4, 4), mat);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.castShadow = true;
  return m;
}

function makeCyl(rt, rb, h, mat, x, y, z, rx = 0, ry = 0) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 24, 4), mat);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, 0);
  m.castShadow = true;
  return m;
}

// ─── Character 0: Beşiktaş Hero (Spider-Man figürün stili) ───────────────────
function buildHero() {
  const g = new THREE.Group();

  // Base (hexagonal pedestal)
  const baseGeo = new THREE.CylinderGeometry(0.7, 0.75, 0.18, 6);
  const baseMat = makeMaterial(0x111111, 0.3, 0.6);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.09;
  base.receiveShadow = true;
  g.add(base);

  // Pole
  g.add(makeCyl(0.04, 0.04, 0.4, makeMaterial(0x888888, 0.3, 0.7), 0, 0.49, 0));

  // Legs
  const legMat = makeMaterial(0x1a1f3a, 0.6);
  g.add(makeCyl(0.13, 0.11, 0.65, legMat, -0.17, 0.73, 0.02, 0.05, 0));
  g.add(makeCyl(0.13, 0.11, 0.65, legMat, 0.17, 0.73, 0.02, -0.05, 0));

  // Boots
  const bootMat = makeMaterial(0xcc2222, 0.5);
  g.add(makeCyl(0.12, 0.13, 0.18, bootMat, -0.17, 0.37, 0.04));
  g.add(makeCyl(0.12, 0.13, 0.18, bootMat, 0.17, 0.37, 0.04));

  // Torso
  const torsoGeo = new THREE.CapsuleGeometry(0.25, 0.55, 8, 16);
  const torsoMat = makeMaterial(0xcc2222, 0.5);
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.set(0, 1.22, 0);
  torso.castShadow = true;
  g.add(torso);

  // Chest spider symbol
  const spiderMat = makeMaterial(0x0a0a0a, 0.6);
  const spiderGeo = new THREE.SphereGeometry(0.1, 8, 8);
  spiderGeo.scale(1, 0.5, 0.3);
  const spider = new THREE.Mesh(spiderGeo, spiderMat);
  spider.position.set(0, 1.25, 0.26);
  g.add(spider);

  // Arms
  const armMat = makeMaterial(0xcc2222, 0.5);
  const glovesMat = makeMaterial(0x1a1f3a, 0.5);

  const armL = new THREE.Group();
  armL.add(makeCyl(0.09, 0.08, 0.5, armMat, 0, 0, 0));
  armL.add(makeCyl(0.08, 0.07, 0.35, armMat, 0, -0.42, 0.1, 0.3, 0));
  armL.add(makeSphere(0.09, glovesMat, 0, -0.63, 0.15));
  armL.position.set(-0.37, 1.42, 0);
  armL.rotation.z = 0.35;
  g.add(armL);

  const armR = new THREE.Group();
  armR.add(makeCyl(0.09, 0.08, 0.5, armMat, 0, 0, 0));
  armR.add(makeCyl(0.08, 0.07, 0.35, armMat, 0, -0.42, 0.1, 0.3, 0));
  armR.add(makeSphere(0.09, glovesMat, 0, -0.63, 0.15));
  armR.position.set(0.37, 1.42, 0);
  armR.rotation.z = -0.35;
  g.add(armR);

  // Neck
  g.add(makeCyl(0.1, 0.12, 0.15, makeMaterial(0xcc2222, 0.5), 0, 1.62, 0));

  // Head (slightly oversized for bobblehead feel)
  const headMat = makeMaterial(0xf5c5a0, 0.7, 0.0);
  const head = makeSphere(0.35, headMat, 0, 1.9, 0);
  g.add(head);

  // Mask top (Spider-Man hood)
  const maskGeo = new THREE.SphereGeometry(0.355, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55);
  const maskMat = makeMaterial(0xcc2222, 0.5);
  const mask = new THREE.Mesh(maskGeo, maskMat);
  mask.position.set(0, 1.9, 0);
  mask.rotation.x = -0.2;
  g.add(mask);

  // Eye lenses
  const eyeMat = makeMaterial(0xffffff, 0.1, 0.0, 0x999999);
  g.add(makeSphere(0.07, eyeMat, -0.13, 1.97, 0.31));
  g.add(makeSphere(0.07, eyeMat, 0.13, 1.97, 0.31));

  // Label plate
  const plateMat = makeMaterial(0x333333, 0.4, 0.5);
  const plate = makeBox(0.55, 0.1, 0.06, plateMat, 0, 0.1, 0.72);
  g.add(plate);

  return g;
}

// ─── Character 1: K Kalp (Bobblehead kil stili) ──────────────────────────────
function buildKalp() {
  const g = new THREE.Group();

  const skinMat = makeMaterial(0xf5c5a0, 0.85, 0.0);
  const pinkMat = makeMaterial(0xe8829a, 0.9, 0.0);
  const jeansMat = makeMaterial(0x4a7ab5, 0.95, 0.0);
  const beltMat = makeMaterial(0xf0d060, 0.7, 0.1);
  const bootMat = makeMaterial(0x2d6b3a, 0.8, 0.0);
  const scarveMat = makeMaterial(0x2a7a2a, 0.9, 0.0);

  // Feet
  g.add(makeCyl(0.1, 0.12, 0.2, bootMat, -0.15, 0.1, 0.05));
  g.add(makeCyl(0.1, 0.12, 0.2, bootMat, 0.15, 0.1, 0.05));

  // Legs (jeans)
  g.add(makeCyl(0.14, 0.12, 0.55, jeansMat, -0.15, 0.47, 0.01, 0.05, 0));
  g.add(makeCyl(0.14, 0.12, 0.55, jeansMat, 0.15, 0.47, 0.01, -0.05, 0));

  // Belt
  g.add(makeBox(0.7, 0.07, 0.3, beltMat, 0, 0.82, 0));

  // Torso (sweater)
  const torsoGeo = new THREE.CapsuleGeometry(0.28, 0.45, 8, 16);
  const torso = new THREE.Mesh(torsoGeo, pinkMat);
  torso.position.set(0, 1.16, 0);
  torso.castShadow = true;
  g.add(torso);

  // Heart on sweater
  const heartMat = makeMaterial(0xcc2244, 0.7, 0.0);
  const heartL = makeSphere(0.1, heartMat, -0.07, 1.18, 0.27);
  const heartR = makeSphere(0.1, heartMat, 0.07, 1.18, 0.27);
  const heartB = makeSphere(0.12, heartMat, 0, 1.1, 0.27);
  g.add(heartL, heartR, heartB);

  // K letter on heart
  const kMat = makeMaterial(0x880022, 0.7);
  g.add(makeBox(0.025, 0.12, 0.025, kMat, -0.02, 1.12, 0.29));
  g.add(makeBox(0.07, 0.025, 0.025, kMat, 0.015, 1.16, 0.29));
  g.add(makeBox(0.07, 0.025, 0.025, kMat, 0.015, 1.08, 0.29));

  // Arms
  g.add(makeCyl(0.1, 0.09, 0.55, pinkMat, -0.42, 1.25, 0, 0.15, 0));
  g.add(makeCyl(0.1, 0.09, 0.55, pinkMat, 0.42, 1.25, 0, 0.15, 0));
  g.add(makeSphere(0.09, skinMat, -0.46, 0.95, 0.04));
  g.add(makeSphere(0.09, skinMat, 0.46, 0.95, 0.04));

  // Scarf (striped collar)
  g.add(makeCyl(0.17, 0.17, 0.1, scarveMat, 0, 1.53, 0));
  const scarveStripeMat = makeMaterial(0x1a4a1a, 0.9);
  g.add(makeCyl(0.175, 0.175, 0.025, scarveStripeMat, 0, 1.55, 0));
  g.add(makeCyl(0.175, 0.175, 0.025, scarveStripeMat, 0, 1.48, 0));

  // BIG head (bobblehead - exaggerated)
  const head = makeSphere(0.55, skinMat, 0, 2.2, 0);
  g.add(head);

  // Eyes (very wide open - exaggerated)
  const eyeWhiteMat = makeMaterial(0xffffff, 0.6);
  const eyePupilMat = makeMaterial(0x6699bb, 0.5);
  const eyeBlackMat = makeMaterial(0x111111, 0.4);

  [-0.2, 0.2].forEach((x) => {
    const eyeWhite = makeSphere(0.135, eyeWhiteMat, x, 2.25, 0.47);
    const pupil = makeSphere(0.075, eyePupilMat, x, 2.25, 0.53);
    const pupilDark = makeSphere(0.04, eyeBlackMat, x, 2.25, 0.58);
    g.add(eyeWhite, pupil, pupilDark);
  });

  // Eyebrows (thick)
  const browMat = makeMaterial(0x3a2a1a, 0.8);
  g.add(makeBox(0.2, 0.035, 0.04, browMat, -0.2, 2.43, 0.44));
  g.add(makeBox(0.2, 0.035, 0.04, browMat, 0.2, 2.43, 0.44));

  // Big mouth (open, teeth showing)
  const mouthMat = makeMaterial(0xcc3355, 0.7);
  const mouthBox = makeBox(0.38, 0.14, 0.06, mouthMat, 0, 2.0, 0.5);
  g.add(mouthBox);
  const teethMat = makeMaterial(0xf8f4e8, 0.5);
  g.add(makeBox(0.34, 0.06, 0.04, teethMat, 0, 2.04, 0.52));
  g.add(makeBox(0.34, 0.04, 0.04, teethMat, 0, 1.97, 0.52));

  // Bald head (no hair texture)
  const baldShine = makeSphere(0.551, makeMaterial(0xf0bba0, 0.4, 0.05), 0, 2.2, 0);
  g.add(baldShine);

  return g;
}

// ─── Character 2: Sihirbaz (Harry Potter çizim stili) ────────────────────────
function buildSihirbaz() {
  const g = new THREE.Group();

  // Paper texture look with muted colors
  const paperMat = makeMaterial(0xf5f0e8, 0.95, 0.0);
  const shirtMat = makeMaterial(0xf8f5ee, 0.9, 0.0);
  const pantsMat = makeMaterial(0xb0b0b8, 0.85, 0.0);
  const tieMat = makeMaterial(0xcc3333, 0.8, 0.0);
  const tieStripe = makeMaterial(0xddaa00, 0.7, 0.0);
  const shoeMat = makeMaterial(0x6b4226, 0.8, 0.0);

  // Shoes
  const shoeGeo = new THREE.BoxGeometry(0.18, 0.1, 0.28);
  const shoeL = new THREE.Mesh(shoeGeo, shoeMat);
  const shoeR = new THREE.Mesh(shoeGeo, shoeMat);
  shoeL.position.set(-0.18, 0.05, 0.04);
  shoeR.position.set(0.18, 0.05, 0.04);
  [shoeL, shoeR].forEach(s => { s.castShadow = true; g.add(s); });

  // Legs
  g.add(makeCyl(0.12, 0.11, 0.65, pantsMat, -0.17, 0.49, 0.0, 0.0, 0));
  g.add(makeCyl(0.12, 0.11, 0.65, pantsMat, 0.17, 0.49, 0.0, 0.0, 0));

  // Torso (shirt)
  const torsoGeo = new THREE.CapsuleGeometry(0.24, 0.5, 8, 16);
  const torso = new THREE.Mesh(torsoGeo, shirtMat);
  torso.position.set(0, 1.18, 0);
  torso.castShadow = true;
  g.add(torso);

  // Tie (diagonal stripes)
  g.add(makeBox(0.1, 0.42, 0.04, tieMat, 0, 1.18, 0.25));
  for (let i = 0; i < 5; i++) {
    g.add(makeBox(0.105, 0.06, 0.045, tieStripe, 0, 0.95 + i * 0.09, 0.25));
  }

  // Arms
  const armMat = makeMaterial(0xf0ede5, 0.85, 0.0);
  g.add(makeCyl(0.09, 0.08, 0.55, armMat, -0.38, 1.28, 0, 0.1, 0));
  g.add(makeCyl(0.09, 0.08, 0.55, armMat, 0.38, 1.28, 0, 0.1, 0));
  // Hands
  const handMat = makeMaterial(0xf5c5a0, 0.85);
  g.add(makeSphere(0.08, handMat, -0.42, 0.98, 0.04));
  g.add(makeSphere(0.08, handMat, 0.42, 0.98, 0.04));

  // Wand in right hand
  g.add(makeCyl(0.02, 0.01, 0.32, makeMaterial(0x5a3010, 0.9), 0.57, 0.86, 0.04, 0.2, 0.1));

  // Neck + collar
  g.add(makeCyl(0.09, 0.1, 0.14, shirtMat, 0, 1.58, 0));

  // Head (paper/drawing texture feel - slightly flat)
  const headGeo = new THREE.SphereGeometry(0.33, 32, 32);
  headGeo.scale(1, 1.08, 0.88);
  const head = new THREE.Mesh(headGeo, paperMat);
  head.position.set(0, 1.9, 0);
  head.castShadow = true;
  g.add(head);

  // Hair (drawn-on look, brownish lines)
  const hairMat = makeMaterial(0x8b6914, 0.9, 0.0);
  for (let i = 0; i < 7; i++) {
    const strand = makeBox(0.02, 0.15, 0.02, hairMat,
      -0.18 + i * 0.06, 2.2, 0.26 - Math.abs(i - 3) * 0.02);
    strand.rotation.z = (i - 3) * 0.08;
    g.add(strand);
  }
  // Side parting stroke
  g.add(makeBox(0.25, 0.02, 0.02, hairMat, -0.05, 2.22, 0.3));

  // Glasses
  const glassMat = makeMaterial(0x333333, 0.4, 0.3);
  g.add(makeCyl(0.095, 0.095, 0.02, glassMat, -0.11, 1.93, 0.33, Math.PI / 2, 0));
  g.add(makeCyl(0.095, 0.095, 0.02, glassMat, 0.11, 1.93, 0.33, Math.PI / 2, 0));
  g.add(makeBox(0.09, 0.012, 0.01, glassMat, 0, 1.93, 0.34));
  g.add(makeBox(0.13, 0.01, 0.01, glassMat, -0.19, 1.93, 0.31));
  g.add(makeBox(0.13, 0.01, 0.01, glassMat, 0.19, 1.93, 0.31));

  // Eyes (blue, drawing style)
  const eyeMat = makeMaterial(0x4477aa, 0.5);
  g.add(makeSphere(0.042, eyeMat, -0.11, 1.93, 0.33));
  g.add(makeSphere(0.042, eyeMat, 0.11, 1.93, 0.33));

  // Lightning scar
  const scarMat = makeMaterial(0xdd9900, 0.6, 0.0, 0xdd9900);
  g.add(makeBox(0.01, 0.06, 0.01, scarMat, 0.04, 2.07, 0.31));
  g.add(makeBox(0.04, 0.01, 0.01, scarMat, 0.06, 2.04, 0.31));
  g.add(makeBox(0.01, 0.06, 0.01, scarMat, 0.08, 2.0, 0.31));

  return g;
}

// ─── Character 3: Yarasa Adam (Batman collector edition) ─────────────────────
function buildYarasa() {
  const g = new THREE.Group();

  // Round pedestal (collector edition)
  const pedestalGeo = new THREE.CylinderGeometry(0.72, 0.78, 0.2, 64);
  const pedestalMat = makeMaterial(0x111111, 0.2, 0.7);
  const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
  pedestal.position.y = 0.1;
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  g.add(pedestal);

  // Gold rim on pedestal
  const rimGeo = new THREE.TorusGeometry(0.73, 0.025, 8, 64);
  const rimMat = makeMaterial(0xb8860b, 0.3, 0.8);
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.2;
  g.add(rim);

  const batMat = makeMaterial(0x1a1a1a, 0.4, 0.2);
  const batDarkMat = makeMaterial(0x0d0d0d, 0.5, 0.1);
  const beltMat = makeMaterial(0x7a6630, 0.5, 0.4);
  const skinMat = makeMaterial(0xdeb887, 0.7, 0.0);

  // Legs
  g.add(makeCyl(0.14, 0.12, 0.65, batMat, -0.18, 0.73, 0.0, 0.06, 0));
  g.add(makeCyl(0.14, 0.12, 0.65, batMat, 0.18, 0.73, 0.0, -0.06, 0));

  // Boots
  const bootGeo = new THREE.BoxGeometry(0.22, 0.15, 0.32);
  const bootL = new THREE.Mesh(bootGeo, batMat);
  const bootR = new THREE.Mesh(bootGeo, batMat);
  bootL.position.set(-0.18, 0.35, 0.04);
  bootR.position.set(0.18, 0.35, 0.04);
  [bootL, bootR].forEach(b => { b.castShadow = true; g.add(b); });

  // Torso (wide, powerful)
  const torsoGeo = new THREE.CapsuleGeometry(0.3, 0.6, 8, 16);
  const torso = new THREE.Mesh(torsoGeo, batMat);
  torso.position.set(0, 1.22, 0);
  torso.castShadow = true;
  g.add(torso);

  // Chest bat symbol
  const batSymMat = makeMaterial(0x333333, 0.5);
  const batBody = makeBox(0.22, 0.12, 0.05, batSymMat, 0, 1.25, 0.3);
  g.add(batBody);
  g.add(makeBox(0.08, 0.06, 0.04, batSymMat, -0.17, 1.22, 0.3));
  g.add(makeBox(0.08, 0.06, 0.04, batSymMat, 0.17, 1.22, 0.3));

  // Belt
  g.add(makeBox(0.7, 0.1, 0.32, beltMat, 0, 0.88, 0));
  // Belt pouches
  for (let i = -2; i <= 2; i++) {
    g.add(makeBox(0.07, 0.09, 0.08, beltMat, i * 0.13, 0.92, 0.16));
  }

  // Cape (fan shape behind)
  const capeShape = new THREE.Shape();
  capeShape.moveTo(-0.45, 0);
  capeShape.lineTo(0.45, 0);
  capeShape.lineTo(0.6, -1.3);
  capeShape.quadraticCurveTo(0.3, -1.5, 0.1, -1.35);
  capeShape.lineTo(0.08, -1.35);
  capeShape.quadraticCurveTo(0, -1.45, -0.08, -1.35);
  capeShape.lineTo(-0.1, -1.35);
  capeShape.quadraticCurveTo(-0.3, -1.5, -0.6, -1.3);
  capeShape.closePath();
  const capeGeo = new THREE.ShapeGeometry(capeShape);
  const capeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9, side: THREE.DoubleSide });
  const cape = new THREE.Mesh(capeGeo, capeMat);
  cape.position.set(0, 1.65, -0.22);
  cape.rotation.x = 0.1;
  g.add(cape);

  // Cape shoulders
  const shoulderCapeMat = makeMaterial(0x222222, 0.8);
  g.add(makeBox(0.9, 0.12, 0.35, shoulderCapeMat, 0, 1.55, -0.05));

  // Arms (fists on hips)
  const armL = new THREE.Group();
  armL.add(makeCyl(0.12, 0.10, 0.55, batMat, 0, 0, 0));
  armL.add(makeSphere(0.11, batDarkMat, 0, -0.3, 0));
  armL.position.set(-0.48, 1.38, 0.02);
  armL.rotation.z = 0.3;
  armL.rotation.x = 0.1;
  g.add(armL);

  const armR = new THREE.Group();
  armR.add(makeCyl(0.12, 0.10, 0.55, batMat, 0, 0, 0));
  armR.add(makeSphere(0.11, batDarkMat, 0, -0.3, 0));
  armR.position.set(0.48, 1.38, 0.02);
  armR.rotation.z = -0.3;
  armR.rotation.x = 0.1;
  g.add(armR);

  // Neck
  g.add(makeCyl(0.1, 0.12, 0.12, batMat, 0, 1.63, 0));

  // Head (child face showing under cowl)
  const head = makeSphere(0.32, skinMat, 0, 1.88, 0.0);
  g.add(head);

  // Bat cowl mask (top + ears)
  const cowlGeo = new THREE.SphereGeometry(0.33, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const cowlMat = makeMaterial(0x111111, 0.3, 0.2);
  const cowl = new THREE.Mesh(cowlGeo, cowlMat);
  cowl.position.set(0, 1.88, 0);
  cowl.rotation.x = -0.18;
  g.add(cowl);

  // Bat ears
  const earGeo = new THREE.ConeGeometry(0.06, 0.22, 6);
  const earL = new THREE.Mesh(earGeo, cowlMat);
  const earR = new THREE.Mesh(earGeo, cowlMat);
  earL.position.set(-0.17, 2.2, -0.04);
  earR.position.set(0.17, 2.2, -0.04);
  earL.rotation.z = 0.15;
  earR.rotation.z = -0.15;
  [earL, earR].forEach(e => { e.castShadow = true; g.add(e); });

  // Eye mask (black around eyes)
  const eyeMaskMat = makeMaterial(0x111111, 0.5);
  g.add(makeBox(0.25, 0.075, 0.04, eyeMaskMat, 0, 1.91, 0.3));

  // Eyes (child eyes visible)
  const eyeMat = makeMaterial(0x3355aa, 0.4);
  g.add(makeSphere(0.045, eyeMat, -0.09, 1.91, 0.31));
  g.add(makeSphere(0.045, eyeMat, 0.09, 1.91, 0.31));

  // Label plate
  const plateMat = makeMaterial(0x2a2a2a, 0.3, 0.6);
  g.add(makeBox(0.7, 0.1, 0.06, plateMat, 0, 0.12, 0.74));

  return g;
}

// ─── Character definitions ────────────────────────────────────────────────────
const CHARS = [
  {
    name: 'Beşiktaş Hero',
    desc: 'Süper Kahraman Koleksiyonu',
    build: buildHero,
    bgColor: 0x0a0d1a,
    accentColor: 0xff3333,
    lightColor: 0xff6644,
  },
  {
    name: 'K Kalp',
    desc: 'Kil Figürü • Bobblehead Serisi',
    build: buildKalp,
    bgColor: 0x1a0d1a,
    accentColor: 0xff4488,
    lightColor: 0xffaacc,
  },
  {
    name: 'Sihirbaz',
    desc: 'Karakalem Çizim Stili',
    build: buildSihirbaz,
    bgColor: 0x0d0d1a,
    accentColor: 0xaa7700,
    lightColor: 0xffdd88,
  },
  {
    name: 'Yarasa Adam',
    desc: 'Koleksiyonluk Figür • The Wild One',
    build: buildYarasa,
    bgColor: 0x050508,
    accentColor: 0x888888,
    lightColor: 0xaabbdd,
  },
];

// ─── Character management ─────────────────────────────────────────────────────
let currentChar = null;
let currentId = 0;
let targetRotY = 0;
let isTransitioning = false;

// Build all characters and cache them
const charGroups = CHARS.map(c => c.build());
charGroups.forEach(g => { g.visible = false; scene.add(g); });

// Show first character
charGroups[0].visible = true;
currentChar = charGroups[0];

// Accent light (changes per character)
const accentLight = new THREE.PointLight(0xff3333, 1.5, 8);
accentLight.position.set(0, 2, 3);
scene.add(accentLight);

function selectChar(id) {
  if (id === currentId || isTransitioning) return;
  isTransitioning = true;

  const prev = charGroups[currentId];
  const next = charGroups[id];
  const cfg = CHARS[id];

  // Update UI
  document.querySelectorAll('.char-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-id="${id}"]`).classList.add('active');
  document.getElementById('char-name-display').textContent = cfg.name;
  document.getElementById('char-desc-display').textContent = cfg.desc;

  // Fade transition
  prev.visible = false;
  next.visible = true;
  next.rotation.y = -1.2;
  currentChar = next;
  currentId = id;

  // Update scene colors
  accentLight.color.setHex(cfg.accentColor);
  scene.background = new THREE.Color(cfg.bgColor);
  scene.fog = new THREE.FogExp2(cfg.bgColor, 0.08);

  setTimeout(() => { isTransitioning = false; }, 400);
}

// Expose globally for onclick
window.selectChar = selectChar;

// ─── Animation loop ───────────────────────────────────────────────────────────
let time = 0;
function animate() {
  requestAnimationFrame(animate);
  time += 0.016;

  controls.update();

  // Gentle auto-rotate for current character
  if (currentChar) {
    currentChar.rotation.y += 0.004;
  }

  // Floating bob
  if (currentChar && currentId !== 0 && currentId !== 3) {
    currentChar.position.y = Math.sin(time * 0.9) * 0.04;
  } else if (currentChar) {
    currentChar.position.y = Math.sin(time * 0.7) * 0.025;
  }

  // Pulsing accent light
  accentLight.intensity = 1.2 + Math.sin(time * 1.5) * 0.3;

  renderer.render(scene, camera);
}

animate();

// ─── Resize handler ───────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
