+++
title = "Depth"
date = 2026-03-09T15:00:00+11:00
weight = 19
draft = false
slug = "depth"
tags = ["advanced", "optimization", "tutorial"]
next = "/tutorial/world-one/mouse-to-move/"
prev = "/tutorial/world-one/more-scrolling/"
+++

Walk below a pillar and you're in front of it. Walk above and the pillar covers you. That's depth - a 2D trick that makes your top-down world feel solid and three-dimensional. Try it:

{{< pixidemo title="Depth" >}}
const app = new PIXI.Application();
await app.init({ width: 300, height: 240, backgroundColor: 0x5a8a3a });
document.body.appendChild(app.canvas);

const TILE_SIZE = 30;

// 10×8 top-down map. 2 = tall pillar with depth sorting
const map = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,2,0,0,0,2,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,2,0,0,0,2,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1],
];

// sortableChildren tells PixiJS to re-sort by zIndex every frame
const world = new PIXI.Container();
world.sortableChildren = true;
app.stage.addChild(world);

for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
        if (map[row][col] === 1) {
            // Border walls - flat tile, sorted by foot point
            const wall = new PIXI.Graphics().rect(0, 0, TILE_SIZE, TILE_SIZE).fill(0x8B4513);
            wall.x = col * TILE_SIZE;
            wall.y = row * TILE_SIZE;
            wall.zIndex = (row + 1) * TILE_SIZE;
            world.addChild(wall);
        } else if (map[row][col] === 2) {
            // Pillar: 20px wide, 50px tall, extending 20px above its tile row
            const pillar = new PIXI.Graphics()
                .rect(5, -20, 20, 50)   // y=-20 puts top 20px above the tile row
                .fill(0x8B4513);
            pillar.x = col * TILE_SIZE;
            pillar.y = row * TILE_SIZE;
            // Foot point = bottom of tile row - the key to correct depth
            pillar.zIndex = (row + 1) * TILE_SIZE;
            world.addChild(pillar);
        }
    }
}

const heroSprite = new PIXI.Graphics().rect(0, 0, 12, 12).fill(0xff4444);
world.addChild(heroSprite);

const player = {
    sprite: heroSprite,
    x: 120, y: 114,
    width: 12, height: 12,
    speed: 2
};

function isSolid(x, y) {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) return true;
    return map[row][col] !== 0;
}

const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

function gameLoop() {
    let dx = 0, dy = 0;
    if (keys['ArrowLeft']  || keys['KeyA']) dx = -player.speed;
    if (keys['ArrowRight'] || keys['KeyD']) dx =  player.speed;
    if (keys['ArrowUp']    || keys['KeyW']) dy = -player.speed;
    if (keys['ArrowDown']  || keys['KeyS']) dy =  player.speed;

    const newX = player.x + dx;
    if (!isSolid(newX + 2, player.y + 2) &&
        !isSolid(newX + player.width - 2, player.y + 2) &&
        !isSolid(newX + 2, player.y + player.height - 2) &&
        !isSolid(newX + player.width - 2, player.y + player.height - 2)) {
        player.x = newX;
    }

    const newY = player.y + dy;
    if (!isSolid(player.x + 2, newY + 2) &&
        !isSolid(player.x + player.width - 2, newY + 2) &&
        !isSolid(player.x + 2, newY + player.height - 2) &&
        !isSolid(player.x + player.width - 2, newY + player.height - 2)) {
        player.y = newY;
    }

    player.sprite.x = player.x;
    player.sprite.y = player.y;

    // Update depth every frame based on the foot point
    player.sprite.zIndex = player.y + player.height;
}

app.ticker.add(gameLoop);
{{< /pixidemo >}}

## THE ILLUSION 🎭

Top-down games use a simple rule: **things lower on the screen are closer to the viewer**. Imagine looking down at a scene from above. A character further north (higher up on screen) is physically further away, so objects in the south overlap them.

When two objects share the same screen space, the one with the lowest **foot point** (bottom edge) wins - it renders on top because it's "closer" to the camera.

```
         [pillar top]
         [         ]     ← hero here: behind the pillar
[hero]→→→[  pillar ]
         [         ]     ← hero here: in front of the pillar
         [foot]
```

This technique is called **Y-sorting** (or z-sorting, borrowing the depth axis from 3D graphics).

## HOW PIXI SORTS OBJECTS 🖼️

PixiJS draws container children in the order they were added - later additions appear on top. In a static scene this is fine, but a moving player needs its render position to change dynamically.

Two PixiJS features solve this:

- **`zIndex`** - a number on every display object. Higher = drawn in front.
- **`sortableChildren`** - a flag on containers. When `true`, PixiJS re-sorts children by `zIndex` every frame before drawing.

```js
const world = new PIXI.Container();
world.sortableChildren = true; // enable Z-sorting for all children

// Now zIndex controls who's in front
wallTile.zIndex = 90;    // renders behind the player (when player is south of it)
player.sprite.zIndex = 102; // renders in front (player's foot is lower)
```

Enable `sortableChildren` once at setup - PixiJS handles the sorting automatically every frame.

## THE FOOT POINT RULE 👣

Every object needs a consistent sorting key. We use the **foot point** - the y coordinate of the bottom edge. Whoever's feet are lower on screen is drawn on top.

```
footPoint = y + height
```

For a tile in row 2 (TILE_SIZE = 30): `footPoint = (2 + 1) × 30 = 90`
For the player at y=95, height=12: `footPoint = 95 + 12 = 107`

Since 107 > 90, the player renders in front - they're south of the tile, so they're closer.

Tiles get their `zIndex` set once when the map is built. The player's `zIndex` updates every single frame:

```js
// Build map - set tile zIndex once
for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
        if (map[row][col] === 1) {
            const tile = new PIXI.Graphics().rect(0, 0, TILE_SIZE, TILE_SIZE).fill(0x8B4513);
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            tile.zIndex = (row + 1) * TILE_SIZE; // foot of this tile row
            world.addChild(tile);
        }
    }
}

// Game loop - update player zIndex each frame
function gameLoop() {
    // ... movement and collision ...
    player.sprite.zIndex = player.y + player.height; // ← the key line
}
```

## DRAWING TALL OBJECTS 🌲

For the effect to be visible, objects need to extend **above** their foot point. A 30×30 tile that fits perfectly inside its grid cell won't visually overlap a player in the row above - there's nothing to overlap.

Draw the tall portion above the tile's grid position using a negative y offset in the `Graphics` rectangle:

```js
// A pillar: grid position is row × TILE_SIZE, but it extends 20px above that
const pillar = new PIXI.Graphics()
    .rect(5, -20, 20, 50)   // x=5 (centered), y=-20 (above cell), 20px wide × 50px tall
    .fill(0x8B4513);

pillar.x = col * TILE_SIZE;
pillar.y = row * TILE_SIZE;          // grid position (the foot row)
pillar.zIndex = (row + 1) * TILE_SIZE; // foot point at bottom of tile
world.addChild(pillar);
```

The collision box still covers the tile grid (player can't walk through it), but the visual stretches up. When the player walks just north of the pillar, the pillar's upper half overlaps the player's sprite - the depth effect clicks into place.

## WHAT ABOUT GROUND TILES? 🌿

Ground tiles (grass, floor, dirt) should always render behind everything. Set them to `zIndex = 0`, or skip adding them as sprites entirely and use the canvas background color instead:

```js
// Option A: set zIndex = 0 for ground tiles
groundTile.zIndex = 0;

// Option B: just set the background color in app.init and skip drawing ground tiles
await app.init({ canvas, width: 300, height: 240, backgroundColor: 0x5a8a3a });
```

Option B is simpler and slightly faster - fewer sprites, same visual result.

**What you've built:**

- ✅ Y-sort depth using PixiJS `zIndex` and `sortableChildren = true`
- ✅ Foot-point rule for consistent render ordering
- ✅ Tall objects that extend above their grid cell for visible depth
- ✅ Per-frame player `zIndex` update for smooth depth transitions

**Next up**: Point and click to move! [Next: Mouse to Move](/tutorial/world-one/20-mouse-to-move/)
