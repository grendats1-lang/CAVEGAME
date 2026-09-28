# DEEP BELOW

A top-down pixel-art mining roguelite. Dig into a procedurally generated cave, grab what you can, and decide: cash out now, or risk it all for something better deeper down.

Everything (pixel art, lighting, sound effects, music) is generated in code. No asset files, no dependencies.

## Play

- **Online:** after the pipeline on `main` finishes, open the GitLab Pages URL (Deploy > Pages).
- **Locally:** open `index.html` in a modern browser, or run `python3 -m http.server` in this folder and visit http://localhost:8000.

## Controls

| Input | Action |
|---|---|
| W A S D | Move |
| Mouse | Aim |
| Hold Left Mouse | Mine / attack |
| Right Mouse | Throw dynamite |
| E | Cave scanner pulse (upgrade) |
| Q | Drink tonic |
| R | Escape rope (3s channel) |
| Space | Ride a lift up (escape and sell) |
| Esc | Pause |

## The loop

Enter cave, explore, mine, collect, decide whether to push deeper, escape by lift, sell, upgrade, go deeper.

- Lamp oil is your clock. When it runs out, the dark gets deadly.
- Die and you lose your backpack (the Salvage Pouch upgrade keeps your best items).
- Five layers: Shallow Caves, Stone Hollows, Flooded Caverns, Crystal Depths, The Deep Hollow. Layer seals need a stronger pickaxe. Restoring a lift unlocks that layer as a starting point.
- Deeper runs pay a +10% sell bonus per layer reached.

Progress saves automatically in your browser (localStorage).
