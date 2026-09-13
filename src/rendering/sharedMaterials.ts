/**
 * Shared Three.js materials for M02 rendering — reduces material churn and
 * helps the GPU batch repeated geometry (M2 / 8 GB performance target).
 */
import { MeshStandardMaterial } from 'three';

export const MAT = {
  road: new MeshStandardMaterial({ color: '#3a3c42', roughness: 0.92 }),
  sidewalk: new MeshStandardMaterial({ color: '#b8bcc2', roughness: 0.88 }),
  path: new MeshStandardMaterial({ color: '#c9b07a', roughness: 0.9 }),
  curb: new MeshStandardMaterial({ color: '#8a8e94', roughness: 0.85 }),
  wood: new MeshStandardMaterial({ color: '#7a5a42', roughness: 0.82 }),
  woodDark: new MeshStandardMaterial({ color: '#5a4030', roughness: 0.8 }),
  foliage: new MeshStandardMaterial({ color: '#3d6b38', roughness: 0.9 }),
  foliageLight: new MeshStandardMaterial({ color: '#5a8a4a', roughness: 0.88 }),
  stone: new MeshStandardMaterial({ color: '#9a9590', roughness: 0.75 }),
  metal: new MeshStandardMaterial({ color: '#6a6e74', metalness: 0.35, roughness: 0.55 }),
  sign: new MeshStandardMaterial({ color: '#f2e8d0', roughness: 0.7 }),
  awningRed: new MeshStandardMaterial({ color: '#b84a3a', roughness: 0.8 }),
  awningStripe: new MeshStandardMaterial({ color: '#e8dcc8', roughness: 0.8 }),
  door: new MeshStandardMaterial({ color: '#4a3828', roughness: 0.75 }),
  window: new MeshStandardMaterial({ color: '#c8dce8', roughness: 0.3, metalness: 0.05 }),
};
