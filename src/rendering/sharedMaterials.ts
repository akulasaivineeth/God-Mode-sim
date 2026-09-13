/**
 * Shared Three.js materials for M02 rendering — single source of truth for
 * repeated corridor/town geometry. Imported by Town, M02CorridorPolish,
 * FacilityInteractionSpots, and CitizenMesh (M2 / 8 GB performance target).
 */
import { MeshStandardMaterial } from 'three';

export const MAT = {
  road: new MeshStandardMaterial({ color: '#3a3c42', roughness: 0.92 }),
  sidewalk: new MeshStandardMaterial({ color: '#b8bcc2', roughness: 0.88 }),
  path: new MeshStandardMaterial({ color: '#c9b07a', roughness: 0.9 }),
  water: new MeshStandardMaterial({ color: '#4a8ab0', roughness: 0.2, metalness: 0.1 }),
  bank: new MeshStandardMaterial({ color: '#8a9a70', roughness: 0.88 }),
  curb: new MeshStandardMaterial({ color: '#8a8e94', roughness: 0.85 }),
  wood: new MeshStandardMaterial({ color: '#7a5a42', roughness: 0.82 }),
  woodDark: new MeshStandardMaterial({ color: '#5a4030', roughness: 0.8 }),
  woodLight: new MeshStandardMaterial({ color: '#d8cbb8', roughness: 0.8 }),
  foliage: new MeshStandardMaterial({ color: '#3d6b38', roughness: 0.9 }),
  foliageLight: new MeshStandardMaterial({ color: '#5a8a4a', roughness: 0.88 }),
  stone: new MeshStandardMaterial({ color: '#9a9590', roughness: 0.75 }),
  stoneLight: new MeshStandardMaterial({ color: '#e8e4dc', roughness: 0.8 }),
  metal: new MeshStandardMaterial({ color: '#6a6e74', metalness: 0.35, roughness: 0.55 }),
  metalDark: new MeshStandardMaterial({ color: '#4a4e54', metalness: 0.4, roughness: 0.5 }),
  sign: new MeshStandardMaterial({ color: '#f2e8d0', roughness: 0.7 }),
  awningRed: new MeshStandardMaterial({ color: '#b84a3a', roughness: 0.8 }),
  awningCream: new MeshStandardMaterial({ color: '#e8dcc8', roughness: 0.8 }),
  door: new MeshStandardMaterial({ color: '#2a6a6a', roughness: 0.75 }),
  doorDark: new MeshStandardMaterial({ color: '#4a3828', roughness: 0.75 }),
  window: new MeshStandardMaterial({ color: '#b8d4e8', roughness: 0.25, metalness: 0.08 }),
  wallCream: new MeshStandardMaterial({ color: '#e8dcc8', roughness: 0.85 }),
  wallBrick: new MeshStandardMaterial({ color: '#b08060', roughness: 0.88 }),
  roofBrown: new MeshStandardMaterial({ color: '#6a4a38', roughness: 0.82 }),
  roofSlate: new MeshStandardMaterial({ color: '#5a5e64', roughness: 0.7 }),
  trimWhite: new MeshStandardMaterial({ color: '#f0ece4', roughness: 0.75 }),
  industrial: new MeshStandardMaterial({ color: '#8a7a60', roughness: 0.8 }),
  crate: new MeshStandardMaterial({ color: '#a08050', roughness: 0.85 }),
  skin: new MeshStandardMaterial({ color: '#d8a67c', roughness: 0.75 }),
  shoe: new MeshStandardMaterial({ color: '#3a3840', roughness: 0.85 }),
  selectRing: new MeshStandardMaterial({
    color: '#f0d060',
    emissive: '#806820',
    emissiveIntensity: 0.3,
  }),
  hazard: new MeshStandardMaterial({ color: '#d4a030', roughness: 0.7 }),
  trunk: new MeshStandardMaterial({ color: '#5b4327', roughness: 0.88 }),
  treeCanopy: new MeshStandardMaterial({ color: '#356b34', roughness: 0.9 }),
  grave: new MeshStandardMaterial({ color: '#b7bcc2', roughness: 0.8 }),
};
