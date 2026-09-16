# ARCH01 Spike T — Objective Truth vs Subjective Knowledge Mapping

**Work item:** ARCH01 Spike T  
**State:** Research evidence (spike-local)  
**Parent plan SHA:** `03c3b4f64d0990b0bfb8b447424d02be4f853b43`

This document maps spike **objective-truth** outputs to the future GOD MODE **subjective belief** layer. Spike T proves household/kinship algorithms can run headlessly; it does **not** implement perception.

## Objective truth (spike produces)

| Field | Storage (future M03) | Spike schema |
|---|---|---|
| Genealogy edges (`fatherId`, `motherId`) | Worker genealogy store | `ObjectivePerson.fatherId` / `motherId` |
| Partnership episodes | Worker genealogy store | `ObjectivePerson.partnerships[]` |
| Birth/death sim minutes | Worker genealogy store | `birthSimMinute`, `deathSimMinute` |
| Household membership | Worker household table | `ObjectiveHousehold.memberPersonIds` |
| Living arrangement label | Worker household table | `ObjectiveHousehold.arrangement` |
| Facility binding | Worker + world truth | `ObjectiveHousehold.facilityId` (spike uses `house-{slot}` fixture only — **M03 Riverside binding unproven**) |

## Subjective layer (not built in spike)

| Objective fact | Future `BeliefStore` query | Example disagreement |
|---|---|---|
| `fatherId` edge | Belief: "X is my father" (`source`, `confidence`, `asOfSimMinute`) | Adoption, deception, mistaken identity |
| `memberPersonIds` | Belief: "Y lives at house-3" | Person moved; neighbor has not observed |
| `partnerships[]` | Belief: "X and Y are married" | Secret separation; public belief lags |
| `arrangement: roommates` | Belief: "they are a family" | Outsider infers nuclear family incorrectly |
| Immigrant `familyName` | Belief: surname / ethnicity inference | Stereotyping from name alone |

## Architecture rules (preserved)

1. **NPC decisions** query `BeliefStore` (observed / told / inferred), never raw objective genealogy.
2. **God inspector** may read objective truth.
3. **NPC UI** reads beliefs only (constitution rules 5–6).
4. TownBox `KnownFacts` (gossip) is **not** ported — gossip ≠ GOD MODE perception.

## Spike exclusion

- Spike events (`SPIKE_*`) and `ObjectiveTruthStore` are disposable (`branchId: spike-t-main`).
- No writes to `WorldSnapshot`, `saveBundle`, or production `events.ts`.
- Rollback: delete `src/spikes/arch01-t/` — zero save migration impact.
