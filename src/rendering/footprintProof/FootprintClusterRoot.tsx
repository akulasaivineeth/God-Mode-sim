/**
 * WF02 R15.3.1 Candidate E — cluster root offset wrapper for World Lab modules.
 */
import type { ReactNode } from 'react';
import { getClusterRootOffset, type FootprintClusterId } from '@/world/worldLab/presentationFootprintSpec';

export function FootprintClusterRoot({
  clusterId,
  children,
}: {
  clusterId: FootprintClusterId;
  children: ReactNode;
}) {
  const { dx, dz } = getClusterRootOffset(clusterId);
  if (dx === 0 && dz === 0) return <>{children}</>;
  return (
    <group name={`footprint-cluster-${clusterId}`} position={[dx, 0, dz]}>
      {children}
    </group>
  );
}
