# Save migration · schema v3

## Compatibility

The storage key stays `deepbelow_save_v1`. Unversioned saves translate their old `up.pick` and `unlocked` fields. Version 1/2 equipment, wallet, upgrades, materials, statistics, achievements and sequential quests are retained. Values are checked for type, finiteness and bounds. Unknown inventory IDs are discarded because they cannot be rendered or valued by this version. Arrays now support all three acts.

Missing nested objects receive defaults. New `exp` state holds story flags, discovered journal IDs, relationships, camp construction/discovery, protected stock, branches, contracts, rescues, outcomes, mastery, conditions, loadout, seed and the last thirty expedition measurements. This state survives New Game+; the original reset list still resets equipment, inventory, money, route access, boss flags and sequential quests.

## Checkpoints and receipts

`checkpoint.version = 1` stores the player, run, tile/damage/decor/exploration arrays, enemies, projectiles and hit references, hazards, supplies in flight, vents and landmarks. Typed arrays and sets are serialized explicitly. Loading validates dimensions, finite values, known items/enemies, collection limits and player coordinates. Invalid checkpoints are discarded while the character is retained.

Restoration rebuilds the seeded world, restores its simulation state, and pauses. It does not increment expedition count, refill the lamp or grant loadout resources again. Dead-player checkpoints resolve through ordinary death/salvage; pending Sovereign outcomes reopen their choice. King transitions use simulation time and stay paused with the game.

Extraction/death clears the checkpoint and writes the banked inventory, payment, flags and a results receipt in one localStorage write. `lastResult` is presentation data, not a reward command. Continuing clears it. Reopening a receipt or revisiting a claimed discovery does not repeat a reward.

## Failures and recovery

- Corrupt JSON: retain the original raw value, lock automatic writes, show a recoverable message. Valid import or explicit reset unlocks saving.
- Storage quota/access failure: gameplay continues in memory; a warning recommends exporting. No silent claim of persistence.
- Import: recognizes the existing character wrapper or raw character object, applies the same migration/validation, then saves.
- Concurrent tabs: a storage-change event pauses the active expedition and locks its writes until reload or explicit import/reset. Idle title screens do not autosave.
- Browser crash: the latest successful checkpoint survives. Up to twenty seconds can be lost between periodic checkpoints; page-hide saving is best effort.

No schema migration writes server data. There are no accounts, network saves or external dependencies.

## Pixel camp and animation update

No schema or storage-key change. Building discovery, construction and guide milestones use existing save fields. New scenery, walking trails, camera position and sprite caches are transient. Existing run checkpoints without a last rendered facing direction default to facing down until the player moves. Camp movement boundaries and station locations are reconstructed from the current layout on entry; saved resources and progression are retained.

## Playable Blackwood arrival

Schema v3 and the original storage key remain unchanged. The existing validated `exp.flags` dictionary now accepts `intro_heater`, `intro_journal`, `intro_generator`, `intro_radio`, `intro_lift` and `intro_done` (boolean flags). An interrupted prologue resumes at the next unfinished action; a reload during the final cage movement replays only that last step. Missing flags are safe. Completed or established characters are not forced into the prologue, and New Game+ retains completion. Menu replay uses only temporary scene state and cannot grant rewards, spend materials, overwrite an expedition checkpoint or mark story progress. First play is mandatory: exiting cannot grant completion. Fresh characters start directly on click-through opening cards; established characters retain their normal menu. No new save fields are required.

A discovered `inheritance` journal entry adds the grandfather’s history. Existing story and quest entries are retained. New cave generation has fewer optional landmarks; checkpoint tile arrays and stored POIs still restore existing expeditions.

The forest-camp presentation retains `intro_heater` as the campfire-completed flag for compatibility. No progress is reset when upgrading from the shed scene.

The shared-clearing revision changes scene coordinates only. Saved prologue steps resume beside the previous landmark in its new location; flags, rewards and camp progress are retained.
