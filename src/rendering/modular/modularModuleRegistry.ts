import manifest from './modularModuleManifest.json';

export interface ModularModuleDef {
  moduleId: string;
  assetUrl: string;
  gridWidth: number;
  gridDepth: number;
  gridHeight: number;
  bounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
    triangles: number;
  };
}

const REGISTRY = manifest as unknown as Record<string, ModularModuleDef>;

export function getModularModule(moduleId: string): ModularModuleDef {
  const mod = REGISTRY[moduleId];
  if (!mod) throw new Error(`Unknown modular module: ${moduleId}`);
  return mod;
}

export function getStoryHeight(): number {
  return getModularModule('building-block').gridHeight;
}

export function getGridWidth(): number {
  return getModularModule('building-block').gridWidth;
}

export function getGridDepth(): number {
  return getModularModule('building-block').gridDepth;
}

export function listModularModuleIds(): string[] {
  return Object.keys(REGISTRY);
}
