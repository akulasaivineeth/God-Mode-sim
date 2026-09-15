/**
 * Shared Three.js materials for town/corridor rendering — singleton palette plus
 * pooled per-color materials via materialPool.ts (Foundation Hardening).
 */
import { MeshStandardMaterial } from 'three';

export const MAT = {
  road: new MeshStandardMaterial({ color: '#34363c', roughness: 0.9 }),
  sidewalk: new MeshStandardMaterial({ color: '#d8dce2', roughness: 0.84 }),
  path: new MeshStandardMaterial({ color: '#dcc890', roughness: 0.86 }),
  water: new MeshStandardMaterial({ color: '#4580a0', roughness: 0.16, metalness: 0.14 }),
  bank: new MeshStandardMaterial({ color: '#8ea070', roughness: 0.86 }),
  curb: new MeshStandardMaterial({ color: '#949aa2', roughness: 0.82 }),
  wood: new MeshStandardMaterial({ color: '#7a5a42', roughness: 0.82 }),
  woodDark: new MeshStandardMaterial({ color: '#5a4030', roughness: 0.8 }),
  woodLight: new MeshStandardMaterial({ color: '#d8cbb8', roughness: 0.8 }),
  foliage: new MeshStandardMaterial({ color: '#3d6b38', roughness: 0.9 }),
  foliageLight: new MeshStandardMaterial({ color: '#6a9a52', roughness: 0.86 }),
  stone: new MeshStandardMaterial({ color: '#9a9590', roughness: 0.75 }),
  stoneLight: new MeshStandardMaterial({ color: '#efe8dc', roughness: 0.78 }),
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
  selectRing: new MeshStandardMaterial({
    color: '#7eb8dc',
    emissive: '#1a4060',
    emissiveIntensity: 0.12,
    transparent: true,
    opacity: 0.45,
  }),
  hazard: new MeshStandardMaterial({ color: '#d4a030', roughness: 0.7 }),
  grave: new MeshStandardMaterial({ color: '#b7bcc2', roughness: 0.8 }),
  farmRowA: new MeshStandardMaterial({ color: '#7a9a42', roughness: 0.88 }),
  farmRowB: new MeshStandardMaterial({ color: '#8aaa50', roughness: 0.88 }),
};
