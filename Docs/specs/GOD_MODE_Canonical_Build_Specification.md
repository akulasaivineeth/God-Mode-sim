# GOD MODE — Canonical Build Specification

**Version:** 1.0 Canonical Design Baseline  
**Status:** Approved product vision; implementation may proceed milestone-by-milestone  
**Primary target:** Local browser application running on a MacBook Pro M2, 8 GB unified memory, 256 GB storage  
**Runtime AI policy:** No paid API, no Ollama, and no runtime LLM dependency required  
**Initial population:** 20 persistent young adults, approximately 18–22 years old  
**Core promise:** A small, observable, persistent society whose behavior emerges from individuals rather than scripted global outcomes.

---

## 1. Purpose of this document

This document is the canonical source of truth for building GOD MODE. It is intentionally more detailed than a typical product requirements document because the product depends on many interacting systems. If the implementation agent encounters an ambiguity, it should first follow the non-negotiable principles in this document, then choose the smallest implementation that preserves those principles.

The goal is not to make a conventional life-sim, city-builder, or chatbot village. The goal is to create a stylized 3D social simulation in which the player acts as both God and experimenter. Twenty persistent citizens begin adult life in a newly established modern town. They have bodies, needs, personalities, abilities, memories, beliefs, relationships, jobs, possessions, histories, goals, and imperfect information. They age, form families, reproduce by mutual decision, raise children, build careers, create businesses and institutions, develop culture, age, and die. The player may intervene in reality with reliable God powers and observe how consequences propagate through individuals, families, markets, institutions, and generations.

The player should eventually be able to say: “I watched this person arrive at 19, lose a parent, form friendships, fail at a career, start a business, become mayor, have children, survive a flood, grow old, die, and leave descendants — then I branched the timeline and discovered that one different intervention changed their entire life.”

---

## 2. Product identity and design pillars

### 2.1 Core fantasy

The player is simultaneously:

- **God:** able to inspect and alter reality with effectively unrestricted authority.
- **Observer:** able to follow one individual in intimate detail or zoom out to society-wide trends.
- **Experimenter:** able to branch timelines, run controlled interventions, compare outcomes, and inspect causal traces.
- **Historian:** able to inspect true history, cultural memory, family trees, graves, institutions, and long-run societal change.

There is no traditional win condition. The core loop is **Create → Observe → Intervene → Compare → Understand → Remember**.

### 2.2 Non-negotiable simulation principles

These are implementation invariants. A feature that violates one of these principles is not considered complete even if it visually appears to work.

1. **Individuals, not population counters.** Every citizen is a persistent entity with a continuous life history.
2. **No omniscient NPCs.** An NPC acts from their own perceptions, memories, beliefs, rumors, and knowledge — never from hidden objective world state they could not know.
3. **Events influence; they do not dictate.** “Parents died” must not directly set `criminal=true`. Life events modify grief, resources, support, opportunities, beliefs, and relationships; behavior emerges from those changes.
4. **Society-level metrics are outputs.** Crime rate, inequality, fertility, religion, political stability, and neighborhood reputation must emerge from individual actions. Never implement shortcuts such as `if famine => crime += 20%`.
5. **Meaning precedes dialogue.** Conversations are semantic actions first and rendered words second. The simulation must not depend on natural-language generation.
6. **God changes reality, not reactions.** God interventions always perform the requested state change. NPC responses remain emergent.
7. **Rendering is not simulation.** The world must continue to simulate correctly when animations are skipped at high speed.
8. **Determinism is a feature.** With the same seed, same state, same interventions, and same code version, the simulation should reproduce the same outcome.
9. **Truth and belief are separate.** The engine stores what objectively happened independently from what each NPC believes happened.
10. **History must be explainable.** Important decisions must expose score breakdowns, causal traces, source beliefs, and relevant memories.
11. **Ordinary life matters.** The game is not constant catastrophe. Violence, murder, disasters, and dramatic breakdown should be uncommon enough that they remain meaningful.
12. **No runtime LLM requirement.** All core autonomy, conversations, memory, planning, rumor, social dynamics, and emergence must work locally without an AI model.

---

## 3. Canonical world premise

### 3.1 Starting settlement

The simulation begins in a **newly established modern fictional town** with subtle contemporary American influence but no requirement to mirror a real city. It exists within an unseen larger outside world. The outside world provides manufactured goods, specialist services, electricity-grid connections, advanced medical care, higher education opportunities, deliveries, and migration pressure until the settlement develops local capacity.

The original population is **20 people aged approximately 18–22**. Most are strangers, but a minority may have pre-existing ties such as siblings, old friends, or acquaintances. Each person receives a generated prehistory containing family context, formative memories, education history, interests, values, and a limited social past.

The starting generation is adult. Future generations use the complete life cycle: baby → toddler → child → teenager → adult → middle age → elderly → death.

### 3.2 Day-one town facilities

The handcrafted canonical town should include enough infrastructure to support ordinary life without pretending twenty young adults operate a complete industrial society.

Required initial facilities:

- Starter housing sufficient for shared living, including small houses and/or compact apartment units.
- Grocery/general store with real inventory.
- Small clinic for basic care; severe cases may use abstract outside-world specialist care initially.
- Dormant or lightly staffed school site, expandable when children reach school age.
- Cafe/pub/community social venue.
- General workplace/warehouse/workshop supplying initial jobs.
- Farm or agricultural plot supporting local food production.
- Park and town square/community gathering space.
- Utility connection area for water and electricity abstraction.
- Cemetery.
- Vacant land / construction plots.
- Roads, sidewalks, paths, trees, river, nearby forest, and modest terrain elevation.

The settlement should feel physically coherent enough that the player learns where people live, work, socialize, and travel.

### 3.3 Outside-world abstraction

The outside world is not simulated person-by-person. It acts through explicit interfaces such as:

- Wholesale supply deliveries.
- Grid electricity and water capacity.
- Specialist healthcare transfer.
- External education/training.
- External job or migration opportunities.
- Immigration into the town.
- Emigration out of the town.
- Market price pressure for selected goods.

Outside-world effects must be logged as events so experiments remain explainable.

---

## 4. Visual identity and camera

### 4.1 Visual direction

The visual target is a **stylized cinematic 3D miniature world**: readable, elegant, low-poly, and emotionally expressive without photorealism or uncanny realism. Characters should evoke simplified animated documentary figures or modern low-poly cinematic humans, but must use an original visual identity rather than copying any specific creator’s models, scenes, or assets.

Character guidelines:

- Actual 3D geometry, not 2D sprites.
- Human proportions that are believable but simplified.
- Minimal facial features are preferred over fully faceless mannequins because emotions and relationships benefit from readable eyes/brows/mouth.
- Distinct silhouettes through height, body build, hair, clothing, age, and posture.
- Low geometry and shared materials to remain performant on an M2 with 8 GB unified memory.
- Animation set should eventually include idle, walk, run, sit, sleep, eat, drink, talk, gesture, hug, argue, fight, carry, work, exercise, injury locomotion, and age-related locomotion.
- Visual aging should include height/scale transitions in childhood, adult maturation, posture changes, gray hair, and older-age visual cues.

V1 may begin with procedurally assembled low-poly mannequin bodies made from primitives or a lightweight shared rig. Do not block simulation development on perfect character art.

### 4.2 Camera

Camera requirements:

- Free rotate, pan, and zoom.
- Default angled miniature-town view.
- Town-scale overview.
- Building-scale zoom.
- Interior viewing by fading/removing roofs/walls as needed.
- Follow-selected-NPC mode.
- Near street-level viewing.
- Cinematic follow camera for observing a citizen’s routine.
- Camera movement must not affect simulation state.

### 4.3 God presence

God is physically invisible. Interventions may have tasteful visual effects:

- Money/resource creation: brief subtle shimmer.
- Healing: light pulse.
- Lightning: physical strike.
- Teleportation: spatial distortion.
- Personality/memory edits: optional intervention indicator only if the player enables it.

NPCs may witness an impossible effect and form beliefs about it, but they never directly receive a privileged message from God.

---

## 5. Time, calendar, and simulation speed

### 5.1 Simulation clock

Default mapping: **1 real second = 1 simulated minute at 1× speed**.

Required speeds:

- Pause
- 0.25×
- 1×
- 5×
- 20×
- 100×
- 1000×

Time must support:

- Minutes, hours, days, weeks, months, years.
- Day/night lighting.
- Business opening hours.
- Work/school schedules.
- Birthdays and aging.
- Seasons.
- Weather cycles.
- Pregnancy duration.
- Education durations.
- Debt deadlines and bills.
- Elections, meetings, and institutional schedules.

### 5.2 High-speed simulation rule

At low speed, visible actions may be animated in detail. At high speed, routine movement and animations must collapse into deterministic state transitions with durations.

Example:

`Home → Grocery Store; travel duration 12 simulated minutes; arrival event at 18:42.`

The simulation must preserve consequences while skipping unnecessary rendering. No gameplay rule may depend on a rendered footstep occurring.

---

## 6. NPC identity and persistent life model

### 6.1 Citizen identity

Every citizen requires a stable unique identifier and at minimum:

- Name.
- Biological age and life stage.
- Birth date.
- Sex and reproductive state where relevant.
- Sexual orientation / attraction preference parameters.
- Appearance genome / phenotype values.
- Family relations.
- Household membership.
- Home.
- Education history.
- Employment history.
- Skills.
- Natural abilities.
- Personality.
- temperament.
- values.
- interests and hobbies.
- memories.
- beliefs.
- secrets.
- relationships.
- goals.
- habits.
- possessions.
- financial accounts and obligations.
- health state.
- life history / event links.

### 6.2 Starting population

The original 20 citizens should be generated from a deterministic world seed. They begin at ages 18–22 with approximately comparable starting resources, but not perfectly identical wealth or family history. A small amount of socioeconomic and skill variation is desirable so the world is not artificially symmetric.

Generated prehistory may include:

- Parent relationships.
- Sibling relationships.
- Childhood household stability.
- School outcomes.
- Formative friendships.
- Past losses.
- Hobbies.
- Personal successes and failures.
- Religious/worldview exposure.
- Prior romantic history, if age-appropriate and non-explicit.

Prehistory must affect initial personality, beliefs, skills, values, and memory without predetermining later behavior.

---

## 7. Physiology and everyday needs

### 7.1 Physical needs

Required physical state variables:

- Hunger.
- Thirst.
- Bladder.
- Energy / sleep debt.
- Hygiene.
- Temperature comfort.
- General health.
- Pain / injury state.

NPCs autonomously satisfy these needs. The player is never expected to micromanage bathroom visits or drinking water.

Interactions should create plausible causal links:

- Drinking reduces thirst and raises bladder pressure.
- Exercise increases thirst and fatigue.
- Illness can affect sleep, appetite, hydration, movement, and work attendance.
- Heat increases thirst and temperature discomfort.
- Electricity failure can affect food storage and temperature control.
- Water outage blocks normal drinking/bathing/toilet functionality unless alternatives exist.

### 7.2 Psychological needs

Required psychological pressures:

- Safety.
- Social connection.
- Belonging.
- Affection.
- Autonomy.
- Achievement.
- Entertainment.
- Status.
- Purpose.

Need weight varies by personality and life stage. An extrovert experiences stronger social pressure; a highly ambitious person places more weight on achievement.

NPCs may intentionally tolerate discomfort for a larger goal. For example, a student may delay food to finish an exam, or a parent may skip sleep to care for a child.

### 7.3 Humor and playfulness

Humor is not a survival bar. It is a social/personality dimension affecting bonding, attraction, coping, teasing, embarrassment recovery, and conversation style. Suggested fields:

- Humor appreciation.
- Humor expression frequency.
- Humor style profile such as warm, dry, playful, teasing, absurd, restrained.

Humor must not become a random joke generator. It should alter social outcomes and dialogue rendering when contextually appropriate.

---

## 8. Personality, temperament, abilities, values, and genetics

### 8.1 Core personality

Recommended continuous traits on a 0–100 scale:

- Openness.
- Conscientiousness.
- Extraversion.
- Agreeableness.
- Emotional stability.
- Empathy.
- Assertiveness.
- Impulsivity.
- Risk tolerance.
- Ambition.
- Honesty.
- Patience.
- Materialism.
- Loyalty.
- Curiosity.
- Resilience.
- Self-control.
- Humor / playfulness dimensions.

Generation may use correlated distributions, but traits remain distinct.

### 8.2 Temperament versus learned personality

Each NPC has:

- **Temperament:** relatively stable, partially heritable baseline dispositions.
- **Learned personality:** slowly evolving traits shaped by parenting, peer relationships, education, success, failure, trauma, social environment, and repeated habits.

Major events may accelerate personality change, but routine day-to-day fluctuations belong in emotions rather than personality.

### 8.3 Abilities

Do not reduce intelligence to one scalar. Suggested ability dimensions:

- Analytical reasoning.
- Learning speed.
- Verbal ability.
- Social perception.
- Creativity.
- Practical problem-solving.
- Emotional regulation.
- Physical coordination.
- Athletic potential.

Skills are learned; abilities influence learning efficiency and ceiling but do not guarantee outcomes.

### 8.4 Values

Values are separate from personality. Suggested values:

- Family.
- Wealth.
- Freedom.
- Achievement.
- Community.
- Tradition.
- Pleasure.
- Knowledge.
- Security.
- Status.
- Spiritual meaning.

Values change slowly after meaningful life experiences. Near-death, parenthood, loss, success, betrayal, or major societal events may shift priorities.

### 8.5 Genetics and inheritance

Children may inherit probabilistic tendencies in:

- Appearance.
- Height/build.
- selected health predispositions.
- temperament.
- natural abilities.

Environment, parenting, education, relationships, and random variation must substantially influence outcome. Children must never be clones of parents.

---

## 9. Emotion and mental-state system

### 9.1 Emotional states

Track temporary emotional intensities such as:

- Happiness.
- Sadness.
- Anger.
- Fear.
- Stress.
- Excitement.
- Shame.
- Guilt.
- Jealousy.
- Loneliness.
- Grief.
- Pride.
- Affection.
- Disgust.
- Hope.

Emotions naturally decay toward baselines unless reinforced by unresolved causes.

Examples:

- Unpaid debt repeatedly reinforces financial stress.
- A nearby place may trigger grief memories.
- Anger temporarily increases confrontational choices.
- Fear increases avoidance.
- Shame may reduce social approach behavior.

### 9.2 Mental-health representation

The simulation should model stress burden, grief, loneliness, burnout, coping, resilience, and impaired functioning without pretending to provide clinical psychiatric diagnosis. Avoid simplistic “NPC has diagnosis X therefore behavior Y” rules.

### 9.3 Addiction

Addiction-capable loops may eventually include alcohol, gambling, and generalized substance behavior. Development should model:

- exposure.
- reinforcement.
- tolerance / habit strength.
- stress coping.
- social environment.
- access.
- self-control.
- attempts to quit.
- relapse risk.

Alcohol may also exist as an ordinary social behavior with effects on judgment and mood.

---

## 10. Perception, attention, and local knowledge

### 10.1 Perception channels

NPCs should perceive through local channels:

- Vision range and field of view.
- Hearing range affected by volume and barriers.
- Direct interaction.
- Messages / calls / social posts.
- Documents / photos / evidence.
- Environmental signals such as smoke, empty shelves, queues, darkness, weather.

Direction and attention matter. An NPC facing away or distracted by a phone can miss an event.

Lighting can modify visibility and therefore crime detection.

### 10.2 Information categories

The engine must distinguish:

- **Objective fact:** what truly occurred.
- **Observation:** what an NPC perceived.
- **Belief:** what an NPC currently thinks is true.
- **Rumor:** information received from another person with provenance.
- **Evidence:** durable information such as messages, documents, photographs, transaction records, or physical traces.

NPC decisions use beliefs, not facts.

### 10.3 Belief confidence

Every non-trivial belief should support:

- Confidence score.
- Source list.
- Source credibility estimate.
- Supporting evidence.
- Contradicting evidence.
- Last-updated time.

Skeptical characters need stronger evidence. Gullible characters update more readily. Trusted sources carry more weight. Independent corroboration raises confidence more than repeated copying of one original rumor.

---

## 11. Memory system

### 11.1 Memory types

Use at least:

- Short-term / working memory.
- Episodic long-term memory.
- Semantic/social knowledge.
- Habit memory.
- Relationship memory.

Not every event becomes a durable episodic memory. Importance should be driven by emotional intensity, relevance to goals, novelty, repetition, relationship importance, and consequences.

### 11.2 Memory content

A durable memory should reference structured meaning, not just prose:

- event ID.
- actors.
- location.
- time.
- perceived action.
- emotion at encoding.
- personal consequence.
- confidence.
- salience.
- decay rate.

### 11.3 Memory decay and distortion

Memories fade over time. Emotional memories decay slowly. Details may become less certain or distorted. Repeated rumors can alter belief about an old event even when the original episodic memory remains. Documents and messages provide stronger external evidence than vague memory.

Environmental reminders may trigger recall and transient emotion.

---

## 12. Relationships and social networks

### 12.1 Relationship dimensions

Relationships are multi-dimensional, not one friendship score. At minimum:

- Familiarity.
- Trust.
- Affection.
- Respect.
- Attraction.
- Fear.
- Resentment.
- Dependency.

This allows nuanced combinations: love without respect, respect without affection, trust without intimacy, attraction alongside resentment.

### 12.2 Relationship maintenance

Relationships change through interaction and time. Long periods without contact generally reduce closeness unless the bond is exceptionally strong. Shared hardship may create unusually durable bonds.

### 12.3 Groups and networks

Friend groups, factions, families, workplaces, gangs, religious communities, unions, neighborhoods, and political movements can emerge. Peer pressure and group norms influence decisions but never directly overwrite individual agency.

### 12.4 Reputation

There is no single magical reputation visible to everyone. Reputation is observer-specific. Aggregate reputation may be computed for analytics only. Families and neighborhoods may also develop reputations through accumulated member behavior and stories.

---

## 13. Romance, family, reproduction, and parenting

### 13.1 Attraction and relationships

Attraction is asymmetric and influenced by:

- Appearance preference.
- Age preference.
- Personality compatibility.
- Shared interests and values.
- Familiarity.
- Status and resources.
- Humor.
- social context.

Long-term relationship quality should depend more on behavior, compatibility, shared history, trust, and conflict than on appearance.

### 13.2 Sexuality and intimacy

Orientation varies naturally across citizens. Sex may exist as a discreet underlying relationship/reproduction mechanic but must never be explicit visually. Use privacy-preserving state transitions and relationship effects.

### 13.3 No cheating rule

Cheating is not part of the intended simulation. Relationship betrayal may occur in other forms, but romantic/sexual infidelity should not be generated.

### 13.4 Family planning

Pregnancy occurs only after both partners have reached a mutual decision to have a child. Fertility varies by age, health, and individual reproductive state. A decision to try does not guarantee immediate conception.

Pregnancy unfolds across simulated months and may affect health, energy, schedules, appointments, finances, and preparation. Birth may occur at clinic/hospital or other appropriate setting. Complications may exist at an abstract, non-graphic level.

### 13.5 Parenting

Parenting style emerges from personality, stress, values, skills, family history, and circumstances. Parenting dimensions may include warmth, strictness, consistency, involvement, control, support, neglect, and conflict.

Childhood experiences can influence adult personality and relationships without deterministically dictating adulthood.

Siblings maintain independent relationships including rivalry, closeness, resentment, favoritism, protectiveness, and inheritance disputes.

---

## 14. Decision architecture

### 14.1 Three-layer decision system

**Layer 1 — Reflex / urgent response**

Examples: flee fire, use toilet when critical, drink when dangerously thirsty, seek safety.

**Layer 2 — Routine utility behavior**

Examples: eat, sleep, work, socialize, shop, exercise, commute, clean, relax.

**Layer 3 — Deliberate planning**

Examples: start business, change career, move, pursue education, propose marriage, have children, commit serious crime, enter politics, buy property.

### 14.2 Utility scoring

For each candidate action, compute a traceable utility score from:

- Need pressure.
- Goal relevance.
- Personality modifier.
- Current emotion.
- relationship effects.
- beliefs / expected outcome.
- resources.
- opportunity.
- risk.
- legal/social cost.
- habit strength.
- time constraints.
- learned experience.
- seeded stochastic noise.

Store the score breakdown for inspection.

Example conceptual formula:

`utility(action) = needPressure + goalValue + socialValue + expectedReward - expectedCost - riskPenalty + habitBias + seededNoise`

Do not hard-code special outcomes such as “orphan → criminal”. Instead, life events alter inputs such as grief, social support, money, education, fear, trust, and opportunity.

### 14.3 Deliberate planning

Use a lightweight hierarchical or goal-decomposition planner, not an LLM. Long-term goals generate medium and short goals.

Example:

`Own a home → save deposit → increase income / reduce expenses / share housing / seek loan → work overtime / train for promotion / start side business.`

Level-3 decisions may take simulated time. NPCs can research, discuss, seek advice, reconsider, and abandon a plan.

### 14.4 Goals

Support:

- Life goals.
- Medium-term goals.
- Short-term goals.

Goals may conflict, emerge later in life, be abandoned, or change importance. NPCs periodically reassess life satisfaction.

### 14.5 Habits and learning

Repeated behavior can become a habit. Habits reduce decision cost and bias utility. NPCs can attempt to break harmful habits.

Learning occurs through:

- Personal success/failure.
- Observation.
- Advice.
- Parenting.
- Education.
- Cultural norms.

Future expectations may be wrong. Regret should influence future choices.

---

## 15. Semantic conversation system — no LLM required

### 15.1 Core rule

The simulation stores **what a person meant**, not merely what sentence appeared on screen.

Example semantic turn:

```json
{
  "intent": "REQUEST_REPAYMENT",
  "speakerId": "noah",
  "targetId": "liam",
  "topic": "DEBT_193",
  "amount": 50,
  "urgency": 0.85,
  "emotion": "FRUSTRATED",
  "truthStatus": "TRUE",
  "relevantMemoryIds": ["mem_883"]
}
```

The renderer then converts this into natural-looking template-based dialogue based on relationship, emotion, politeness, personality, context, and dynamic facts.

### 15.2 Required intent library

The intent system should be extensible. Initial families should include:

- Inform.
- Ask information.
- Request.
- Offer.
- Accept.
- Refuse.
- Promise.
- Remind.
- Thank.
- Apologize.
- Comfort.
- Praise.
- Insult.
- Warn.
- Threaten.
- Accuse.
- Deny.
- Confess.
- Lie.
- Gossip.
- Invite.
- Negotiate.
- Ask for help.
- Offer help.
- Request loan.
- Request repayment.
- Propose friendship / deepen relationship.
- Express affection.
- Propose commitment / marriage.
- End relationship.
- Discuss family planning.
- Discuss work.
- Discuss politics.
- Discuss religion/worldview.
- Discuss rumor.

### 15.3 Dialogue surface realization

Templates should combine:

`intent × emotional tone × relationship context × politeness/assertiveness × dynamic entities × prior conversational turn`

The system should provide enough variants to avoid obvious repetition but should prioritize correctness over literary quality.

### 15.4 Conversation dynamics

Support:

- Multi-turn conversation.
- Participant interruption.
- Walking away.
- Phone interruption.
- Work schedule interruption.
- Third-party joining.
- Group conversation.
- Topic shifts.
- secrets intentionally withheld.
- intentional lies.

For every lie, God view must expose objective truth and whether the speaker knew the statement was false.

---

## 16. Rumors, secrecy, deception, and cultural information

Rumors propagate through semantic claims with provenance. A rumor can mutate through:

- Memory uncertainty.
- exaggeration.
- simplification.
- bias.
- deliberate deception.
- emotional retelling.

The system should track source lineage so repeated copies from one origin are not treated as independent confirmation.

NPCs may intentionally start false rumors. Secrets include crimes, hidden money, plans, grudges, private beliefs, and relationship information.

The player’s God inspector may see all secrets and true event state.

Do not implement a special mechanic where citizens literally receive or truthfully claim direct messages from God. They may interpret, speculate, or form religions around unexplained events, but no privileged revelation channel exists.

---

## 17. Education, skills, jobs, and careers

### 17.1 Education

Education affects skills, career access, worldview, and future income. Professional careers must require plausible training. A citizen cannot become a surgeon instantly because a job opening exists.

Education may occur locally, online, or through the outside world until the town develops sufficient institutions.

### 17.2 Careers

Career outcomes depend on:

- Skills.
- abilities.
- education.
- personality.
- job availability.
- social connections.
- reputation.
- economic conditions.
- employer preferences.
- luck / seeded stochasticity.

Nepotism and favoritism may occur as emergent choices.

NPCs can quit, be fired, retrain, retire, become entrepreneurs, hire others, and eventually pass businesses to descendants.

---

## 18. Economy and property

### 18.1 Money

V1 may represent balances digitally, but the architecture should support a coherent money supply. Every transaction must have a source and destination. Avoid arbitrary money creation except explicit God/outside-world events.

### 18.2 Wages and labor

Workers earn wages for actual scheduled work. Employers may set or negotiate wages. Businesses may compete for workers. Absenteeism, poor performance, misconduct, automation, or business failure may cause job loss.

### 18.3 Supply, demand, and prices

Goods use real inventory. Prices respond to supply, demand, wholesale cost, local competition, and business strategy. Businesses choose prices within market pressures rather than receiving a single magical global price.

Customers may compare stores, travel farther for lower prices, or pay more for trust/convenience.

### 18.4 Business accounting

Eventually track:

- Inventory.
- Revenue.
- wages.
- rent.
- utilities.
- procurement.
- tax.
- debt.
- profit/loss.
- retained cash.
- bankruptcy.

Business formation should come from perceived opportunity, resources, ambition, skills, and risk tolerance.

### 18.5 Property and wealth

Architecture must support:

- Ownership.
- renting.
- land value.
- multiple properties.
- mortgages.
- personal loans.
- interest.
- creditworthiness.
- eviction.
- foreclosure.
- bankruptcy.
- inheritance.

Wealth inequality must emerge rather than be directly assigned as a target ratio.

### 18.6 Personal finance inspector

God view should be able to show a citizen’s assets, liabilities, income, expenses, debt, property, business holdings, and historical net worth.

---

## 19. Buildings, objects, interiors, and utilities

### 19.1 Functional interiors

Important buildings have inspectable interiors. Objects should have gameplay function where relevant:

- Bed restores sleep.
- Toilet resolves bladder.
- shower improves hygiene.
- sink/faucet provides water if utility works.
- fridge stores perishable food and depends on electricity.
- stove prepares food.
- television provides entertainment.
- computer provides work/education/entertainment.

### 19.2 Ownership

Important objects can belong to households, businesses, individuals, or government. Objects may be bought, sold, moved, damaged, repaired, stolen, inherited, or destroyed when the related system is implemented.

Clothing is simplified: outfit categories rather than simulating individual socks.

### 19.3 Construction and decay

Buildings may later be constructed, renovated, damaged, abandoned, and decay. Ownership and land value can change. Neighborhood identities should emerge from residents, land prices, institutions, and history.

### 19.4 Utilities

Water and electricity are real dependencies. Outages should create cascading effects rather than just UI penalties.

Waste/sanitation should be architected but may remain simplified early.

---

## 20. Health, disease, injury, and death

### 20.1 Health scope

Use generalized fictional or broad illness categories rather than attempting clinical medical simulation. Systems may include:

- Respiratory illness.
- gastrointestinal illness.
- chronic health burden.
- injuries.
- age-related decline.
- pregnancy health effects.

### 20.2 Disease spread

Communicable illness should spread through contact networks: household, workplace, school, gatherings, close conversations, etc.

### 20.3 Injury

Injury affects movement and capability. Examples: limp, crutches, bed rest, inability to work certain jobs.

### 20.4 Death

Death may occur from age, disease, starvation, accident, crime, disaster, or direct God action. A death is a major event:

- physical response / body handling.
- family notification.
- grief.
- funeral planning.
- funeral attendance.
- inheritance.
- grave creation.
- historical record.

Graves persist and are clickable decades later.

The grave profile should show lifespan, family tree, major events, career, wealth history, descendants, relationships, and full timeline.

---

## 21. Crime and justice

### 21.1 Crime decision rule

Crime requires some combination of motive, opportunity, willingness, capability, and perceived acceptable risk. Never trigger crime solely from a global crime-rate variable.

Possible crime families over time:

- Theft.
- burglary.
- fraud.
- vandalism.
- assault.
- robbery.
- arson.
- murder.
- bribery.
- corruption.

Violent crime and murder should be rare under ordinary conditions.

### 21.2 Detection and evidence

Crime may be witnessed, overheard, recorded, or leave evidence. Investigations must be imperfect. Witnesses can be mistaken or lie. Innocent people can be suspected and, once formal justice exists, potentially wrongly punished.

### 21.3 Baseline law and emergent local institutions

The outside world supplies baseline prohibitions against severe offenses. The starting town has no mature local government, police force, or bureaucracy. Local enforcement and additional laws emerge as citizens respond to problems.

Early responses may use informal community sanctions, security arrangements, fines, or outside-world assistance. Jail/prison infrastructure may emerge later.

---

## 22. Emergent government and politics

### 22.1 Government formation

Do not spawn a mayor because a timer reaches Year 3. Institutions emerge from problems and coordination needs.

Example chain:

`repeated theft → fear → discussions → town meeting → security proposal → funding need → contribution/tax proposal → leadership role → council/election`

### 22.2 Political variation

Citizens may prefer different governance structures depending on values, personality, fear, trust, class interests, and history. Government form may evolve over time.

Support eventually:

- Informal meetings.
- councils.
- elections.
- voting.
- taxes.
- public budgets.
- police/security.
- courts.
- local regulations.
- social assistance.
- minimum wage / labor rules.
- corruption.
- bribery.
- favoritism.
- leader removal.
- authoritarian drift under plausible conditions.

### 22.3 Laws as data

Laws must be machine-readable records with scope, effective date, prohibited/required action, penalties, voting history, and repeal/amendment state.

NPCs need to learn laws through plausible channels; ignorance is possible.

---

## 23. Religion, worldview, and culture

### 23.1 Starting worldview diversity

Because the settlement is modern, the original 20 may begin with different preexisting beliefs, including religious, spiritual, agnostic, or secular worldviews.

### 23.2 Response to God interventions

NPCs may interpret unexplained supernatural events differently. Existing beliefs may strengthen, weaken, reinterpret events, or inspire new movements. New religious groups may form around shared interpretations.

No NPC receives a verified direct revelation channel.

### 23.3 Cultural emergence

Culture may emerge through shared repeated behavior and memory:

- Annual celebrations.
- town traditions.
- local sayings.
- norms.
- cuisine preferences.
- fashion tendencies.
- sports/hobbies.
- memorial practices.
- shared stories.

Culture may diverge from objective historical truth.

---

## 24. Weather, seasons, disasters, and rescue

Required environmental systems over time:

- Four seasons.
- Temperature.
- rain.
- snow.
- heat waves.
- drought.
- storms.
- flood.
- fire.

Weather affects comfort, travel, farming, utilities, illness, clothing, mood, and resource usage.

Fire should eventually propagate based on nearby fuel/material and firefighting response.

NPCs may attempt rescues. Rescue decisions depend on relationship, courage, perceived risk, role responsibility, and available alternatives. Major rescue experiences become highly salient memories.

---

## 25. God Mode

### 25.1 Fundamental rule

**God actions never fail.** If the player chooses a valid God action, the requested state change occurs exactly. Consequences remain emergent.

Example:

- `Give Noah $1,000,000` → Noah receives exactly $1,000,000.
- `Heal Noah` → targeted health state is restored as specified.
- `Teleport Noah` → location changes exactly.

A vague request like “Make Noah successful” should not be implemented as a direct power. Instead the player changes concrete circumstances or attributes.

### 25.2 Power categories

**Individual**

- Give/take money.
- heal/injure.
- kill/resurrect.
- change age.
- alter health.
- alter personality.
- alter emotions.
- add/remove/edit memory.
- reveal/hide information.
- change fertility.
- change attraction.
- teleport / physically pick up and move.
- change skills/abilities.
- change appearance.
- change possessions.

**Relationship**

- Force introduction.
- reveal a secret.
- erase knowledge.
- alter trust/affection/attraction/resentment.
- create/remove social ties.

Relationship edits should live under Advanced Intervention because normal experiments are more interesting when relationships remain outputs.

**World**

- Weather.
- drought.
- snow.
- fire.
- flood.
- disease outbreak.
- blackout.
- water outage.
- food shortage.
- crop boom.
- resource discovery.

**Economy**

- Give/remove population money.
- alter money supply.
- create/destroy inventory.
- modify outside-world supply.
- trigger boom/recession conditions.
- alter utility costs.

### 25.3 No outcome buttons

Do not provide direct societal outcome buttons such as:

- “Increase crime.”
- “Cause riot.”
- “Make society religious.”

Provide causal interventions instead and observe whether outcomes emerge.

### 25.4 Advanced God Mode

The architecture should permit extreme sandbox edits such as population wipeout, universal memory erase, resurrection, age reversal, huge wealth edits, mass relationship edits, permanent weather changes, fertility changes, and NPC duplication. These may be hidden behind a warning/advanced panel, but the underlying engine should not assume the player is constrained to realistic actions.

---

## 26. Experiments, branching, and counterfactual worlds

### 26.1 Experiment workflow

The player can:

1. Select a baseline checkpoint.
2. Define a hypothesis.
3. Create a control branch.
4. Create one or more intervention branches.
5. Apply interventions.
6. Run each branch for a chosen simulated duration.
7. Compare metrics and individual trajectories.
8. Inspect unexpected differences and causal traces.

### 26.2 Deterministic branches

All branches share identical history and random generator state up to the branch point. After branching, the only initial difference is the intervention. This is critical for meaningful comparison.

### 26.3 Multi-seed experiments

Later, the same experiment may run across multiple world seeds to determine whether a result is robust or seed-specific.

### 26.4 Comparison outputs

Compare metrics such as:

- Median/mean wealth.
- inequality.
- employment.
- hours worked.
- business formation/failure.
- food security.
- homelessness.
- births/deaths.
- crime incidents.
- relationship stability.
- happiness/stress.
- political participation.
- migration.

Also compare individual trajectories: career, relationships, family, health, wealth, location, belief changes, and major decisions.

---

## 27. History, cultural memory, and graves

Maintain two histories:

1. **True History** — objective event record visible to God.
2. **Cultural History** — what society believes or commonly remembers.

Important events are automatically promoted from ordinary event logs based on scale, novelty, consequence, and long-term salience. Examples include first election, first murder, catastrophic flood, famous rescue, institutional founding, major strike, or business dynasty collapse.

Citizens may disagree about history. Monuments, building names, traditions, or textbooks can preserve a cultural interpretation that differs from objective truth.

---

## 28. God-level NPC inspector

Selecting a citizen must open a deep inspector while the NPC continues living in the 3D world.

Required sections:

- Current action and destination.
- physical needs.
- emotions.
- health.
- current thought summary derived from structured decision state.
- immediate pressure.
- active goals.
- candidate actions with utility scores.
- selected action and why.
- personality.
- abilities/skills.
- values.
- relationships.
- attraction.
- memories.
- beliefs and confidence.
- secrets.
- finances.
- possessions.
- job/career history.
- family tree.
- life timeline.
- causal trace.
- developer/advanced score breakdown.

Counterfactual diagnostics are a later feature: “If Noah had $500 more, BUY_FOOD would have outscored WORK_OVERTIME.”

---

## 29. Simulation provenance and causal trace

Every major decision should be explainable.

A causal trace should be able to show chains such as:

- formative event.
- resulting memory/emotion/resource change.
- later social exposure.
- belief change.
- immediate need/resource pressure.
- opportunity.
- candidate actions and utilities.
- selected action.

The trace is not philosophical proof of causation. It is a transparent record of the simulation variables and events that materially contributed to the decision.

This feature is mandatory because it supports debugging, player understanding, and independent QA.

---

## 30. Technical architecture

### 30.1 Recommended stack

Use current stable versions at implementation time and pin exact versions in the lockfile.

- TypeScript.
- React.
- Vite for local-first browser development.
- Three.js through React Three Fiber.
- Drei for common R3F helpers where useful.
- Zustand or similarly lightweight store for UI-only state.
- Web Worker for authoritative simulation loop.
- Zod or equivalent runtime schema validation for save/import data.
- IndexedDB through Dexie for local persistence in V1.
- Vitest for unit/property tests.
- Playwright for end-to-end/UAT automation.

Avoid introducing a server, paid cloud service, or database until a concrete feature requires it.

### 30.2 Architectural separation

Use at least these boundaries:

```text
+-----------------------------+
| Presentation / React UI     |
| panels, charts, inspectors  |
+-------------+---------------+
              |
              v
+-----------------------------+
| 3D Rendering Layer          |
| R3F/Three.js                |
| visual interpolation only   |
+-------------+---------------+
              |
              v snapshots
+-----------------------------+
| Simulation Worker           |
| authoritative world state   |
| decisions, economy, events  |
+-------------+---------------+
              |
              v
+-----------------------------+
| Persistence                 |
| snapshots + event log       |
| branches + experiments      |
+-----------------------------+
```

The renderer may never directly mutate authoritative simulation state.

### 30.3 Deterministic random service

All random choices must flow through a seeded PRNG service whose state can be serialized. Never use uncontrolled `Math.random()` inside simulation code.

Recommended API:

```ts
interface RandomService {
  nextFloat(): number;
  int(min: number, max: number): number;
  weightedChoice<T>(items: Weighted<T>[]): T;
  normal(mean: number, sd: number): number;
  snapshot(): RandomState;
  restore(state: RandomState): void;
}
```

### 30.4 State + events + snapshots

Use an authoritative state model plus append-only domain events and periodic snapshots.

- **State** answers “what is true now?”
- **Events** answer “how did it become true?”
- **Snapshots** make loading/replay fast.
- **Branch metadata** records parent checkpoint and interventions.

Do not attempt full event sourcing for every animation frame. Domain events should represent meaningful state changes.

### 30.5 Suggested domain event envelope

```ts
interface DomainEvent<T = unknown> {
  id: string;
  branchId: string;
  simTime: number;
  type: string;
  actorIds: string[];
  locationId?: string;
  payload: T;
  causes?: string[];
  visibility?: EventVisibility;
  historicalWeight?: number;
}
```

### 30.6 Simulation scheduling

V1 can use a fixed one-simulated-minute step because the initial population is only 20. Architect actions around start/end times so later optimization can use a priority event queue.

Each NPC should have an active action with:

- start time.
- expected completion time.
- interruptibility.
- target/location.
- resource reservation if necessary.

At high speeds, batch multiple simulated minutes and emit only meaningful render snapshots.

### 30.7 Rendering data contract

The simulation worker periodically sends a render snapshot containing only what the renderer needs:

- Entity transforms.
- current animation/action state.
- visible appearance state.
- selected object summaries.
- time/weather/lighting state.

Do not send entire memory/belief graphs every frame.

### 30.8 Pathfinding

Start with a lightweight navigation graph / waypoint system covering roads, sidewalks, building entrances, and interior points. Do not add full physics navigation unless needed.

At low speeds, interpolate NPC movement along paths. At high speeds, resolve travel by deterministic duration and arrival events.

### 30.9 Character rendering strategy

V1 should favor one shared rig or procedural low-poly body system with material/color/mesh variants. Reuse geometry and animations. Consider instancing only if population growth later requires it.

Do not load multiple high-resolution unique human assets for 20 citizens.

---

## 31. Core data-model sketch

The following is illustrative, not copy-paste-complete.

```ts
type EntityId = string;
type SimMinute = number;

interface Citizen {
  id: EntityId;
  identity: IdentityComponent;
  life: LifeComponent;
  physiology: PhysiologyComponent;
  health: HealthComponent;
  temperament: TemperamentComponent;
  personality: PersonalityComponent;
  abilities: AbilityComponent;
  skills: SkillComponent;
  values: ValueComponent;
  emotions: EmotionComponent;
  needs: NeedComponent;
  goals: GoalState;
  habits: HabitState;
  householdId: EntityId;
  relationships: Record<EntityId, RelationshipState>;
  memoryIndex: MemoryIndex;
  beliefIndex: BeliefIndex;
  financeId: EntityId;
  jobState?: EmploymentState;
  currentAction: ActionState;
  location: LocationState;
  inventoryId: EntityId;
}

interface RelationshipState {
  familiarity: number;
  trust: number;
  affection: number;
  respect: number;
  attraction: number;
  fear: number;
  resentment: number;
  dependency: number;
  lastMeaningfulContact: SimMinute;
}

interface Belief {
  id: EntityId;
  proposition: StructuredClaim;
  confidence: number;
  sources: BeliefSource[];
  updatedAt: SimMinute;
}

interface EpisodicMemory {
  id: EntityId;
  eventId: EntityId;
  perceivedMeaning: StructuredClaim[];
  emotionAtEncoding: Partial<EmotionComponent>;
  salience: number;
  confidence: number;
  lastRecalledAt?: SimMinute;
}

interface UtilityCandidate {
  actionType: string;
  score: number;
  factors: UtilityFactor[];
  blockers: string[];
  expectedOutcome: ExpectedOutcome;
}
```

The implementation should favor explicit domain types over a giant untyped JSON blob.

---

## 32. Performance strategy for M2 / 8 GB

The M2/8 GB target is a hard design constraint for V1.

Rules:

- Initial population is 20.
- Keep 3D assets low-poly and textures small.
- Reuse materials and animations.
- Keep simulation in a worker to protect rendering responsiveness.
- Do not keep full historical data in React state.
- Persist old events to IndexedDB and keep bounded in-memory indexes.
- Use event IDs and summaries rather than duplicating full event objects in every memory.
- Batch updates at high simulation speeds.
- Disable non-essential visual effects automatically at extreme speed.
- Consider LOD / reduced animation for distant characters.
- Avoid heavyweight physics for routine movement.
- Instrument memory and frame rate from the first milestone.

Target V1 performance:

- 20 citizens at 1×: visually smooth and responsive.
- 20 citizens at 100×: simulation progresses without UI lockups.
- 20 citizens at 1000×: routine animation may be suppressed; simulation should remain usable.
- Saves and branch creation should not freeze the UI for long operations; use worker/background serialization where possible.

Do not claim support for hundreds of citizens until measured.

---

## 33. Persistence, saves, and branch model

### 33.1 Saves

Support:

- Unlimited named manual saves subject to device storage.
- periodic autosaves/checkpoints.
- experiment checkpoints.
- export/import of a portable world bundle.

### 33.2 Save bundle

A save bundle should include:

- schema version.
- code/build version.
- branch metadata.
- world seed.
- PRNG state.
- latest snapshot.
- event segments required after snapshot.
- experiment metadata.
- checksum/hash where practical.

### 33.3 Branching

A branch references a parent checkpoint plus its own new events. Do not duplicate an entire world history every time if avoidable.

Branch creation must preserve PRNG state so control and intervention worlds are identical until the first divergent action.

---

## 34. UI/UX specification

### 34.1 Overall style

Use a clean modern **scientific God-console** rather than a colorful traditional game HUD. The 3D world is the hero. UI panels should be dark/neutral, restrained, readable, and collapsible.

### 34.2 Primary layout

Suggested regions:

- Top: date/time, speed controls, world status.
- Left: timeline / history / experiments.
- Right: selected entity or God tools.
- Bottom or modal: analytics, logs, comparison charts.
- Center: 3D world.

### 34.3 Bubble policy

Keep ambient speech/thought bubbles minimal. Deep internal state appears only when selected or in an explicit debug mode.

### 34.4 Required panels over time

- World overview.
- NPC inspector.
- household inspector.
- business inspector.
- building inspector.
- institution/government inspector.
- history timeline.
- family tree.
- relationship network.
- economy dashboard.
- experiment compare view.
- God tool palette.
- advanced developer/provenance view.

---

## 35. Requirement ID taxonomy

Use stable IDs in code comments, tests, milestone plans, QA reports, and review feedback.

- `VIS-*` — visual / 3D / camera.
- `WORLD-*` — geography, buildings, utilities.
- `SIM-TIME-*` — time and speed.
- `NPC-ID-*` — identity/lifecycle.
- `NPC-NEED-*` — physiology/psychological needs.
- `NPC-PER-*` — personality/abilities/values.
- `NPC-EMO-*` — emotions.
- `NPC-PERC-*` — perception/attention.
- `NPC-MEM-*` — memory.
- `NPC-BEL-*` — beliefs/rumor.
- `NPC-REL-*` — relationships.
- `NPC-DEC-*` — decisions/planning.
- `NPC-CONV-*` — conversation.
- `FAM-*` — romance/family/reproduction.
- `ECON-*` — economy/business/property.
- `HEALTH-*` — health/disease/death.
- `CRIME-*` — crime/evidence/justice.
- `GOV-*` — government/laws.
- `CULT-*` — culture/religion.
- `GOD-*` — God interventions.
- `EXP-*` — experiments/branching.
- `HIST-*` — history/provenance.
- `ARCH-*` — architecture/performance/persistence.
- `UX-*` — application UI.

---

## 36. Canonical high-priority requirements

The following requirements are release-blocking principles.

| ID | Requirement |
|---|---|
| ARCH-001 | Simulation runs locally without paid APIs, Ollama, or runtime LLM dependency. |
| ARCH-002 | Authoritative simulation runs separately from React rendering state. |
| ARCH-003 | All simulation randomness uses a serializable seeded PRNG. |
| ARCH-004 | Domain events and periodic snapshots support replay and branching. |
| NPC-BEL-001 | NPC decisions use personal beliefs/knowledge, never inaccessible objective facts. |
| NPC-DEC-001 | Major decisions expose a utility/planning score breakdown. |
| NPC-DEC-002 | Society-level outcomes may not be directly scripted from global events. |
| NPC-MEM-001 | Important experiences persist as structured episodic memories. |
| NPC-CONV-001 | Conversation meaning is structured semantic data before visible dialogue. |
| NPC-CONV-002 | Core conversation behavior works without an LLM. |
| NPC-REL-001 | Relationships use multiple independent dimensions, not one friendship score. |
| FAM-001 | Pregnancy occurs only after mutual decision to have a child. |
| FAM-002 | Romantic/sexual cheating is not generated. |
| GOD-001 | Valid God interventions always succeed exactly as requested. |
| GOD-002 | God interventions modify reality; downstream NPC reactions remain autonomous. |
| EXP-001 | Timeline branches preserve identical history and PRNG state until divergence. |
| HIST-001 | True history is stored separately from cultural belief/history. |
| HIST-002 | Major individual decisions can export a causal trace. |
| VIS-001 | Citizens are actual stylized 3D figures, not flat 2D sprites. |
| UX-001 | Selecting a citizen exposes deep God-level inspection without pausing their life unless the player pauses time. |

---

## 37. Milestone plan

The builder must implement vertically. Every milestone ends in a runnable, reviewable simulation. Do not create dozens of unfinished subsystems in parallel.

### M00 — Repository and deterministic foundation

Deliver:

- Vite/React/TypeScript project.
- R3F scene.
- Web Worker simulation shell.
- deterministic PRNG.
- event envelope.
- snapshot/save schema.
- requirement/test conventions.
- FPS and worker-step diagnostics.

Gate: same seed produces same deterministic toy sequence across reloads.

### M01 — 3D world and time

Deliver:

- Small handcrafted 3D town shell.
- free camera.
- day/night.
- simulation clock.
- all time speeds.
- pause.
- render/simulation separation.

Gate: 1000× may skip animation but time/state remain correct.

### M02 — One autonomous citizen

Deliver:

- One 3D NPC.
- home, store, workplace.
- hunger, thirst, bladder, energy, hygiene.
- movement/pathing.
- Layer-1 and Layer-2 utility actions.
- deep inspector with score breakdown.

Gate: citizen can autonomously complete several simulated days without player commands.

### M03 — Twenty persistent citizens and social perception

Deliver:

- deterministic 20-person generation age 18–22.
- personality/abilities/values.
- local vision/hearing/attention.
- basic relationships.
- memories.
- beliefs.
- semantic conversation skeleton.

Gate: two people can witness different events and therefore hold different beliefs.

### M04 — Household economy and jobs

Deliver:

- housing/roommates.
- jobs/wages.
- store inventory.
- food purchasing/cooking.
- bank balances.
- bills/rent.
- simple dynamic pricing.
- financial inspector.

Gate: shortage changes prices through inventory/demand, not a global penalty.

### M05 — Social depth, rumor, deception, goals

Deliver:

- multi-turn semantic conversations.
- rumor propagation/provenance.
- lying.
- secrets.
- hobbies/habits.
- long-term goals.
- advice/trust effects.

Gate: rumor can spread to a person who did not witness the original event, with source lineage preserved.

### M06 — Life cycle and family

Deliver:

- aging.
- attraction/relationships.
- commitment/marriage.
- mutual child-planning decision.
- fertility/conception.
- pregnancy.
- birth.
- parenting.
- child development.
- death, funeral, graves, inheritance baseline.

Gate: click a grave and reconstruct the full life timeline from persisted data.

### M07 — Business, property, and inequality

Deliver:

- entrepreneurship.
- business accounting.
- hiring/firing.
- multiple property ownership.
- loans/rent.
- inheritance expansion.
- business failure.

Gate: wealth inequality arises from transactions and ownership history.

### M08 — Crime, evidence, and local institutions

Deliver:

- opportunity-based theft and selected crimes.
- witnesses/evidence.
- suspicion/investigation.
- informal meetings.
- emergence of local governance/security.
- data-driven laws.

Gate: non-witness NPCs do not know a crime until information reaches them.

### M09 — Culture, religion, politics

Deliver:

- preexisting worldview diversity.
- belief response to unexplained events.
- emergent groups.
- rituals/traditions.
- politics/elections where conditions permit.
- cultural history divergence.

Gate: an intervention can be interpreted differently by different groups without changing objective truth.

### M10 — Weather, disease, disaster, utilities

Deliver:

- seasons/weather.
- water/electricity dependencies.
- disease spread.
- fire/flood/selected disasters.
- rescue behavior.

Gate: outage/disaster consequences propagate through actual dependencies.

### M11 — God Mode and experiments

Deliver:

- individual/world/economic God tools.
- advanced editor.
- named saves/checkpoints.
- branch creation.
- control/intervention comparison.
- multi-branch experiment UI.

Gate: a branch with no intervention reproduces control exactly.

### M12 — History, provenance, polish, performance

Deliver:

- true vs cultural history views.
- historical event promotion.
- causal trace export.
- graves/family trees polish.
- performance tuning.
- review bundle generator.
- regression suite.

Gate: complete canonical demo scenario passes Grok/UAT review.

---

## 38. Builder working rules

1. Implement only the current milestone plus prerequisites.
2. Preserve requirement IDs in code/tests.
3. Never “simplify” an invariant without explicit product-owner approval.
4. If a full system is too large, implement the smallest version with the correct architecture rather than a fake shortcut.
5. Keep the app runnable after every meaningful change.
6. Add tests for every bug discovered by the reviewer.
7. Do not add runtime AI dependencies.
8. Do not introduce cloud services without approval.
9. Generate a review bundle after each milestone.
10. Do not move to the next milestone until current milestone blockers are closed.

---

## 39. Review bundle contract

Each milestone should be able to export a folder or zip for independent review containing:

- `build-manifest.json` — commit/build/version, milestone, schema version.
- `requirements-status.json` — implemented/tested requirement IDs.
- `test-results.json` — unit/integration/e2e results.
- `perf-report.json` — FPS, worker step time, memory estimates for defined scenarios.
- `world-seed.txt` — canonical QA seed.
- `save-baseline.json` or portable save bundle.
- `event-sample.json` — selected domain events.
- `causal-traces/` — selected trace exports.
- `screenshots/` — fixed camera shots and inspector panels.
- `known-issues.md` — builder-declared limitations.
- `architecture-summary.md` — current module boundaries and deviations.

This bundle exists specifically so a reviewer such as Grok can inspect progress independently and return precise feedback.

---

## 40. Anti-patterns and prohibited shortcuts

The following must be rejected in review:

- `if famine: crimeRate += X`.
- global knowledge injected into NPC decisions.
- one universal reputation score used by all NPCs.
- “random dialogue” that does not map to semantic actions.
- LLM calls required for basic NPC autonomy.
- direct React component mutation of simulation entities.
- uncontrolled `Math.random()` in simulation logic.
- timelines that fork without preserving RNG state.
- NPC memories stored only as generated prose with no event linkage.
- characters teleporting for normal travel at observable speeds without travel duration.
- major profession changes without training requirements.
- pregnancy without mutual family-planning decision.
- generated cheating behavior.
- God action silently failing.
- graves that lose access to historical life data.
- deleting historical events merely to save memory without archival persistence.

---

## 41. V1 scope boundary

The full specification describes the intended system, not the first playable build. V1 should prioritize M00–M05 with the architecture needed for later systems.

A successful early build is more valuable than a giant incomplete design. The first “wow” moment should be:

> Twenty distinct 3D young adults wake up, eat, work, socialize, form opinions, remember events, spread information, make different choices under the same shortage, and can be inspected down to the reasons for each decision — all locally, without an LLM.

---

## 42. Final product acceptance statement

GOD MODE is faithful to the intended vision when the player can observe a society at both human and systemic scale; when citizens possess imperfect local knowledge and persistent personal histories; when economic, social, criminal, religious, and political patterns arise from citizen behavior instead of global scripts; when God interventions always alter reality but never pre-author NPC reactions; when lives continue across generations; when alternate timelines can be compared fairly; and when the player can explain not only **what** happened but inspect **why this simulation produced it**.
