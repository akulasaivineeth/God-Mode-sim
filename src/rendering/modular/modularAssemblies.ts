import { CIVIC_ENCLOSURE_ASSEMBLY } from './prototypes/civicEnclosureAssembly';
import { COMMERCIAL_FRONTAGE_ASSEMBLY } from './prototypes/commercialFrontageAssembly';
import {
  RESIDENTIAL_HOUSE1_ASSEMBLY,
  RESIDENTIAL_HOUSE2_ASSEMBLY,
} from './prototypes/residentialPairAssembly';
import type { ModularAssemblySpec } from './modularAssemblyTypes';

export const R11_MODULAR_ASSEMBLIES: readonly ModularAssemblySpec[] = [
  CIVIC_ENCLOSURE_ASSEMBLY,
  COMMERCIAL_FRONTAGE_ASSEMBLY,
  RESIDENTIAL_HOUSE1_ASSEMBLY,
  RESIDENTIAL_HOUSE2_ASSEMBLY,
];

export function findAssemblyForBuilding(buildingId: string): ModularAssemblySpec | undefined {
  return R11_MODULAR_ASSEMBLIES.find((a) => a.replacesBuildingIds.includes(buildingId));
}

export function findAssemblyById(assemblyId: string): ModularAssemblySpec | undefined {
  return R11_MODULAR_ASSEMBLIES.find((a) => a.assemblyId === assemblyId);
}
