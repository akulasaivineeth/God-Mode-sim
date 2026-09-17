/**
 * Compute MAE and materially-changed pixel % between two PNGs (same dimensions).
 * Usage: node scripts/wf02-r15-pixel-delta.mjs before.png after.png [threshold]
 */
import sharp from 'sharp';
import { readFileSync, existsSync } from 'node:fs';

const beforePath = process.argv[2];
const afterPath = process.argv[3];
const threshold = Number(process.argv[4] ?? 5);

if (!beforePath || !afterPath) {
  console.error('Usage: node scripts/wf02-r15-pixel-delta.mjs before.png after.png [threshold]');
  process.exit(1);
}

if (!existsSync(beforePath) || !existsSync(afterPath)) {
  console.error('Missing input PNG');
  process.exit(1);
}

async function main() {
  const before = await sharp(beforePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const after = await sharp(afterPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  if (before.info.width !== after.info.width || before.info.height !== after.info.height) {
    throw new Error(
      `Dimension mismatch: ${before.info.width}x${before.info.height} vs ${after.info.width}x${after.info.height}`,
    );
  }

  const pixels = before.info.width * before.info.height;
  let changed = 0;
  let absSum = 0;

  for (let i = 0; i < before.data.length; i += 4) {
    const dr = Math.abs(before.data[i] - after.data[i]);
    const dg = Math.abs(before.data[i + 1] - after.data[i + 1]);
    const db = Math.abs(before.data[i + 2] - after.data[i + 2]);
    const delta = (dr + dg + db) / 3;
    absSum += delta;
    if (delta >= threshold) changed += 1;
  }

  const mae = absSum / pixels;
  const changedPct = (changed / pixels) * 100;

  const result = {
    before: beforePath,
    after: afterPath,
    width: before.info.width,
    height: before.info.height,
    threshold,
    mae: Number(mae.toFixed(4)),
    changedPixels: changed,
    changedPct: Number(changedPct.toFixed(2)),
    passMae8: mae >= 8,
    passChanged15: changedPct >= 15,
  };

  console.log(JSON.stringify(result, null, 2));
  if (!result.passMae8 || !result.passChanged15) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
