+++
title = "Isometric View"
date = 2026-03-09T17:00:00+11:00
weight = 21
draft = false
slug = "isometric-view"
tags = ["advanced", "optimization", "tutorial"]
next = "/tutorial/world-one/isometric-mouse/"
prev = "/tutorial/world-one/mouse-to-move/"
+++

Tilt your world 45 degrees and you get the iconic look behind Pokémon, Age of Empires, and Diablo. Isometric view makes a flat tile grid feel like a real 3D space. Best of all, it's just two lines of math on top of everything you've already built:

{{< pixidemo title="Isometric View" >}}
const app = new PIXI.Application();
await app.init({ width: 300, height: 240, backgroundColor: 0x1a1a2e });
document.body.appendChild(app.canvas);

const TILE_SIZE = 30;
const OFFSET_X = 150; // center of 300px canvas
const OFFSET_Y = 20;  // vertical margin

const map = [
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,0,1,0,1],  // internal pillar at col 2, row 2
    [1,0,0,0,1],
    [1,1,1,1,1],
];

app.stage.sortableChildren = true;

function isoToScreen(worldX, worldY) {
    return {
        x: (worldX - worldY) + OFFSET_X,
        y: (worldX + worldY) / 2 + OFFSET_Y
    };
}

function makeGroundTile() {
    return new PIXI.Graphics()
        .poly([30, 0, 60, 15, 30, 30, 0, 15])
        .fill(0x3d6b47);
}

function makeWallTile() {
    const WH = 20;
    const g = new PIXI.Graphics();
    g.poly([30, -WH, 60, 15-WH, 30, 30-WH, 0, 15-WH]).fill(0xA07840);
    g.poly([0, 15-WH, 30, 30-WH, 30, 30, 0, 15]).fill(0x5C4020);
    g.poly([30, 30-WH, 60, 15-WH, 60, 15, 30, 30]).fill(0x7A5528);
    return g;
}

for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
        const worldX = col * TILE_SIZE;
        const worldY = row * TILE_SIZE;
        const screen = isoToScreen(worldX, worldY);

        const tile = map[row][col] === 0 ? makeGroundTile() : makeWallTile();
        tile.x = screen.x - TILE_SIZE;      // TILE_SIZE = half of diamond width
        tile.y = screen.y - TILE_SIZE / 2;  // TILE_SIZE/2 = half of diamond height
        tile.zIndex = worldX + worldY;
        app.stage.addChild(tile);
    }
}

const heroSprite = new PIXI.Graphics()
    .poly([8, 0, 16, 4, 8, 8, 0, 4])
    .fill(0xff4444);
app.stage.addChild(heroSprite);

const player = {
    sprite: heroSprite,
    worldX: 45, worldY: 45,
    width: 12, height: 12,
    speed: 2
};

function isSolid(wx, wy) {
    const col = Math.floor(wx / TILE_SIZE);
    const row = Math.floor(wy / TILE_SIZE);
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) return true;
    return map[row][col] !== 0;
}

const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

function gameLoop() {
    let dx = 0, dy = 0;
    if (keys['ArrowRight'] || keys['KeyD']) dx =  player.speed;
    if (keys['ArrowLeft']  || keys['KeyA']) dx = -player.speed;
    if (keys['ArrowDown']  || keys['KeyS']) dy =  player.speed;
    if (keys['ArrowUp']    || keys['KeyW']) dy = -player.speed;

    const newX = player.worldX + dx;
    if (!isSolid(newX + 2, player.worldY + 2) &&
        !isSolid(newX + player.width - 2, player.worldY + 2) &&
        !isSolid(newX + 2, player.worldY + player.height - 2) &&
        !isSolid(newX + player.width - 2, player.worldY + player.height - 2)) {
        player.worldX = newX;
    }

    const newY = player.worldY + dy;
    if (!isSolid(player.worldX + 2, newY + 2) &&
        !isSolid(player.worldX + player.width - 2, newY + 2) &&
        !isSolid(player.worldX + 2, newY + player.height - 2) &&
        !isSolid(player.worldX + player.width - 2, newY + player.height - 2)) {
        player.worldY = newY;
    }

    const screen = isoToScreen(player.worldX, player.worldY);
    player.sprite.x = screen.x - 8;
    player.sprite.y = screen.y - 4;
    player.sprite.zIndex = player.worldX + player.worldY + TILE_SIZE / 2;
}

app.ticker.add(gameLoop);
{{< /pixidemo >}}

Walk north of the pillar - it covers you. Walk south - you cover it. All game logic (movement, collision) runs in the flat world grid. Only the final render step converts to the diamond view.

## THE ISOMETRIC TRICK 🔷

Isometric view is a two-step visual transformation applied to a normal square tile:

1. **Rotate 45 degrees** - the square becomes a diamond
2. **Squash height by half** - the diamond is compressed to a 2:1 width-to-height ratio

```text
Normal tile:     Rotated 45°:     Squashed (2:1):
┌──────┐             /\               /\
│      │            /  \            /    \
│      │            \  /            \    /
└──────┘             \/               \/
  30×30              42×42           60×30
```

The result is the classic isometric tile used in countless games. Every grid square maps to one of these diamonds on screen.

## THE TRANSFORMATION 📐

Two lines convert any world coordinate to its isometric screen position:

```js
const OFFSET_X = 150; // horizontal center of the canvas
const OFFSET_Y = 20;  // vertical margin from top

function isoToScreen(worldX, worldY) {
    return {
        x: (worldX - worldY) + OFFSET_X,
        y: (worldX + worldY) / 2 + OFFSET_Y
    };
}
```

Why does this work? Moving right in the world (increasing `worldX`) shifts the screen position right *and* down - that's the southeast diamond direction. Moving down in the world (increasing `worldY`) shifts the screen position left *and* down - southwest. The diamond grid emerges naturally from the subtraction and addition of those two axes.

For tile at (col, row):

```js
const worldX = col * TILE_SIZE;
const worldY = row * TILE_SIZE;
const screen = isoToScreen(worldX, worldY);
```

## TWO COORDINATE SYSTEMS 🗺️

The most important architectural rule in isometric games: **keep all game logic in world space**.

Collision detection, movement, pathfinding, enemy AI - all of it uses the flat `worldX`/`worldY` grid. The isometric transform only runs at the very end, when positioning sprites for rendering:

```js
function gameLoop() {
    // All logic runs in flat world space - unchanged from every previous tutorial
    resolveCollisions();  // uses worldX, worldY, map[row][col]
    handleInput();        // modifies worldX, worldY

    // Only the final render step converts to isometric screen coords
    const screen = isoToScreen(player.worldX, player.worldY);
    player.sprite.x = screen.x - halfSpriteWidth;
    player.sprite.y = screen.y - halfSpriteHeight;
}
```

Your `isSolid()` function doesn't change at all - it still divides by `TILE_SIZE` to find which grid cell the player is in. The diamond view is purely a visual layer on top.

## DRAWING DIAMOND TILES 💎

`Graphics.poly()` draws any polygon from a flat array of `[x1, y1, x2, y2, ...]` vertices. A flat ground diamond:

```js
// TILE_SIZE = 30: diamond is 60px wide (2 × TILE_SIZE) and 30px tall
function makeGroundTile(color) {
    return new PIXI.Graphics()
        .poly([30, 0,   // top vertex
               60, 15,  // right vertex
               30, 30,  // bottom vertex
               0,  15]) // left vertex
        .fill(color);
}

// Position so diamond center aligns with the screen coords
tile.x = screen.x - TILE_SIZE;      // screen.x - 30 = left edge of bounding box
tile.y = screen.y - TILE_SIZE / 2;  // screen.y - 15 = top edge of bounding box
```

For wall tiles that look like 3D boxes, draw three faces with different shades:

```js
function makeWallTile() {
    const WH = 20; // visual height of the wall in pixels
    const g = new PIXI.Graphics();

    // Top face: diamond shifted up by WH pixels
    g.poly([30, -WH,    60, 15-WH, 30, 30-WH, 0, 15-WH]).fill(0xA07840);
    // Left face: parallelogram going down-left
    g.poly([0,  15-WH,  30, 30-WH, 30, 30,    0, 15   ]).fill(0x5C4020);
    // Right face: parallelogram going down-right
    g.poly([30, 30-WH,  60, 15-WH, 60, 15,    30, 30  ]).fill(0x7A5528);

    return g;
}
```

Three shades of the same color (light top, dark left, medium right) create the 3D illusion.

## DEPTH SORTING ↕️

From tutorial 19 you know the foot-point rule: objects further south render in front. In isometric, the sort key is `worldX + worldY` - objects further along both world axes are closer to the viewer:

```js
app.stage.sortableChildren = true;

// When building tiles - set once
tile.zIndex = worldX + worldY;   // = (col + row) * TILE_SIZE

// In the game loop - update player each frame
player.sprite.zIndex = player.worldX + player.worldY + TILE_SIZE / 2;
// The + TILE_SIZE/2 keeps the player in front of floor tiles at the same depth
```

`worldX + worldY` is proportional to `screenY` (since `screenY = (worldX + worldY) / 2 + offset`) - so this is the same Y-sort from tutorial 19, just expressed in world coordinates.

**What you've built:**

- ✅ Two-line `isoToScreen()` transform applied at render time only
- ✅ World-space game logic: collision and movement code unchanged
- ✅ Diamond tiles drawn with `Graphics.poly()`
- ✅ 3-face wall boxes with light/dark/medium shading
- ✅ Depth sorting using `worldX + worldY`

**Next up**: The mouse clicks in screen space. How do you find which tile it actually hit? [Next: Isometric Mouse](/tutorial/world-one/22-isometric-mouse/)
