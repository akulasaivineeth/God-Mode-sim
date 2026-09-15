/**
 * WF01 prefab-backed facility visuals — all major buildings use Kenney GLBs.
 */
import { terrainHeightAt } from '@/world/townLayout';
import { ModelAsset } from '../ModelAsset';
import { WorldSign } from '../WorldSign';
import { BUILDING_PREFABS, getBuildingPosition } from './buildingPrefabConfig';

function PrefabBuilding({ config }: { config: (typeof BUILDING_PREFABS)[number] }) {
  const { x, z } = getBuildingPosition(config.buildingId);
  const y = terrainHeightAt(x, z);
  const rotY = config.rotationY ?? 0;
  const southSign = rotY === 0 || rotY === Math.PI;

  return (
    <group position={[x, y, z]} rotation={[0, rotY, 0]}>
      <ModelAsset url={config.assetUrl} targetWidth={config.targetWidth} />
      {config.sign && (
        <WorldSign
          text={config.sign.text}
          position={config.sign.position}
          rotation={southSign ? [0, Math.PI, 0] : [0, 0, 0]}
          width={config.sign.width}
          height={config.sign.height}
          fontSize={config.sign.fontSize}
        />
      )}
      {config.extras?.map((extra, i) => (
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
      {BUILDING_PREFABS.map((config) => (
        <PrefabBuilding key={config.buildingId} config={config} />
      ))}
    </group>
  );
}
