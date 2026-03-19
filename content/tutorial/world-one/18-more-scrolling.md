+++
title = "More Scrolling"
date = 2026-03-09T14:00:00+11:00
weight = 18
draft = false
slug = "more-scrolling"
tags = ["advanced", "optimization", "tutorial"]
next = "/tutorial/world-one/depth/"
prev = "/tutorial/world-one/scrolling/"
+++

The camera from the previous tutorial has one flaw: walk to the edge of the map and the camera keeps going, revealing the empty void beyond. Every great platformer stops scrolling at the map boundary so the world feels solid and complete. Let's fix it!

{{< pixidemo title="More Scrolling" >}}
const app = new PIXI.Application();
await app.init({ width: 300, height: 240, backgroundColor: 0x87CEEB });
document.body.appendChild(app.canvas);

const TILE_SIZE = 30;
const SCREEN_W = 300;
const SCREEN_H = 240;
const GRAVITY = 0.6;

// Map is 20×14 tiles (600×420px) - larger than the 300×240 viewport in both axes
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1],
    [1,0,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1],
    [1,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const MAP_COLS = map[0].length;
const MAP_ROWS = map.length;
const MAP_W = MAP_COLS * TILE_SIZE; // 600px
const MAP_H = MAP_ROWS * TILE_SIZE; // 420px

const world = new PIXI.Container();
app.stage.addChild(world);

for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
        if (map[row][col] === 1) {
            const tile = new PIXI.Graphics().rect(0, 0, TILE_SIZE, TILE_SIZE).fill(0x8B4513);
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            world.addChild(tile);
        }
    }
}

const heroSprite = new PIXI.Graphics().rect(0, 0, 12, 12).fill(0xff4444);
world.addChild(heroSprite);

const player = {
    sprite: heroSprite,
    x: 60, y: 330,
    width: 12, height: 12,
    velocityX: 0, velocityY: 0,
    speed: 2, jumpPower: -10,
    onGround: false
};

let camX = 0;
let camY = player.y + player.height / 2 - SCREEN_H / 2;
const SMOOTH = 0.12;

function updateCamera() {
    const targetX = player.x + player.width / 2 - SCREEN_W / 2;
    const targetY = player.y + player.height / 2 - SCREEN_H / 2;

    camX += (targetX - camX) * SMOOTH;
    camY += (targetY - camY) * SMOOTH;

    // Clamp: don't scroll past the map edges
    camX = Math.max(0, Math.min(camX, MAP_W - SCREEN_W));
    camY = Math.max(0, Math.min(camY, MAP_H - SCREEN_H));

    world.x = -Math.round(camX);
    world.y = -Math.round(camY);
}

function isSolid(x, y) {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) return true;
    return map[row][col] === 1;
}

const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

function gameLoop() {
    if (keys['ArrowLeft'])  player.velocityX = -player.speed;
    else if (keys['ArrowRight']) player.velocityX = player.speed;
    else player.velocityX = 0;

    if ((keys['Space'] || keys['ArrowUp']) && player.onGround) {
        player.velocityY = player.jumpPower;
        player.onGround = false;
    }

    player.velocityY += GRAVITY;

    const newX = player.x + player.velocityX;
    if (!isSolid(newX, player.y + 2) && !isSolid(newX, player.y + player.height - 2) &&
        !isSolid(newX + player.width, player.y + 2) && !isSolid(newX + player.width, player.y + player.height - 2)) {
        player.x = newX;
    }

    if (player.velocityY > 0) {
        if (isSolid(player.x + 2, player.y + player.height + player.velocityY) ||
            isSolid(player.x + player.width - 2, player.y + player.height + player.velocityY)) {
            player.y = Math.floor((player.y + player.height) / TILE_SIZE) * TILE_SIZE - player.height;
            player.velocityY = 0;
            player.onGround = true;
        } else {
            player.y += player.velocityY;
            player.onGround = false;
        }
    } else if (player.velocityY < 0) {
        if (isSolid(player.x + 2, player.y + player.velocityY) ||
            isSolid(player.x + player.width - 2, player.y + player.velocityY)) {
            player.y = Math.ceil(player.y / TILE_SIZE) * TILE_SIZE;
            player.velocityY = 0;
        } else {
            player.y += player.velocityY;
        }
    }

    player.sprite.x = player.x;
    player.sprite.y = player.y;
    updateCamera();
}

// Start camera near the player's initial position
camX = 0;
camY = Math.max(0, Math.min(player.y + player.height / 2 - SCREEN_H / 2, MAP_H - SCREEN_H));

app.ticker.add(gameLoop);
{{< /pixidemo >}}

Walk to a corner of the map - the camera stops cleanly at the edge and the hero keeps moving. That's the `clamp`. Two lines added to `updateCamera()` and the void disappears.

## HOW FAR IS TOO FAR? 📐

The camera position tells us where the top-left corner of the viewport sits in world space. The camera should never go negative (that would show left of the map) and it should never go so far right that the right edge of the viewport extends beyond the map.

Picture it: if the map is 600px wide and the viewport is 300px wide, the camera's maximum x position is `600 - 300 = 300`. Any further right and you'd be showing 300px of map followed by 300px of nothing.

```text
camera min = 0
camera max = (map width in pixels) - (screen width in pixels)
```

The same logic applies vertically.

## CLAMPING THE CAMERA 🗜️

Add two lines to `updateCamera()` after the smoothing, before you apply the position:

```js
let camX = 0;
let camY = 0;
const SMOOTH = 0.12;

// Store map dimensions in pixels for easy reuse
const MAP_W = map[0].length * game.tileSize; // e.g. 20 tiles × 30px = 600px
const MAP_H = map.length    * game.tileSize; // e.g. 14 tiles × 30px = 420px

function updateCamera() {
    const targetX = player.x + player.width  / 2 - SCREEN_W / 2;
    const targetY = player.y + player.height / 2 - SCREEN_H / 2;

    camX += (targetX - camX) * SMOOTH;
    camY += (targetY - camY) * SMOOTH;

    // Clamp: never show outside the map
    camX = Math.max(0, Math.min(camX, MAP_W - SCREEN_W));
    camY = Math.max(0, Math.min(camY, MAP_H - SCREEN_H));

    world.x = -Math.round(camX);
    world.y = -Math.round(camY);
}
```

`Math.max(0, ...)` prevents the camera going too far left or up. `Math.min(..., MAP_W - SCREEN_W)` prevents it going too far right or down. Together they lock the viewport inside the map at all times.

## STARTING NEAR THE EDGE 🏁

There's one more edge case (pun intended): what if the hero starts near a corner of the map? If the map is only 8 tiles wide and the hero starts at tile 1, the camera would want to center on the hero - but that would put the left side of the viewport outside the map.

The clamp already handles this automatically! Just initialize `camX` and `camY` using the same formula you use every frame, and `Math.max/min` will catch it:

```js
// Initialize camera before the first frame
// The clamp will handle edge cases automatically
camX = Math.max(0, Math.min(
    player.x + player.width  / 2 - SCREEN_W / 2,
    MAP_W - SCREEN_W
));
camY = Math.max(0, Math.min(
    player.y + player.height / 2 - SCREEN_H / 2,
    MAP_H - SCREEN_H
));
```

This ensures the very first frame renders correctly, with no jump or pop as the camera corrects itself.

## ONE-AXIS SCROLLING 🔁

Some games only scroll horizontally (classic side-scrollers like the original Mario), others only vertically. You can easily restrict the camera to one axis:

```js
function updateCamera() {
    // Horizontal scroll only - vertical is fixed
    const targetX = player.x + player.width / 2 - SCREEN_W / 2;
    camX += (targetX - camX) * SMOOTH;
    camX = Math.max(0, Math.min(camX, MAP_W - SCREEN_W));

    world.x = -Math.round(camX);
    world.y = 0; // Vertical position never changes
}
```

Or lock the horizontal axis for a vertical-only scroller:

```js
function updateCamera() {
    const targetY = player.y + player.height / 2 - SCREEN_H / 2;
    camY += (targetY - camY) * SMOOTH;
    camY = Math.max(0, Math.min(camY, MAP_H - SCREEN_H));

    world.x = 0; // Horizontal position never changes
    world.y = -Math.round(camY);
}
```

That's the complete scrolling system! The full `updateCamera` function is only about 8 lines, but it handles worlds of any size, smooth following, and clean edge behavior.

**What you've built:**

- ✅ World Container that decouples game logic from camera position
- ✅ Smooth camera easing that follows the player
- ✅ Clamped edges - no more void beyond the map
- ✅ Correct initial camera position even when the hero starts near an edge
- ✅ Single-axis scrolling for classic-style games

**Next up**: Your world has depth - now let's render it that way. [Next: Depth](/tutorial/world-one/19-depth/)
