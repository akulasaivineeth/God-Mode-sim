/**
 * WF02 R5.1 deterministic nature mass placements — preset-tier gated, budget pruned.
 */
import type { VegetationPlacement } from '../assets/EnvironmentAssetRegistry';

/** District canopy restore (5) — civic + residential + park-east anchors. */
export const DISTRICT_CANOPY_RESTORE: readonly VegetationPlacement[] = [
  { position: { x: -22, z: -12 }, asset: 'commonTree1', scale: 0.95, source: 'quaternius' },
  { position: { x: -28, z: -44 }, asset: 'pine1', scale: 0.88, source: 'quaternius' },
  { position: { x: 16, z: -28.5 }, asset: 'commonTree1', scale: 0.9, rotY: 0.8, source: 'quaternius' },
  { position: { x: 28, z: -31.2 }, asset: 'commonTree2', scale: 0.95, rotY: 1.6, source: 'quaternius' },
  { position: { x: 88, z: 36 }, asset: 'pine1', scale: 0.88, source: 'quaternius' },
];

/** Periphery forest frame (4) — north/west edge wall @ Overview/Angled. */
export const PERIPHERY_FOREST_FRAME: readonly VegetationPlacement[] = [
  { position: { x: -95, z: -102 }, asset: 'pine1', scale: 1.0, rotY: 0.2, source: 'quaternius' },
  { position: { x: 35, z: -104 }, asset: 'pine2', scale: 1.08, rotY: 0.8, source: 'quaternius' },
  { position: { x: -104, z: 0 }, asset: 'commonTree1', scale: 1.02, rotY: 1.1, source: 'quaternius' },
  { position: { x: -104, z: 65 }, asset: 'commonTree2', scale: 0.98, rotY: 1.6, source: 'quaternius' },
];

/** Orchard perimeter — Kenney 4×5 grid in CanopyMassing covers orchard read; no duplicate Quaternius. */
export const ORCHARD_PERIMETER: readonly VegetationPlacement[] = [];

/** Park arc — VegetationLayer park/square baseline covers river edge; tier empty for budget. */
export const PARK_RIVER_ARC: readonly VegetationPlacement[] = [];
