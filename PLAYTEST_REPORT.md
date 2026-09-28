# DEEP BELOW expansion · playtest report

## Scope and method

Tested in the running, dependency-free game served by `python3 -m http.server 8000`, using a separate page in the shared Chromium browser. Opening/menu/camp interactions used browser clicks and movement controls. Repeatable generation, combat and late progression used the explicit browser harnesses under `tests/`, including synthetic equipment/material fixtures. No test harness is loaded by the production page. Test fixtures were cleared before leaving the preview.

**Automated simulation is not a substitute for a human campaign playthrough.** Timings below distinguish simulation time from observed rendering time. No claim is made that the full campaign was completed with naturally earned endgame equipment.

## Results

### Regression suites

- **127 assertions:** migration from old/incomplete/invalid saves; deterministic tile and item generation across twelve seeds for each of three acts; all generated landmarks and boss entrances reachable with the required seal tool; successful contract banking; death salvage; protected inventory; checkpoint validation and restoration; Sovereign phases and Accord.
- **64 assertions:** physical refinery discovery; project costs; Copper Bar, Iron Bar and Reinforced Alloy recipes; purification; base pick/sword/bow crafting; Prospector versus Breaker, Ripper/Bulwark/Frostbrand and piercing; utility crafting; building collision; four contextual NPC milestone lines; loadout resource idempotency on reload; both original boss entrances/phases/unlocks; pause-safe King transition; pending-ending reload; Severing and Sleeping Seal; results receipt; two New Game+ cycles; import; corrupt/full storage recovery; every enemy state machine; ten-minute simulated soak.
- **18 edge assertions:** abandoning a rescue and protecting a nest fail their respective contracts; full-health tonic attempts do not fail restraint objectives; tonic checkpoint includes healing; rope pause/extraction/consumption; dead-checkpoint recovery; exact numeric seed reuse; Warden tradeoff; migration oil reward; sap attention; recorder, bridge and heat-pack effects; focus-loss input clearing, immediate short-click consumption, memory-rescue progress and concurrent-tab protection.
- The ten-minute simulation used ordinary update/effect cleanup. A recorded run ended with **88 enemies, 27 items, 10 particles and zero projectiles**, within their enforced caps. Counts depend on stochastic combat. This does not establish memory stability over hours or across every device.

### Opening route: real mechanics, scripted navigation

Seed `91028`, fresh equipment, Surveyor, Iona’s Last Signal. The harness walked the generated paths, mined seven ore, collected the drops, fought the early crawler, threw a flare, spent two carried copper plus oil to repair the relay, opened the chest, and walked back to the lift.

| Milestone | Simulation time |
|---|---:|
| Reach early resource cluster | 6 s |
| First ore broken | 7.3 s |
| Seven ore mined and collected | 26 s |
| Crawler encounter completed / flare used | 35 s |
| Relay signal recovered | 38 s |
| Chest recovered | 43 s |
| Successful extraction | 50 s |

Observed result: one completed contract, Archive restored, $180 including the chapter reward, raw materials banked, journal and collection discoveries, and four rotating intentions available afterward. The Copper Pick was then crafted from this actual haul for four copper, three coal and $35, leaving $145; no materials were injected for that purchase. An earlier run of the same route took 45 seconds; stochastic combat and mining change timings.

**Pacing finding:** an informed direct route is substantially shorter than the requested 5–10 minutes. There is room for optional rescue, landmarks and exploration, but a timed human first-session study is still needed. Reading, orientation and choice time were not included. The implementation does not force players to wait to satisfy a timing target.

### Browser controls and presentation

- Opened the title menu, opening dialogue and expedition selection in a separate browser page.
- Walked through camp with movement input; tested building collision and station prompts through the harness. Campfire/Marrow/lift interactions open their respective dialogue/menus.
- Physically discovered a station before testing its shortcut. Constructing it changes its scaffolding, lights and machinery.
- Tested real browser clicks on mobile hotbar and USE: slot 4 threw one dynamite, decremented stock once and cleared held input on release. A fast-tap consumption bug was fixed during this pass.
- Tested directional pointer down/up and observed movement with released keys cleared. A synthetic inactive-pointer experiment exposed an unconditional pointer-capture call; capture now only applies to trusted active pointer events. Subsequent trusted browser clicks verified consumption.
- Tested desktop `1365×900` and `1280×720`, portrait `390×844`, landscape `844×390`, and emulated DPR 1/2/3. Menus scroll instead of clipping; the tested portrait document had no horizontal overflow. Camp zoom increases on narrow screens; touch controls are separated from the portrait playfield.
- Adjusted boss lighting after visual inspection so the Sovereign stays legible outside the player’s immediate lamp circle. Added larger Root item icons, generated portraits, camp props and gentler terrain texture.
- A **120-frame desktop sample** with the boss scene rendered while paused measured **16.61 ms average / 16.80 ms p95** (~60 fps). Heap at that instant was approximately **26.7 MB**, with four transient audio voices. This is a short rendering sample, not a performance guarantee on physical phones or active worst-case combat.
- Network inspection showed game scripts/styles loading successfully. Initial favicon 404s were eliminated by an embedded icon. Expected save-corruption/storage-quota diagnostics were logged by their failure tests. No unresolved production page exception was observed in the final clean smoke flow. The corrected inactive-pointer path was separately checked with pointer cancellation.

### Reload and persistence flows

Validated fresh and legacy characters, missing nested state, invalid numbers, corrupt JSON preservation, quota failure warning, camp persistence, expedition restoration, boss health/phase restoration, dead-player restoration, results receipts, final-choice restoration, import roundtrip, and two New Game+ cycles. Locked inventory cannot be sold by individual or bulk market actions. Reopening results or re-entering claimed discoveries does not grant rewards again.

Snapshots intentionally restore paused. Page-hide writes are best effort; a browser process crash may lose up to twenty seconds since the last checkpoint.

A final targeted consequence check used seed `1818`: two corruption choices produced exactly two additional Root Choir sentries. The fixture was then removed and the preview restored to the fresh opening.

## Issues found and fixed during implementation

- Broken `js/` script URLs prevented the original checked-out game from starting.
- Guaranteed ore was being erased by subsequent corridor carving.
- Rescue abandonment / nest protection could accidentally satisfy contrary contracts.
- A memory-rescue objective collided with the Memory Glass inventory ID.
- Full-health tonic attempts counted against no-tonic challenges.
- Tonic snapshots could record consumption before recording the heal.
- Reloading during death or the Sovereign’s final choice could strand the player.
- Restoring a run could grant condition/loadout supplies twice.
- Printed numeric seeds were rehashed instead of reused exactly.
- Boss transition timers ignored pause; they now use simulation time.
- The pressure HUD disagreed with the expanded damage formula.
- Short touch taps could miss consumable activation between frames.
- Off-screen ranged attacks and unbounded effects had insufficient safeguards.

## Review

CodeRabbit was invoked with `coderabbit review --agent -t uncommitted`. It reported that review is **disabled for this coding task**. No automated review findings or clean-review claim are available. Syntax, in-browser regression checks and manual inspection were performed instead.

## Player-focused critique

The strongest change is that returning matters. Iona’s signal gives the first descent a purpose; choosing a contract/loadout changes preparation; discoveries can ask for supplies or restraint; and the camp visibly remembers your returns. The third act adds a different kind of greed: amber and noise draw attention, while some “treasure” is another person’s memory. The ending offers a concrete interpretation of your journey.

The weakest areas are long-term pacing and encounter authorship. The side destinations reuse a compact event framework, and the camp’s buildings share architectural elements. A cautious player can still retreat early repeatedly, and late equipment prices inherit much of the original grind. The training yard currently provides a safe damage/property readout, not a fully animated practice enemy. The act-three finale has real phases and choices, but needs human dodge/readability testing at normal progression strength.

**Self-rating: 7.5/10 as a playable expansion; not a validated 9/10 finished commercial game.** The integrated systems and regression coverage are strong. Human campaign pacing, deeper encounter variation and physical-mobile performance remain the reasons to withhold a higher rating.

## Known limitations and balance questions

1. Is the short opening satisfying, or should a second signal/rescue be part of the required chapter? Validate against actual first-time players before lengthening it.
2. Does the original late-game price curve require too many runs? Contract rewards now help, but natural progression through all thirteen layers has not been timed.
3. Is Root attention meaningful enough at high gear levels? Is the sap/loot tradeoff preferable to immediately banking every small haul?
4. Is the unconditional Severing too easy relative to Accord/Seal discovery requirements? All three are implemented; their emotional and mechanical weights need player feedback.
5. Do camp shortcuts unlock at the right moment? Are small-screen players able to identify buildings without relying exclusively on the map?
6. Overheat is deterministic batch processing with a fuel cost; it does not yet simulate furnace accidents. This favors planning and avoids random ordinary-craft loss.
7. Optional variants are local destinations/events, not full independent dungeon acts. Some NPCs share contextual dialogue patterns. The training yard is a readout. These are functional but shallower than the most ambitious parts of the brief.
8. Reduced motion disables shake and UI transitions; some ambient canvas motion remains. Canvas combat is not fully screen-reader accessible.
9. No multi-hour memory/audio test, physical-phone benchmark, exhaustive accessibility audit, or full natural-progression campaign playthrough was performed.

## Pixel RPG camp correction — 2026-09-28

This pass replaces the rejected high-resolution camp presentation with an integer pixel surface, a darker material palette, irregular footpaths and distinct work areas. The readable guide and close camera remain.

- **46 browser assertions passed** in `tests/camp-presentation-checks.js`: all 15 walking routes and their segments, building collision, discovery/interactions, guide progression, pointer cancellation, canvas transitions, death respawn, eight distinct walk frames in each direction, multiple action silhouettes, courier navigation and bounded sprite caching. Tests block save writes and run in a disposable browser page.
- An initial test found an invalid tool-frame index under an exaggerated hurt timer; clamping resolved it. The final pass has no failed assertions.
- **Opening regression:** moved, mined and collected seven deposits, fought the crawler, threw a flare, recovered the relay, collected the chest and returned to the lift. Timings: ore cluster 6 s; seven ore 26 s; encounter/flare 35 s; relay 37 s; chest 41 s; return 48 s. These are scripted simulation seconds, not human pacing. One contract, the Archive and $180 were earned.
- **Visual checks:** desktop 1280×800, portrait 390×844 and landscape 844×390. Camp now uses roughly 3 screen pixels per source pixel; text stays separately readable. Pixel character sheet and animated walk preview captured. Physical phones remain untested.
- **Timing:** 120 camp frames averaged 16.64 ms, p95 16.80 ms, with 149 cached sprite frames; no document horizontal overflow. This is a short desktop sample, not a performance guarantee for every device.
- **Review:** CodeRabbit was disabled by task configuration; no automated review completed.

Player-facing assessment: the camp reads as a worn mining outpost instead of a row of matching shop plots. Directional walking, planted-foot poses and distinct attack/recovery frames make movement more legible. The first-trip guide reduces menu searching. The art direction still needs the player's judgment; no claim is made that automated checks measure atmosphere or enjoyment.

## Playable arrival and mine atmosphere — 2026-09-28

- **Prologue: 36 assertions passed.** Walked the actual update/collision path to all five interactions; verified each stage, progress persistence, skip, replay isolation, migration of partial progress, focus loss, touch/click resumption during the cage transition, and one automatic first expedition. Controlled walking time: **13.47 simulation seconds**; reading estimate at 198 words/minute: **69.4 seconds**, plus **3.6 seconds** for the cage (roughly 87 seconds combined). This supports a 1–2 minute target; it is not a first-time human usability measurement. Players may linger, and Skip to camp is always available.
- **World generation: 120 assertions passed across 36 seeds.** Deterministic tiles, decor, landmark state, lights and loose items; every landmark and boss approach reachable; one optional point per Old Mine layer; no optional landmark emits blue light. The mission objective remains guaranteed.
- **Camp/animation: 47 assertions passed.** Includes previous route/UI coverage, distinct animation frames, and a new check that blocked walking does not advance the gait.
- **Opening expedition regression passed.** Ore cluster 6 s; seven ore collected 27 s; crawler and flare 37 s; relay 40 s; chest 45 s; extraction 52 s. All times are simulation seconds. No reported errors.
- **Browser presentation:** inspected desktop 1280×800 and portrait 390×844 intro scenes; actual button click lit the heater and displayed the next story text. Captured `output/blackwood-arrival.png`. The earlier camp pass covers landscape presentation; a physical-phone playthrough remains untested.
- An inspection found that the paused cage sequence initially blocked its Resume button; it was fixed and covered by the final prologue test. Syntax and patch whitespace pass. CodeRabbit review remains disabled by task configuration.

The prologue uses lamp oil and backpack limits as the expedition constraints. Its generator powers the arrival animation; it does not imply an unimplemented fuel or oxygen countdown. The protagonist’s inherited claim and grandfather’s journal now lead into Iona and Marrow’s existing campaign.

## Mandatory guided prologue follow-up

First-play Skip is removed, superseding the optional-skip behavior reported above. A fresh isolated browser origin booted directly to “Forty years after…”. Two real button clicks progressed through the opening cards to the guided staging shed. At 390×844, text and controls fit without horizontal overflow. The browser harness passed 42 assertions including blocked movement during cards, skip prevention, all five actions, pause, saved-step recovery and replay isolation. Walking took 13.47 simulated seconds; existing scene text estimates 69 seconds of reading, plus the two short opening cards. This supports a roughly 1–2 minute target, not a measured first-time human completion. Browser errors were empty. Syntax and whitespace checks passed. CodeRabbit review was unavailable because it is disabled for this task.

## Forest clearing presentation pass

Replaced the prologue shed with a woodland clearing, curved trails, bedroll shelter, table, woodpile, stream edge and timber mine entrance. Camp and prologue share wind-driven trees, falling leaves and frame-based flames, embers, smoke and warm light. Camp music now follows a slower eight-bar folk motif; underground air carries sparse biome-tinted motes under the lighting pass.

- Browser intro harness: **42 passed**, including every guided action, route reachability, completion, pause, resume and save compatibility.
- Browser camp harness: **47 passed**, including paths, stations, collisions and animation behavior.
- Inspected prologue at 1280×800 and 390×844, plus camp at 1280×800. Captured screenshots; mobile caption/action fit.
- Canvas comparisons confirmed fire and tree frames change; reduced-motion trees stay still and leaves are suppressed.
- Instrumented 512 camp music ticks: 240 tones and 16 noise events, with no per-frame audio scheduling. Actual cave smoke check rendered with no browser errors; observed 11 active audio voices, below the existing 64-voice cap. This is not a long-duration audio soak or a listening evaluation.
- JavaScript syntax and whitespace checks passed. CodeRabbit review is disabled for this task; no review completed.
- Existing save fields are retained, including `intro_heater` for the new campfire. No migration reset.

## Shared clearing and terrain correction

The prologue now uses the established camp’s 640×360 coordinates. The western tent, central fire, southeastern lift, old haul road and surviving tree groves persist across both scenes. The early scene groups the journal/radio at the shelter and fuel/repair timber beside the mine generator; three old stumps mark future building sites. Worn dirt blends into grass without outlined path borders. Directional object shadows, shaped canopy shadows and quieter ground texture replace scattered noise. Trees grow in uneven groups, including inside the clearing, and their trunks block movement; canopies fade when they hide the player.

Final browser checks: **48 intro assertions and 47 camp assertions passed**. The intro harness independently flood-filled the new collision map and physically walked all five objectives in **23.6 simulated seconds**, excluding reading. Camp routing still reaches every station. All tree trunk centers block movement in both scenes. Inspected 1280×800 prologue and camp plus 390×844 prologue; no browser errors observed. Syntax and whitespace checks passed. Screenshots: clearing-layout.png, clearing-mobile.png, established-clearing.png. Existing music/particle systems are retained. CodeRabbit review remains disabled by task configuration. Human judgment is still needed on visual style and reading pace; these are not measured by assertion counts.

## Texture and guide-trail follow-up

Ground texture now uses discrete colour steps and pixel clusters instead of smooth ramps. Trees retain the shared grove layout with added bark, branches, needle clusters and irregular leaf edges. Fixed stale guidance: the old cache returned the full starting trail whenever the player remained near any dot. The replacement caches a destination field and traces from the current reachable node, checks the whole connection around corners/trunks, and clears the trail on arrival.

**54 camp checks and 48 prologue checks passed.** Seven added regressions cover discarded trail history, a current starting point, arrival, off-route recovery, trunk-adjacent connections, destination changes and invalid destinations. Desktop (1280×800) and mobile (390×844) screenshots inspected; no horizontal overflow or browser errors observed. Syntax and whitespace checks passed. CodeRabbit review remains disabled by task configuration. Existing saves, music and cave behavior are unchanged by this follow-up.
