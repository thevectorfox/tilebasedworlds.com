+++
title = "Scrolling"
date = 2026-03-09T13:00:00+11:00
weight = 11
draft = false
slug = "scrolling"
tags = ["advanced", "optimization", "tutorial"]
next = "/tutorial/world-one/more-scrolling/"
prev = "/tutorial/world-one/pushing-tiles/"
+++

Your world is bigger than one screen. Scrolling is how you show it - it's the technique behind every side-scroller ever made, from the original Super Mario Bros to Hollow Knight. The camera follows the hero, and the whole world slides past. Let's build it!

{{< pixidemo title="Scrolling" >}}
const app = new PIXI.Application();
await app.init({ width: 300, height: 240, backgroundColor: 0x87CEEB });
document.body.appendChild(app.canvas);

const TILE_SIZE = 30;
const SCREEN_W = 300;
const SCREEN_H = 240;
const GRAVITY = 0.6;

// Map is 20 tiles wide × 8 tall (600×240px) - twice the viewport width
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1],
    [1,0,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// All game objects live inside the world container
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
    x: 60, y: 198,
    width: 12, height: 12,
    velocityX: 0, velocityY: 0,
    speed: 2, jumpPower: -10,
    onGround: false
};

// Smooth camera (lerp toward target)
let camX = 0;
const SMOOTH = 0.12;

function updateCamera() {
    const targetX = player.x + player.width / 2 - SCREEN_W / 2;
    camX += (targetX - camX) * SMOOTH;
    world.x = -Math.round(camX);
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
            player.y = Math.floor((player.y + player.height + player.velocityY) / TILE_SIZE) * TILE_SIZE - player.height;
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

app.ticker.add(gameLoop);
{{< /pixidemo >}}

Notice that the hero stays near the center of the screen while the world slides around them. That's the illusion of scrolling - the hero isn't really moving on screen, the world is.

## THE THEORY 🎥

Without scrolling, the hero moves across the screen and eventually hits the edge. With scrolling, you keep the hero roughly centered and shift *everything else* in the opposite direction.

In PixiJS, the cleanest way to do this is a **world Container**. Put every tile, enemy, and sprite inside it. Then move the container itself. From the player's point of view, nothing changes - their coordinates are still world-space pixels. The container offset is purely a visual trick.

```
screen position = world position - camera position
```

When the hero is at world x=450, and the camera is at x=300, the hero appears at screen x=150 (center of a 300px wide screen). The container shifts left by 300px and everything inside appears shifted left by that amount.

## SETTING UP THE WORLD CONTAINER 🌍

The only structural change from earlier tutorials: instead of adding tiles directly to `app.stage`, add them to a `Container` called `world`. The stage itself stays empty except for UI elements like a score display.

```js
import { Application, Graphics, Container } from 'https://unpkg.com/pixi.js@8.0.0/dist/pixi.min.mjs';

const world = new PIXI.Container();
app.stage.addChild(world);

// All game objects go into world, NOT app.stage
function buildMap() {
    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
            if (map[row][col] === 1) {
                const tile = new PIXI.Graphics()
                    .rect(0, 0, game.tileSize, game.tileSize)
                    .fill(0x8B4513);
                tile.x = col * game.tileSize;
                tile.y = row * game.tileSize;
                world.addChild(tile); // ← world, not app.stage
            }
        }
    }
}

// UI elements (score, health bar) go on the stage directly
// so they don't scroll with the world
const scoreText = new Text({ text: 'Score: 0', style: scoreStyle });
app.stage.addChild(scoreText); // ← stage, so it stays fixed
```

Your collision detection (`isSolid`) doesn't change at all - it still uses the player's world coordinates to check the map array. The camera offset is invisible to the game logic.

## THE CAMERA 📷

The camera is just two numbers: `camX` and `camY`. You set `world.x = -camX` and `world.y = -camY` each frame to shift everything into view.

**Simple version** - snaps instantly to the player:

```js
function updateCamera() {
    // Center the viewport on the player
    const camX = player.x + player.width / 2 - SCREEN_W / 2;
    const camY = player.y + player.height / 2 - SCREEN_H / 2;

    world.x = -camX;
    world.y = -camY;
}
```

**Smooth version** - eases toward the player position for that polished feel:

```js
let camX = 0;
let camY = 0;
const CAMERA_SMOOTH = 0.12; // 0 = never moves, 1 = instant snap

function updateCamera() {
    const targetX = player.x + player.width / 2 - SCREEN_W / 2;
    const targetY = player.y + player.height / 2 - SCREEN_H / 2;

    // Move a fraction of the remaining distance each frame
    camX += (targetX - camX) * CAMERA_SMOOTH;
    camY += (targetY - camY) * CAMERA_SMOOTH;

    // Round to whole pixels to prevent blurry sub-pixel rendering
    world.x = -Math.round(camX);
    world.y = -Math.round(camY);
}
```

This easing makes the camera feel like it has weight - it chases the player but slightly lags behind, which looks professional. Try values between `0.08` (floaty) and `0.2` (snappy).

Call `updateCamera()` at the end of your game loop, after all positions are updated:

```js
function gameLoop() {
    handleInput();
    applyPhysics();
    resolveCollisions();
    updateCamera(); // ← always last
}
```

## LARGE MAPS: TILE RECYCLING ♻️

For most games - maps up to around 100×100 tiles - just render all tiles into the world container. PixiJS automatically skips drawing anything outside the viewport, so performance is not a problem.

For truly massive maps (thousands of tiles), you can recycle tile sprites as they scroll off-screen: take the column of tiles that just left the left edge and move those same sprites to the right edge, updating their appearance to match the new map data. This keeps the sprite count constant no matter how large the map is.

The pattern works like this:

```js
// Only create sprites for the visible window + 1 tile buffer on each edge
const VISIBLE_COLS = Math.ceil(SCREEN_W / TILE_SIZE) + 2; // e.g. 12
const VISIBLE_ROWS = Math.ceil(SCREEN_H / TILE_SIZE) + 2;

// When the camera moves right by one full tile:
function recycleColumn(oldCol, newCol) {
    for (let row = firstVisibleRow; row <= lastVisibleRow; row++) {
        const sprite = tileSprites.get(`${oldCol}_${row}`);

        // Move sprite to new map position
        sprite.x = newCol * TILE_SIZE;
        sprite.y = row * TILE_SIZE;

        // Update sprite appearance for new tile type
        const tileType = map[row][newCol];
        updateTileSprite(sprite, tileType);

        // Re-key in the tracking map
        tileSprites.delete(`${oldCol}_${row}`);
        tileSprites.set(`${newCol}_${row}`, sprite);
    }
}
```

**When do you need this?** If you can't feel your game stuttering, you don't need it. Premature optimization is the root of all evil - start with the simple container approach, and only add recycling if you hit a real performance problem.

**Next up**: The camera works, but walk to the edge of the map and you'll see the problem. [Next: More Scrolling](/tutorial/world-one/18-more-scrolling/)
