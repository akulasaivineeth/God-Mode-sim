/**
 * Module-level geometry singletons for corridor instancing.
 */
import * as THREE from 'three';

export const SCATTER_GEOM = {
  shrub: new THREE.SphereGeometry(0.55, 6, 6),
  shrubTrunk: new THREE.CylinderGeometry(0.08, 0.1, 0.2, 5),
  fencePost: new THREE.BoxGeometry(0.08, 0.7, 0.08),
  crossStripe: new THREE.PlaneGeometry(0.22, 1.8),
  paver: new THREE.PlaneGeometry(1.1, 0.7),
  curbStrip: new THREE.BoxGeometry(1, 0.08, 0.15),
};
