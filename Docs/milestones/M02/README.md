# Milestone M02 — One Autonomous Citizen

**Status:** Implemented — awaiting independent Grok review + ChatGPT arbitration  
**Branch:** `milestone/m02-one-autonomous-citizen`

## Plain-English summary

M02 adds **Alex**, one stylized 3D citizen who lives autonomously in the Riverside town. Alex has a home (`house-1`), shops at the general store, and works at the workshop. Hunger, thirst, bladder, energy, and hygiene rise and fall each simulated minute; Alex chooses what to do next using Layer-1 reflex responses and Layer-2 utility scoring — without any player commands.

Click Alex (or use the default selection) to open the **God inspector** showing need bars and the latest utility score breakdown (need pressure, goals, travel cost, seeded noise).

The M01 town, clock, camera, day/night, and determinism foundations are preserved.

## Gate

After **three simulated days** with no player input, Alex continues to sleep, eat, drink, work, and travel without deadlock. Automated tests lock navigation connectivity, utility traces, and deterministic replay.

## Visual slice (R5)

- **Dedicated facility visuals** — Kenney CC0 GLB cottages/commercial/industrial for `house-1`, `store`, and `workshop` via `BuildingVisualRegistry` (generic `BuildingMesh` skipped for those IDs)
- **Kenney character GLB** for Alex (interim; Quaternius Universal Base Characters blocked on download)
- **Quaternius Stylized Nature** glTF subset for trees/shrubs/rocks (instanced where practical)
- **Corridor + landscape frame** — asphalt roads, sidewalks, crosswalk, river banks, bridge, town square/park/farm presentation
- **Outdoor presentation anchors** — Alex visible at porch/store/workshop during facility actions
- M01 town coordinates preserved; simulation authority unchanged

See `PLAN.md` for architecture detail and `KNOWN_LIMITATIONS.md` for deferred items.
