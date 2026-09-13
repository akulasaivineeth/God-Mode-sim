# Milestone M02 — One Autonomous Citizen

**Status:** Implemented — awaiting independent Grok review + ChatGPT arbitration  
**Branch:** `milestone/m02-one-autonomous-citizen`

## Plain-English summary

M02 adds **Alex**, one stylized 3D citizen who lives autonomously in the Riverside town. Alex has a home (`house-1`), shops at the general store, and works at the workshop. Hunger, thirst, bladder, energy, and hygiene rise and fall each simulated minute; Alex chooses what to do next using Layer-1 reflex responses and Layer-2 utility scoring — without any player commands.

Click Alex (or use the default selection) to open the **God inspector** showing need bars and the latest utility score breakdown (need pressure, goals, travel cost, seeded noise).

The M01 town, clock, camera, day/night, and determinism foundations are preserved.

## Gate

After **three simulated days** with no player input, Alex continues to sleep, eat, drink, work, and travel without deadlock. Automated tests lock navigation connectivity, utility traces, and deterministic replay.

## Visual slice

- Procedural shared humanoid mesh (original, lightweight)
- Route markers at home, store, and workplace entrances
- M01 town shell unchanged

See `PLAN.md` for architecture detail and `KNOWN_LIMITATIONS.md` for deferred items.
