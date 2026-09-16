/** Single module cell in a declarative assembly grid. */
export interface ModularPlacement {
  moduleId: string;
  gx: number;
  gy: number;
  gz: number;
  rotY?: number;
}

/** Visual door anchor relative to assembly origin (XZ), simulation entrances unchanged. */
export interface ModularDoorBinding {
  label: string;
  localX: number;
  localZ: number;
}

export interface ModularAssemblySpec {
  assemblyId: string;
  /** Bottom-left corner of grid at ground Y. */
  origin: { x: number; y: number; z: number };
  /** Y rotation of entire assembly. */
  rotY: number;
  placements: readonly ModularPlacement[];
  doorBindings?: readonly ModularDoorBinding[];
  /** Facility IDs whose presentation AABB this assembly replaces. */
  replacesBuildingIds: readonly string[];
}

export interface ResolvedModularInstance {
  moduleId: string;
  url: string;
  x: number;
  y: number;
  z: number;
  rotY: number;
}
