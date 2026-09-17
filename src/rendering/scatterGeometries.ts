/**
 * Module-level geometry singletons for corridor instancing.
 */
import * as THREE from 'three';

/** WF02 R6 CVP — flattened bush cluster mound for garden/canopy mass blocks. */
const gardenMound = new THREE.SphereGeometry(0.85, 5, 4);
gardenMound.scale(1, 0.42, 1);

/** WF02 R8 slice — taller plaza/garden mass for Overview readability. */
const civicPlazaMound = new THREE.SphereGeometry(1.05, 6, 5);
civicPlazaMound.scale(1, 0.58, 1);

/** WF02 R6 CVP — crop-row segment for orchard field bands. */
const fieldBand = new THREE.BoxGeometry(0.95, 0.18, 0.38);

export const SCATTER_GEOM = {
  shrub: new THREE.SphereGeometry(0.55, 6, 6),
  shrubTrunk: new THREE.CylinderGeometry(0.08, 0.1, 0.2, 5),
  fencePost: new THREE.BoxGeometry(0.08, 0.7, 0.08),
  lampPost: new THREE.CylinderGeometry(0.06, 0.08, 1.55, 6),
  lampHead: new THREE.SphereGeometry(0.16, 8, 8),
  crossStripe: new THREE.PlaneGeometry(0.22, 1.8),
  paver: new THREE.PlaneGeometry(1.1, 0.7),
  curbStrip: new THREE.BoxGeometry(1, 0.08, 0.15),
  benchSeat: new THREE.BoxGeometry(1.0, 0.12, 0.4).translate(0, 0.18, 0),
  benchBack: new THREE.BoxGeometry(0.95, 0.35, 0.08).translate(0, 0.4, -0.12),
  gardenMound,
  civicPlazaMound,
  fieldBand,
};
