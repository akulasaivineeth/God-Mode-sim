/**
 * Building presentation registry — maps authored IDs to final-style visuals (M02 R5).
 *
 * Simulation still references the same building IDs/coordinates in townLayout.
 * Visual assets never become simulation authority.
 */
import { HomeVisual } from './buildings/HomeVisual';
import { StoreVisual } from './buildings/StoreVisual';
import { WorkshopVisual } from './buildings/WorkshopVisual';

export function DedicatedBuildings() {
  return (
    <group>
      <HomeVisual />
      <StoreVisual />
      <WorkshopVisual />
    </group>
  );
}
