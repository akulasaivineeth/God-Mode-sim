/**
 * WF01 prefab-backed facility visuals — WF02 bounds-anchored dressing + presentation transforms.
 */
import { terrainHeightAt } from '@/world/townLayout';
import { ModelAsset } from '../ModelAsset';
import { WorldSign } from '../WorldSign';
import {
  resolveBuildingAnchors,
  resolveVisualTransform,
} from './buildingPresentationAnchors';
import { BUILDING_PREFABS, getBuildingPosition } from './buildingPrefabConfig';
import { CANONICAL_TOWN } from '@/world/townLayout';

const ACTIVE_BUILDING_IDS = new Set(CANONICAL_TOWN.buildings.map((b) => b.id));
const ACTIVE_PREFABS = BUILDING_PREFABS.filter((config) => ACTIVE_BUILDING_IDS.has(config.buildingId));

function PrefabBuilding({ config }: { config: (typeof BUILDING_PREFABS)[number] }) {
  const { x, z } = getBuildingPosition(config.buildingId);
  const presentation = resolveVisualTransform(config.buildingId);
  const y = terrainHeightAt(x + presentation.positionOffset[0], z + presentation.positionOffset[2]);
  const rotY = (config.rotationY ?? 0) + presentation.rotationDelta;
  const anchors = resolveBuildingAnchors(config);

  return (
    <group
      position={[x + presentation.positionOffset[0], y, z + presentation.positionOffset[2]]}
      rotation={[0, rotY, 0]}
    >
      <ModelAsset url={config.assetUrl} targetWidth={config.targetWidth} />
      {config.sign && anchors.signPosition && (
        <WorldSign
          text={config.sign.text}
          position={anchors.signPosition}
          rotation={anchors.signRotation}
          width={config.sign.width}
          height={config.sign.height}
          fontSize={config.sign.fontSize}
        />
      )}
      {anchors.extras.map((extra, i) => (
        <ModelAsset
          key={i}
          url={extra.url}
          position={extra.position}
          rotation={extra.rotation ?? [0, 0, 0]}
          scale={extra.scale}
          targetWidth={extra.targetWidth}
          castShadow={extra.castShadow ?? false}
        />
      ))}
    </group>
  );
}

export function PrefabBuildings() {
  return (
    <group>
      {ACTIVE_PREFABS.map((config) => (
        <PrefabBuilding key={config.buildingId} config={config} />
      ))}
    </group>
  );
}
