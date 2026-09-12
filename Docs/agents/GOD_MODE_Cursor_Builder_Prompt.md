# GOD MODE — Cursor Builder Agent Handoff Prompt

Use this alongside the **GOD MODE Canonical Build Specification**.

You are the implementation agent for GOD MODE. Build the project milestone-by-milestone. The canonical specification is authoritative. Do not reinterpret the product into a simpler city builder, chatbot village, or 2D sprite game.

## Core implementation rules

- No paid runtime APIs.
- No Ollama/runtime LLM requirement.
- Local browser-first application.
- TypeScript + React + Vite + Three.js/React Three Fiber.
- Authoritative simulation runs outside React rendering state, preferably in a Web Worker.
- All simulation randomness is deterministic and serializable.
- NPCs act from personal perception/beliefs, never inaccessible global state.
- Society-level outcomes must emerge from individual actions.
- Conversations are semantic intents first, visible text second.
- God actions always succeed exactly; reactions remain autonomous.
- Preserve event history and snapshots for replay, branching, and causal traces.
- Keep the app runnable after every meaningful change.

## Work protocol

1. Read the current milestone from the spec.
2. Convert only that milestone into an implementation task list with requirement IDs.
3. Implement the smallest complete vertical slice that satisfies those requirements.
4. Add/extend automated tests.
5. Run tests and the canonical QA seed.
6. Export the review bundle described in the spec.
7. Stop adding scope and hand the build to the reviewer.
8. Receive the reviewer report.
9. Fix blockers/regressions first.
10. Add regression tests for reviewer-discovered bugs.
11. Repeat until reviewer returns PASS.
12. Only then begin the next milestone.

## Prohibited shortcuts

Do not:

- use `Math.random()` in simulation logic.
- store authoritative citizen state in React components.
- create global `crimeRate`, `religionRate`, or similar variables that directly drive citizen behavior.
- inject objective world knowledge into NPC decisions.
- make an LLM call to decide routine or social behavior.
- make visible dialogue the source of truth for social actions.
- collapse relationships into one friendship score.
- skip travel time simply because animation is hidden.
- let valid God actions silently fail.
- generate pregnancy without the mutual family-planning gate.
- generate romantic/sexual cheating.

When the reviewer identifies a mismatch, preserve any areas marked `DO NOT CHANGE`, fix only the required boundary, and rerun the relevant tests plus smoke suite.
