+++
title = "Isometric Scroll"
date = 2026-03-09T19:00:00+11:00
weight = 23
draft = false
tags = ["advanced", "optimization", "tutorial"]
next = "/tutorial/24-rotate-hero/"
prev = "/tutorial/22-isometric-mouse/"
+++

A 5×5 isometric map is a proof of concept. A real game needs room to breathe. Combine the World Container from the scrolling tutorials with the isometric transform and you get a large diamond world that follows the player:

<div id="isoScrollDemo" style="text-align: center; margin: 20px 0;">
    <canvas id="isoScrollCanvas" width="300" height="240" style="border: 2px solid #333; background: #1a1a2e;"></canvas>
    <div style="margin-top: 10px;">
        <strong>Controls:</strong> Arrow Keys or WASD<br>
        <strong>Notice:</strong> The camera follows the player — explore the full 8×8 world
    </div>
</div>

<script type="module">
import { Application, Graphics, Container } from 'https://unpkg.com/pixi.js@8.0.0/dist/pixi.min.mjs';

const canvas = document.getElementById('isoScrollCanvas');
const app = new Application();
await app.init({ canvas, width: 300, height: 240, backgroundColor: 0x1a1a2e });

const TILE_SIZE = 30;
const SCREEN_W = 300;
const SCREEN_H = 240;
const SMOOTH = 0.1;

// 8×8 map - wider than the 300px viewport in iso space
const map = [
    [1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,1],
    [1,0,0,1,0,0,0,1],
    [1,0,0,0,0,1,0,1],
    [1,0,1,0,0,0,0,1],
    [1,0,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1],
];

// World Container - no static OFFSET, the container position handles centering
const world = new Container();
world.sortableChildren = true;
app.stage.addChild(world);

// No OFFSET_X/OFFSET_Y here - the container handles all positioning
function isoToScreen(worldX, worldY) {
    return {
        x: worldX - worldY,
        y: (worldX + worldY) / 2
    };
}

function makeGroundTile() {
    return new Graphics()
        .poly([30, 0, 60, 15, 30, 30, 0, 15])
        .fill(0x3d6b47);
}

function makeWallTile() {
    const WH = 20;
    const g = new Graphics();
    g.poly([30, -WH, 60, 15 - WH, 30, 30 - WH, 0, 15 - WH]).fill(0xA07840);
    g.poly([0, 15 - WH, 30, 30 - WH, 30, 30, 0, 15]).fill(0x5C4020);
    g.poly([30, 30 - WH, 60, 15 - WH, 60, 15, 30, 30]).fill(0x7A5528);
    return g;
}

for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
        const worldX = col * TILE_SIZE;
        const worldY = row * TILE_SIZE;
        const screen = isoToScreen(worldX, worldY);
        const tile = map[row][col] === 0 ? makeGroundTile() : makeWallTile();
        tile.x = screen.x - TILE_SIZE;
        tile.y = screen.y - TILE_SIZE / 2;
        tile.zIndex = worldX + worldY;
        world.addChild(tile);
    }
}

const heroSprite = new Graphics()
    .poly([8, 0, 16, 4, 8, 8, 0, 4])
    .fill(0xff4444);
world.addChild(heroSprite);

const player = {
    sprite: heroSprite,
    worldX: 45, worldY: 45,
    width: 12, height: 12,
    speed: 2
};

// Initialise camera at player's starting iso position
const startScreen = isoToScreen(player.worldX, player.worldY);
let camX = startScreen.x;
let camY = startScreen.y;

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

    // Render player inside the world container (no offset - container handles that)
    const screen = isoToScreen(player.worldX, player.worldY);
    player.sprite.x = screen.x - 8;
    player.sprite.y = screen.y - 4;
    player.sprite.zIndex = player.worldX + player.worldY + TILE_SIZE / 2;

    // Smooth camera: ease toward the player's iso screen position
    camX += (screen.x - camX) * SMOOTH;
    camY += (screen.y - camY) * SMOOTH;

    // Shift the container so the camera target stays centred on screen
    world.x = Math.round(SCREEN_W / 2 - camX);
    world.y = Math.round(SCREEN_H / 2 - camY);
}

app.ticker.add(gameLoop);
</script>

Notice the diamond shape visible against the dark background at the edges. That's the one catch with isometric scroll — the viewport is rectangular but the world is diamond-shaped.

## WORLD CONTAINER IN ISO 🌍

The World Container pattern from tutorials 17–18 carries over directly. The only change from tutorials 21–22 is dropping the static `OFFSET_X`/`OFFSET_Y` — the container's own position handles the centering instead:

```js
// Tutorials 21 & 22: static offset baked into isoToScreen()
function isoToScreen(worldX, worldY) {
    return {
        x: (worldX - worldY) + OFFSET_X,  // ← fixed center baked in
        y: (worldX + worldY) / 2 + OFFSET_Y
    };
}

// Tutorial 23: no static offset - the container moves instead
function isoToScreen(worldX, worldY) {
    return {
        x: worldX - worldY,               // ← raw iso coords only
        y: (worldX + worldY) / 2
    };
}
```

Build the whole isometric world inside a `Container`. Every tile and the player sprite use the offset-free `isoToScreen()`. The container shifts the entire scene each frame:

```js
const world = new Container();
world.sortableChildren = true;
app.stage.addChild(world);
```

## THE CAMERA TARGET 📷

The camera tracks the player's **isometric screen position** inside the container — not their world coordinates. Convert `worldX`/`worldY` to iso coords first, then smooth-follow that:

```js
// Initialise camera at the player's starting position
const startScreen = isoToScreen(player.worldX, player.worldY);
let camX = startScreen.x;
let camY = startScreen.y;

const SMOOTH = 0.1;

function gameLoop() {
    // ... movement and collision in world space ...

    // Player's iso position inside the container
    const screen = isoToScreen(player.worldX, player.worldY);
    player.sprite.x = screen.x - halfSpriteW;
    player.sprite.y = screen.y - halfSpriteH;

    // Ease the camera toward the player's iso position
    camX += (screen.x - camX) * SMOOTH;
    camY += (screen.y - camY) * SMOOTH;

    // Shift the container to keep the camera target centred on screen
    world.x = Math.round(SCREEN_W / 2 - camX);
    world.y = Math.round(SCREEN_H / 2 - camY);
}
```

This is identical to the `updateCamera()` from tutorial 17 — just targeting `screen.x`/`screen.y` from the iso transform instead of `player.x`/`player.y` directly.

## THE DIAMOND SHAPE PROBLEM 🔷

Here is the one genuine challenge with isometric scroll: the map is diamond-shaped, but the viewport is rectangular. The background shows through the corners as the player moves:

```text
┌────────────────────────┐
│      [background]      │
│        /‾‾‾‾‾‾‾\       │
│       /  tiles  \      │
│      /   world   \     │
│      \           /     │
│       \         /      │
│        \_______/       │
│      [background]      │
└────────────────────────┘
```

Three approaches, in order of complexity:

**Option 1 — Embrace the diamond.** Use a dark or thematic background colour. The diamond edges look intentional. Works great for space games, cave maps, or any dark-aesthetic game. This is what the demo above does.

**Option 2 — Extra border tiles.** Extend the map with enough extra rows and columns so the diamond fully covers the rectangle at all camera positions. Simple, but you're building and sorting tiles the player will never see.

**Option 3 — Clip with a PixiJS mask.** Create a rectangle Graphics object and assign it as `world.mask`. PixiJS only renders what's inside the mask — the diamond corners vanish cleanly:

```js
const viewMask = new Graphics()
    .rect(0, 0, SCREEN_W, SCREEN_H)
    .fill(0xffffff);
app.stage.addChild(viewMask);
world.mask = viewMask; // container only renders within this rectangle
```

The mask moves with the canvas (not the world container), so it stays fixed at the viewport bounds regardless of camera movement. This is the cleanest solution for a polished shipped game.

## DEPTH SORTING IN A CONTAINER ↕️

`sortableChildren` belongs on the container, not the stage. All depth relationships between tiles and the player stay correct as the camera scrolls:

```js
const world = new Container();
world.sortableChildren = true;  // ← on the container

// Tiles - set once when building the map
tile.zIndex = worldX + worldY;

// Player - updated every frame
player.sprite.zIndex = player.worldX + player.worldY + TILE_SIZE / 2;
```

The `+ TILE_SIZE / 2` offset ensures the player always renders in front of the floor tile they're standing on, even when their `worldX + worldY` value equals a tile's exactly.

**What you've built:**

- ✅ Isometric world in a World Container — raw iso coords, container handles the centering
- ✅ Camera target derived from the player's iso screen position, not world position
- ✅ Smooth camera easing identical to the orthographic scrolling tutorials
- ✅ Three options for the diamond viewport problem: embrace it, fill it, or mask it

**Next up**: Give your hero a sense of direction. [Next: Rotate Hero](/tutorial/24-rotate-hero/)
