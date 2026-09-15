/**
 * WF02 R5.1 — archive Kenney facility GLBs and apply warm atlas normalization.
 * Preserves geometry/UVs/material slots; patches external texture URI only.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.join(root, '..', 'public');
const archiveRoot = path.join(publicRoot, 'assets/glb/kenney/_archive/pre-r5');

/** Facility → warm atlas role (R5.1 §6.5). */
const FACILITY_ATLAS = [
  { glb: 'suburban/home-cottage.glb', role: 'warm_residential' },
  { glb: 'suburban/home-type-a.glb', role: 'warm_residential' },
  { glb: 'suburban/home-type-c.glb', role: 'warm_residential' },
  { glb: 'suburban/home-type-d.glb', role: 'warm_residential' },
  { glb: 'suburban/apartment-block.glb', role: 'warm_residential' },
  { glb: 'suburban/farmhouse.glb', role: 'farm_straw' },
  { glb: 'commercial/store-general.glb', role: 'warm_commercial' },
  { glb: 'commercial/cafe-bistro.glb', role: 'warm_commercial' },
  { glb: 'commercial/clinic.glb', role: 'warm_commercial' },
  { glb: 'commercial/community-hall.glb', role: 'civic_cream' },
  { glb: 'commercial/school.glb', role: 'civic_cream' },
  { glb: 'industrial/workshop-industrial.glb', role: 'warm_industrial' },
  { glb: 'industrial/warehouse.glb', role: 'warm_industrial' },
  { glb: 'industrial/utility-station.glb', role: 'warm_industrial' },
];

/** Per-role color grading (hue/sat/lightness shifts preserving contrast). */
const ROLE_GRADES = {
  warm_residential: { hue: 18, saturation: 1.22, brightness: 1.06, warmth: 28 },
  warm_commercial: { hue: 12, saturation: 1.15, brightness: 1.1, warmth: 22 },
  civic_cream: { hue: 8, saturation: 0.95, brightness: 1.18, warmth: 18 },
  farm_straw: { hue: 22, saturation: 1.28, brightness: 1.12, warmth: 32 },
  warm_industrial: { hue: 10, saturation: 0.88, brightness: 1.04, warmth: 14 },
};

const PACK_SOURCE = {
  warm_residential: 'suburban/Textures/colormap.png',
  farm_straw: 'suburban/Textures/colormap.png',
  warm_commercial: 'commercial/Textures/colormap.png',
  civic_cream: 'commercial/Textures/colormap.png',
  warm_industrial: 'industrial/Textures/colormap.png',
};

const ROLE_TEXTURE_NAME = {
  warm_residential: 'colormap_warm_residential.png',
  warm_commercial: 'colormap_warm_commercial.png',
  civic_cream: 'colormap_civic_cream.png',
  farm_straw: 'colormap_farm_straw.png',
  warm_industrial: 'colormap_warm_industrial.png',
};

function parseGlb(buffer) {
  const jsonLen = buffer.readUInt32LE(12);
  const jsonStart = 20;
  const json = JSON.parse(buffer.slice(jsonStart, jsonStart + jsonLen).toString('utf8'));
  const binOffset = jsonStart + jsonLen + 8;
  const binLen = buffer.readUInt32LE(jsonStart + jsonLen + 4);
  const bin = buffer.slice(binOffset, binOffset + binLen);
  return { json, bin, jsonLen, jsonStart };
}

function writeGlb({ json, bin, jsonStart, jsonLen }) {
  const jsonStr = JSON.stringify(json);
  const jsonBuf = Buffer.from(jsonStr);
  const paddedJsonLen = Math.ceil(jsonBuf.length / 4) * 4;
  const jsonPadding = paddedJsonLen - jsonBuf.length;
  const binPadding = (4 - (bin.length % 4)) % 4;
  const totalLen = 12 + 8 + paddedJsonLen + 8 + bin.length + binPadding;
  const out = Buffer.alloc(totalLen);
  out.writeUInt32LE(0x46546c67, 0);
  out.writeUInt32LE(2, 4);
  out.writeUInt32LE(totalLen, 8);
  out.writeUInt32LE(paddedJsonLen, 12);
  out.write('JSON', 16);
  jsonBuf.copy(out, 20);
  for (let i = 0; i < jsonPadding; i += 1) out[20 + jsonBuf.length + i] = 0x20;
  const binHeader = 20 + paddedJsonLen;
  out.writeUInt32LE(bin.length + binPadding, binHeader);
  out.write('BIN\0', binHeader + 4);
  bin.copy(out, binHeader + 8);
  return out;
}

async function gradeAtlas(srcPath, destPath, role) {
  const grade = ROLE_GRADES[role];
  const { data, info } = await sharp(srcPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    const warmR = Math.min(255, r + grade.warmth);
    const warmG = Math.min(255, g + grade.warmth * 0.55);
    const warmB = Math.max(0, b - grade.warmth * 0.35);
    const bright = grade.brightness;
    const sat = grade.saturation;
    const gray = 0.299 * warmR + 0.587 * warmG + 0.114 * warmB;
    let nr = gray + (warmR - gray) * sat;
    let ng = gray + (warmG - gray) * sat;
    let nb = gray + (warmB - gray) * sat;
    nr = Math.min(255, nr * bright + grade.hue * 0.08);
    ng = Math.min(255, ng * bright + grade.hue * 0.04);
    nb = Math.min(255, nb * bright);
    out[i] = Math.round(nr);
    out[i + 1] = Math.round(ng);
    out[i + 2] = Math.round(nb);
    out[i + 3] = a;
  }
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile(destPath);
  return { width: info.width, height: info.height };
}

function archiveFile(relPath) {
  const src = path.join(publicRoot, relPath);
  const dest = path.join(archiveRoot, relPath);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (!fs.existsSync(dest)) fs.copyFileSync(src, dest);
}

function patchGlbTextureUri(glbRel, textureFileName) {
  const abs = path.join(publicRoot, 'assets/glb/kenney', glbRel);
  const buf = fs.readFileSync(abs);
  const parsed = parseGlb(buf);
  if (!parsed.json.images?.length) throw new Error(`No images in ${glbRel}`);
  parsed.json.images.forEach((img) => {
    if (img.uri?.includes('colormap')) {
      img.uri = `Textures/${textureFileName}`;
    }
  });
  fs.writeFileSync(abs, writeGlb(parsed));
}

async function main() {
  fs.mkdirSync(archiveRoot, { recursive: true });

  const rolesNeeded = new Set(Object.values(ROLE_TEXTURE_NAME).map((_, i) => Object.keys(ROLE_TEXTURE_NAME)[i]));
  const uniqueRoles = [...new Set(FACILITY_ATLAS.map((f) => f.role))];

  for (const role of uniqueRoles) {
    const srcRel = path.join('assets/glb/kenney', PACK_SOURCE[role]);
    const packDir = path.dirname(path.join(publicRoot, srcRel));
    archiveFile(srcRel);
    const srcPath = path.join(publicRoot, srcRel);
    const destName = ROLE_TEXTURE_NAME[role];
    const destPath = path.join(packDir, destName);
    const dims = await gradeAtlas(srcPath, destPath, role);
    console.log(`Created ${destPath} (${dims.width}x${dims.height}) role=${role}`);
  }

  for (const { glb, role } of FACILITY_ATLAS) {
    const glbRel = path.join('assets/glb/kenney', glb);
    archiveFile(glbRel);
    patchGlbTextureUri(glb, ROLE_TEXTURE_NAME[role]);
    console.log(`Patched ${glb} → Textures/${ROLE_TEXTURE_NAME[role]}`);
  }

  console.log('R5.1 atlas repack complete. Originals in _archive/pre-r5/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
