+++
title = "More Maps"
date = 2026-03-08T23:00:00+11:00
weight = 3
draft = false
tags = ["beginner", "tiles", "tutorial"]
next = "/tutorial/04-rendering-a-map/"
prev = "/tutorial/02-map-format/"
+++

Now that you know how 2D arrays work, let's explore your options! Different games need different map strategies - choosing the right one can save you hundreds of hours of development time and make your game run like butter. By the end of this chapter, you'll know exactly which approach fits your dream game!

## FRAME-BASED MAPPING: The Simple & Sweet Approach

This is the classic approach used in many indie games! Instead of complex tile objects, each number in your array directly represents a sprite frame or tile type. Super simple and perfect for many game types.

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

**Perfect for:** Retro platformers, puzzle games, simple RPGs  
**Pros:** Lightning fast, easy to understand, great for pixel art  
**Cons:** Hard to add complex tile behaviors later


## SPARSE OBJECT MAPPING: When Less is More

Imagine you're building a platformer where 95% of the level is empty sky, with just a few floating platforms scattered around. Or maybe an open-world RPG with vast empty plains dotted with occasional villages. Storing all that "empty space" in a 2D array is wasteful!

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

**Real-world example:** Think *Super Mario Bros* - mostly empty sky with platforms and enemies at specific positions!

**Perfect for:** Open-world games, infinite runners, space shooters  
**Pros:** Incredibly memory efficient, easy to add/remove objects  
**Cons:** More complex collision detection, harder to visualize the full level

## MODERN DATA FORMATS: Level Up Your Game

As your games grow more complex, you'll want more sophisticated map storage. Modern game developers use JSON files, visual level editors, and even procedural generation!

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

### Visual Level Editors
Modern tools like **Tiled Map Editor** let you paint levels visually and export to any format you need. No more typing arrays by hand!

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

**Perfect for:** Large RPGs, rogue-likes, sandbox games  
**Pros:** Incredibly powerful, professional workflow, infinite possibilities  
**Cons:** More complex to implement, requires additional tools

## WHICH APPROACH SHOULD YOU CHOOSE?

**Starting out?** Stick with 2D arrays and tile objects (like we showed in the previous chapter). They're perfect for learning and most indie games.

**Building a retro platformer?** Frame-based mapping might be perfect for that authentic old-school feel.

**Creating vast open worlds?** Consider sparse object mapping to save memory and improve performance.

**Planning something ambitious?** Modern JSON formats and level editors will scale with your vision.

The best part? You can always start simple and upgrade later! Many successful games began with basic 2D arrays and evolved as they grew.

Ready to see your maps come to life? Let's move on to rendering these data structures as actual game worlds! [Next: Rendering a Map](/tutorial/04-rendering-a-map/)

