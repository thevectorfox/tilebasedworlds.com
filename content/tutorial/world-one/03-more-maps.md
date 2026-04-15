+++
title = "More Maps"
date = 2026-03-08T23:00:00+11:00
weight = 3
draft = false
slug = "more-maps"
tags = ["beginner", "tiles", "tutorial"]
next = "/tutorial/world-one/rendering-a-map/"
prev = "/tutorial/world-one/map-format/"
+++

2D arrays work well for most tile-based games, but the format has trade-offs. Different game structures call for different storage strategies — this section covers the main options and when each makes sense.

## Frame-based mapping

Each number in the array directly represents a sprite frame or tile type. No separate type definitions required — the number *is* the tile identity.

```js
// Each number = a different tile graphic
const levelMap = [
  [5, 5, 5, 5, 5],  // Stone walls  
  [5, 1, 2, 3, 5],  // Floor, grass, water, sand
  [5, 5, 5, 5, 5]   // Stone walls
];

// Define tile ranges for collision
const TileRanges = {
  walkable: [1, 2, 3],      // Frames 1-3 are walkable
  walls: [5],               // Frame 5 blocks movement
  water: [2],               // Frame 2 is water (maybe slows player?)
  damage: [10, 11, 12]      // Frames 10-12 hurt the player
};
```

**Good for:** Retro platformers, puzzle games, simple RPGs  
**Trade-off:** Fast to implement and reason about; harder to attach complex behaviour to individual tile types later.


## Sparse object mapping

If most of a level is the same background tile — open sky, ocean, empty plains — a full 2D array spends most of its memory on identical values. Sparse mapping stores only the non-default objects:

```js
// Instead of a massive array full of zeros...
// Store only the interesting stuff!
const levelObjects = [
  { x: 23, y: 6, type: 'platform' },
  { x: 45, y: 12, type: 'enemy', subtype: 'goomba' },
  { x: 67, y: 8, type: 'powerup', subtype: 'fireFlower' },
  { x: 89, y: 15, type: 'checkpoint' }
];

// Default background everywhere else
const defaultTile = 'sky'; // or 'grass', 'water', etc.
```

*Super Mario Bros* works this way — mostly empty sky, with platforms and enemies stored as positioned objects.

**Good for:** Open-world games, infinite runners, space shooters  
**Trade-off:** Memory-efficient and easy to add or remove objects; collision detection is more involved because there's no grid to index into.

## Structured data formats

As levels get more complex, plain 2D arrays become harder to manage. JSON files, visual editors, and procedural generation are the common next steps.

### JSON Map Files
Perfect for complex RPGs or adventure games:

```js
// level1.json - Clean, readable, easy to edit
{
  "name": "Forest Temple",
  "width": 20,
  "height": 15,
  "backgroundMusic": "temple_theme.ogg",
  "tiles": [
    [1, 1, 1, 1, 1],
    [1, 0, 2, 0, 1],
    [1, 1, 1, 1, 1]
  ],
  "entities": [
    { "x": 64, "y": 96, "type": "chest", "contains": "goldKey" },
    { "x": 128, "y": 96, "type": "npc", "dialogue": "Welcome, brave adventurer!" }
  ]
}
```

### Visual level editors
Tools like **Tiled Map Editor** let you paint levels visually and export to any format you need.

### Procedural Generation
```js
// Generate infinite worlds on the fly!
function generateChunk(chunkX, chunkY) {
  const chunk = [];
  for (let y = 0; y < 16; y++) {
    chunk[y] = [];
    for (let x = 0; x < 16; x++) {
      // Use noise functions for natural terrain
      chunk[y][x] = getTerrainType(chunkX * 16 + x, chunkY * 16 + y);
    }
  }
  return chunk;
}
```

**Good for:** Large RPGs, rogue-likes, sandbox games  
**Trade-off:** Scales to large, complex levels and integrates with visual editors; more infrastructure to set up.

## Choosing an approach

Start with 2D arrays — they cover most indie game structures and are easy to reason about. If you find yourself storing large maps where most tiles are identical, sparse mapping is worth considering. If levels become complex enough to justify tooling, JSON export from a visual editor like Tiled is the natural next step.

These formats aren't mutually exclusive; many games use a JSON file to store the 2D tile grid alongside a separate list of entity positions.

[Next: Rendering a Map](/tutorial/world-one/04-rendering-a-map/)

