# DEEP BELOW · The Sunken Root

A dependency-free, generated-pixel-art mining roguelite for modern browsers. Three acts, thirteen major layers, a walkable home camp, and expeditions built around people, discoveries and difficult choices.

## Play locally

Open `index.html`, or run this from the repository root:

```sh
python3 -m http.server 8000
```

Visit `http://localhost:8000`. There is no installation or build step. All scripts live at the repository root; their order in `index.html` matters. Audio starts after a user gesture.

## Your first chapter

You inherited your grandfather’s journal and spent ten years buying back Blackwood Mine. A new character opens directly on fading, click-through story cards, then enters a rain-soaked staging shed: walk to the heater, read the journal, start the generator, answer Marrow’s radio and lower the cage. The five-step prologue is designed for roughly 1–2 minutes, has no forced reading delays, and is required on first play. Gold markers and movement/action prompts guide every step; each scene has its own sound cue. Completed steps survive reload; **Play Prologue** on the menu replays it without changing your character or saved expedition.

Marrow’s niece Iona followed the same sketch and has transmitted a signal from below. The prologue leads straight into **Iona’s Last Signal**. Copper near the lift repairs her relay; taking its battery offers a more dangerous alternative. Follow the cyan marker, read the signal, and return to a lift. Your first successful return restores the Archive and pays enough for an early tool or camp project.

The initial oil supply is six minutes, plus loadout/project bonuses. A direct route is deliberately short; detours offer rescue, resource and story choices. Oil, backpack space and health make continued exploration a decision.

## Canonical controls

| Input | Action |
|---|---|
| WASD / arrow keys | Move |
| Mouse / touch on the playfield | Aim |
| Left mouse / USE | Use selected tool; hold for mining, melee or ranged fire |
| Right mouse / MINE | Always mine; **does not throw dynamite** |
| 1–6 / mouse wheel / hold Tab | Select pick, sword, ranged, dynamite, flare, tonic |
| E / TALK–LIFT | Interact; extract when on a lift; scan when away from an object |
| Space | Extract at a lift; interact in camp |
| Q / F / R | Tonic / flare / escape rope |
| Z / ABILITY | Lantern pulse: slows nearby creatures; 18-second cooldown |
| B / G / H / V / Y | Bridge / decoy / heat pack / recorder / pollen infusion |
| C / J (camp) | Building symbols, walking routes and station shortcuts / field journal |
| ? or / (camp) | Step-by-step field guide and current next action |
| Escape | Pause underground; close a camp station |
| Tab / Shift+Tab / Enter (menus) | Standard keyboard focus and activation |

Touch has directional and action buttons, plus a contextual interaction button. To throw dynamite, select slot 4 and use it. Special workshop utilities also appear as touch buttons when carried. Losing browser focus clears held input and pauses the expedition. Story choices pause play. Escape ropes can be interrupted by damage.

## Camp and economy

- **Forge:** craft the existing equipment tiers; restore it to choose one enchantment branch per equipment slot. Branches carry to higher tiers and can be replaced by paying the new recipe.
- **Refinery:** ten recipes turn raw ore into bars, alloys, lenses, resin and recorded relics. Safe refining is deterministic. Overheat processes twice the material for twice the output plus fuel; purification adds a one-expedition health ward.
- **Workshop:** original supplies plus bridges, decoys, heat packs, memory recorders and pollen infusions.
- **Infirmary:** +20 maximum health and one extra salvaged item. Death places you outside its door.
- **Map Room:** lift/biome atlas, optional destinations and +30 starting oil.
- **Archive:** field observations, campaign history, creature counts and mastery rewards.
- **Contract Board:** four rotating intentions after the opening, drawn from 24 contracts. Restoring it increases cash rewards by 25%.
- **Training Yard:** safe equipment readout and a permanent 10% melee bonus.
- **Relic Gallery:** fifteen named collection discoveries, with up to five backpack slots.
- **Signal Tower:** five expedition conditions, daily seed text and custom seeds.
- **Root Garden:** late research and +45 oil in Act III.
- **Safe Storage / market:** lock materials against all sale actions. Locked stock remains available for crafting. Rare and refined materials are automatically protected. Sale confirmation reminds you about crafting and contract needs.

The camp is drawn on a low-resolution pixel canvas with a close following camera. Worn paths connect irregular work areas, tents, a kiln, open workshops and stone ruins. Workers haul supplies, Bera hammers at her station, residents take short walks, and cloth, fire and machinery animate on discrete frames. Building signs use pictograms; readable names appear when you approach.

Open **GUIDE / ?** for your next step, the first expedition checklist, and practical controls. Open **PLACES / C** and select **Show route** to mark a collision-aware walking trail to any building. The guide advances using your existing story and equipment progress. Camp touch controls show movement and contextual interaction.

Every station can be reached on foot. Visit once to unlock its camp-map shortcut. Construction changes the building, lights and machinery. NPCs react to discoveries, rescues, deaths and victories; several have personal requests. The campfire and recovered miners provide a quiet moment between runs.

## Expeditions, builds and replay

Choose **Surveyor** (+45 oil and scanner), **Warden** (+30 HP, −3 slots), or **Porter** (+6 slots, −15% speed). Contract objectives cover recovery, rescue, ore, combat, mapping, fragile cargo, speed, restraint and boss mastery. Progress is visible underground; extraction is required for payment. Death retains notes and restored routes, and automatically salvages the most valuable items according to your upgrades.

Prospector, Breaker, Silent Grip, Deep Pulse and Rootcarver change mining decisions. Ripper, Bulwark, Frostbrand and Echo Blade change melee; piercing, chain and frost branches change ranged combat. Armor offers carrying, pressure and rescue choices. Flares repel enemies; lantern pulses create escape windows. Dynamite breaks terrain quickly, but noise and falling rock have consequences.

The Old Mine and Frozen Deep have optional authored destinations: Rustworks, Ashen Quarry, Forgotten Shaft, Redwater Cut, Glass Glacier, Whiteout Shelf, Spore Cathedral and Blue Ruins. Five cross-act rare destinations add encounters. These are side rooms and local terrain treatments inside the main layers, **not thirteen additional full-sized biomes**.

**The Sunken Root** adds Rootfall Descent, Amber Flood, Memory Grove, Heartwood Labyrinth and Root’s Heart. Sap slows movement; carrying amber attracts attention. Noise awakens the Root. Abandoning voices or accepting certain scavenger bargains adds persistent corruption: up to three extra Choir sentries guard later Root expeditions. Optional living gates can be mined, fed sap or soothed with a flare. Memory choices, rescued echoes, archives and Root research connect the earlier acts to three final outcomes:

- **The Severing:** end the Root’s threat; the garden becomes a memorial.
- **The Accord:** preserve it after rescuing enough echoes or completing research.
- **The Sleeping Seal:** restore containment after studying the charter.

The Sovereign reacts to noise/light, floods its arena, and summons memory enemies across three combat phases before the final decision. An ending grants Rootcarver, materials and a camp transformation. Ten mastery goals and uncollected histories remain afterward.

**New Game+** resets gear, cash, materials and route access, retaining camp projects, relationships, branches, journal, collections, mastery and ending history. Existing difficulty modifiers remain; Nomad’s Lantern removes tonics in favor of discovery healing, while Keeper’s Oath changes the contract/market economy. Conditions provide mineral blooms, migration, echo visibility and flare-focused darkness. A numeric result seed can be entered exactly at the Signal Tower; use the same act, starting layer, intention, destination and campaign state to reproduce placements. Combat and loot rolls remain stochastic.

## Saving and recovery

The original `deepbelow_save_v1` storage key is retained. Schema **v3** migrates unversioned/v1/v2 characters without resetting money, equipment, materials, quests or achievements. See [SAVE_MIGRATION.md](SAVE_MIGRATION.md).

Expeditions checkpoint every twenty seconds and on important save actions/page hide. Reload restores the simulation **paused**, including terrain, loot, enemies, boss health and pending endings. Results are receipts: reopening them never issues rewards again. Camp saves immediately. Import/export is available from the menu. Corrupt JSON is preserved and automatic overwriting is disabled until explicit reset or valid import. Unavailable/full storage produces a visible warning; export your character before closing.

## Settings and accessibility

Master/music/effects volume, screen shake, particles, extra cave contrast and reduced motion are adjustable. System reduced-motion preference disables shake by default. Menus have visible keyboard focus and scroll on small screens. Portrait layouts separate controls from the playfield; landscape has a larger cave view. Canvas gameplay has contextual text labels but is not fully screen-reader playable.

## Architecture

- `core.js`: shared constants, original content, saves and procedural audio.
- `content.js`: authored campaign, Root layers/resources, contracts, projects, branches, recipes and collections.
- `world.js`: seeded cave generation, painter, chunks, minimap and icons.
- `game.js`: lifecycle, movement, mining, inventory, weapons and hazards.
- `enemies.js`: original enemy/boss state machines and rendering.
- `sprites.js`: cached pixel frames, four directions, eight-frame walks, mining/melee, shooting, hurt, climbing and death poses.
- `render.js`: player animation selection, lighting and effects.
- `camp.js`: camp pixel art, scenery, resident routines, building symbols, guide and walking routes.
- `intro.js`: playable Blackwood arrival, progress flags, replay isolation, rain and cage sequence.
- `expansion.js`: walkable hub, story/events, connected landmarks, contracts, Root mechanics/enemies, endings and checkpoints.
- `ui.js`: panels, HUD, controls and frame loop.

## Verification

No test library is required. JavaScript syntax can be checked with `node --check <file>`. Browser harnesses in `tests/` are **not loaded by the game**. Run them only in a separate disposable test page, with a backup of any character you care about:

```js
await eval(await (await fetch('/tests/browser-checks.js')).text());
await eval(await (await fetch('/tests/systems-checks.js')).text());
await eval(await (await fetch('/tests/edge-checks.js')).text());
await eval(await (await fetch('/tests/camp-presentation-checks.js')).text());
await eval(await (await fetch('/tests/intro-checks.js')).text());
await eval(await (await fetch('/tests/arrival-world-checks.js')).text());
```

Those harnesses restore their initial saved character in `finally`; they exercise synthetic progression to reach late content. `tests/opening-playthrough.js` deliberately starts a fresh character and follows the opening using real movement, mining, combat and collection updates. It reports **simulation time**, not human reading or decision time. Never run it in a page containing a valued character.

See [PLAYTEST_REPORT.md](PLAYTEST_REPORT.md) for exact tested flows, timings, limitations and balance questions. Long-term balance and subjective fun require human sessions; automated checks cannot establish them.

### Mine atmosphere and movement

The Old Mine has one optional landmark per layer, plus its guaranteed contract and first-chapter shelter. Later acts have two per layer plus authored story locations. Ordinary objects use worn wood, iron and muted amber; only the mission relay retains blue illumination. Mandatory objectives and their access paths remain guaranteed.

Miner frames are about 12% shorter with unchanged collision boundaries. Walking advances every seven traveled pixels (previously four), uses stable diagonal facing and stops animating when blocked.
