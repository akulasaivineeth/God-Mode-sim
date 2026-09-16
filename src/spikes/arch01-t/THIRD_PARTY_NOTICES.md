# ARCH01 Spike T — Third-Party Notices

Portions adapted from **TownBox** (https://github.com/Maudfer/townBox), commit `84c1ba4dc011b4815f7dec3afc636bd73c78a070`, MIT License.

## MIT License (TownBox)

```
MIT License

Copyright (c) 2021 Mauricio D Angelo Fernandes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Per-file origin map

| Spike file | TownBox source |
|---|---|
| `vendor/townbox/kinship.ts` | `src/util/kinship.ts` |
| `vendor/townbox/householdDraw.ts` | `src/app/game/population/HouseholdDraw.ts` (faker → NameAdapter) |
| `vendor/townbox/fertility.ts` | `src/util/fertility.ts` |
| `vendor/townbox/populationGenerate.ts` | `src/app/game/population/Population.ts` (`generatePopulation` only; faker → NameAdapter) |
| `vendor/townbox/types/genealogy.ts` | `src/types/Genealogy.ts` (subset) |
| `vendor/townbox/types/household.ts` | `src/types/Household.ts` (subset) |
| `vendor/townbox/types/social.ts` | `src/types/Social.ts` (enums only) |
| `vendor/townbox/seededRandom.ts` | `src/util/random.ts` |
| `vendor/townbox/config/householdDraw.json` | `src/json/householdDraw.json` |
| `vendor/townbox/config/population.json` | `src/json/population.json` (`ticksPerYear` 525600; `founderCouples`/`maxPopulation` reduced for spike CI determinism) |

GOD MODE adapters (`adapters/*`, `schema/*`, `runSpikeT.ts`, `normalize.ts`) are original spike code.
