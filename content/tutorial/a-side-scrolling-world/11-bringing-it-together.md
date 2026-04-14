+++
title = "Bringing it Together"
date = 2026-04-12T00:00:00+11:00
weight = 11
draft = false
slug = "bringing-it-together"
tags = ["intermediate", "tutorial"]
prev = "/tutorial/a-side-scrolling-world/more-scrolling/"
next = "/tutorial/a-side-scrolling-world/going-further/"
+++

Each tutorial in this series introduced one mechanic in isolation. Here they run together: gravity, cloud platforms, moving tiles, enemies with edge detection, projectiles, and a scrolling camera. The goal is not a polished game — it's a working skeleton that demonstrates how the systems compose without fighting each other.

{{< pixidemo title="Bringing it Together" >}}
const app = new PIXI.Application();
await app.init({ width: 300, height: 240, backgroundColor: 0x87CEEB });
document.body.appendChild(app.canvas);

// ─── Constants ────────────────────────────────────────────────────────────────
const TILE  = { EMPTY: 0, SOLID: 1, CLOUD: 2 };
const TS    = 30;         // tile size
const SW    = 300;        // screen width
const SH    = 240;        // screen height
const GRAV  = 0.6;
const SMOOTH = 0.12;

// ─── Map (20×8 tiles, 600×240px) ─────────────────────────────────────────────
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,2,2,0,0,0,0,2,2,0,0,0,0,2,2,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
    [1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];
const MAP_COLS = map[0].length;
const MAP_ROWS = map.length;
const MAP_W    = MAP_COLS * TS;
const MAP_H    = MAP_ROWS * TS;

// ─── World container (everything scrollable goes here) ────────────────────────
const world = new PIXI.Container();
app.stage.addChild(world);

// ─── Build static tiles ───────────────────────────────────────────────────────
for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
        const t = map[row][col];
        if (t === TILE.SOLID) {
            const g = new PIXI.Graphics().rect(0, 0, TS, TS).fill(0x8B4513);
            g.x = col * TS; g.y = row * TS;
            world.addChild(g);
        } else if (t === TILE.CLOUD) {
            const g = new PIXI.Graphics().rect(0, 0, TS, 8).fill(0xFFFFFF);
            g.x = col * TS; g.y = row * TS;
            world.addChild(g);
        }
    }
}

// ─── Tile helpers ─────────────────────────────────────────────────────────────
function tileAt(px, py) {
    const col = Math.floor(px / TS);
    const row = Math.floor(py / TS);
    if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) return TILE.SOLID;
    return map[row][col];
}
function isSolid(px, py)  { return tileAt(px, py) === TILE.SOLID; }
function isCloud(px, py)  { return tileAt(px, py) === TILE.CLOUD; }

// ─── Moving platforms ─────────────────────────────────────────────────────────
// Each entry: { x, y, width, height, speed, dirX, dirY, minX, maxX, minY, maxY }
const platforms = [];

function buildPlatforms() {
    const defs = [
        // Horizontal platform near left side
        { startCol: 3, startRow: 5, dirX:  1, dirY: 0, rangeX: 4, rangeY: 0 },
        // Vertical platform in the middle
        { startCol: 10, startRow: 2, dirX: 0, dirY:  1, rangeX: 0, rangeY: 3 },
    ];
    for (const d of defs) {
        const sprite = new PIXI.Graphics()
            .rect(0, 0, TS, TS / 2)
            .fill(0x44BB44);
        const p = {
            sprite,
            x: d.startCol * TS,
            y: d.startRow * TS,
            width:  TS,
            height: TS / 2,
            speed: 1,
            dirX: d.dirX,
            dirY: d.dirY,
            minX: d.startCol * TS,
            maxX: (d.startCol + d.rangeX) * TS,
            minY: d.startRow * TS,
            maxY: (d.startRow + d.rangeY) * TS,
        };
        sprite.x = p.x; sprite.y = p.y;
        world.addChild(sprite);
        platforms.push(p);
    }
}

// ─── Player ───────────────────────────────────────────────────────────────────
const heroSprite = new PIXI.Graphics().rect(0, 0, 12, 12).fill(0xff4444);
world.addChild(heroSprite);

const player = {
    sprite: heroSprite,
    x: 45, y: 178,
    width: 12, height: 12,
    velocityX: 0, velocityY: 0,
    speed: 2, jumpPower: -10,
    onGround: false,
    onPlatform: null,
    lastY: 178,
    lastDir: 1,   // 1 = right, -1 = left (for shooting direction)
    lastShot: 0,
    shootCooldown: 400
};

// ─── Enemies ──────────────────────────────────────────────────────────────────
const enemies = [];

function spawnEnemies() {
    const spawns = [
        { tileX: 14, tileY: 3 },
        { tileX: 17, tileY: 3 },
        { tileX:  5, tileY: 6 },
    ];
    for (const s of spawns) {
        const sprite = new PIXI.Graphics().rect(0, 0, 10, 10).fill(0x8A2BE2);
        const e = {
            sprite,
            x: s.tileX * TS + (TS - 10) / 2,
            y: s.tileY * TS + (TS - 10),
            width: 10, height: 10,
            dirX: 1, speed: 0.8,
        };
        sprite.x = e.x; sprite.y = e.y;
        world.addChild(sprite);
        enemies.push(e);
    }
}

// ─── Bullets ──────────────────────────────────────────────────────────────────
const bullets = [];

function fireBullet() {
    const now = Date.now();
    if (now - player.lastShot < player.shootCooldown) return;
    if (bullets.length >= 4) return;
    player.lastShot = now;

    const sprite = new PIXI.Graphics().rect(0, 0, 5, 3).fill(0xFFFF00);
    const b = {
        sprite,
        x: player.x + (player.lastDir > 0 ? player.width : -5),
        y: player.y + player.height / 2 - 1,
        width: 5, height: 3,
        velocityX: player.lastDir * 5,
    };
    sprite.x = b.x; sprite.y = b.y;
    world.addChild(sprite);
    bullets.push(b);
}

// ─── Input ────────────────────────────────────────────────────────────────────
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (['Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code))
        e.preventDefault();
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

// ─── Camera ───────────────────────────────────────────────────────────────────
let camX = 0;

function updateCamera() {
    const targetX = player.x + player.width / 2 - SW / 2;
    camX += (targetX - camX) * SMOOTH;
    camX = Math.max(0, Math.min(camX, MAP_W - SW));
    world.x = -Math.round(camX);
}

// ─── Moving platform helpers ──────────────────────────────────────────────────
function checkLandOnPlatform(dy) {
    for (const p of platforms) {
        if (player.lastY + player.height > p.y) continue;
        const nextBottom = player.y + player.height + dy;
        if (nextBottom >= p.y && nextBottom <= p.y + p.height) {
            if (player.x + player.width > p.x && player.x < p.x + p.width) {
                return p;
            }
        }
    }
    return null;
}

function updatePlatforms() {
    for (const p of platforms) {
        const nx = p.x + p.speed * p.dirX;
        const ny = p.y + p.speed * p.dirY;

        if (p.dirX !== 0 && (nx <= p.minX || nx >= p.maxX)) p.dirX = -p.dirX;
        if (p.dirY !== 0 && (ny <= p.minY || ny >= p.maxY)) p.dirY = -p.dirY;

        p.x += p.speed * p.dirX;
        p.y += p.speed * p.dirY;
        p.sprite.x = p.x;
        p.sprite.y = p.y;

        // Rising platform scoops up a stationary player
        if (p.dirY < 0 && player.onPlatform === null) {
            const top = p.y;
            if (player.y + player.height >= top && player.y + player.height <= top + p.height
                && player.x + player.width > p.x && player.x < p.x + p.width) {
                player.onPlatform = p;
                player.onGround = true;
            }
        }
    }

    // Carry the player with their platform
    if (!player.onPlatform) return;
    const p = player.onPlatform;

    if (p.dirY !== 0) {
        const newY = p.y - player.height;
        if (isSolid(player.x + 2, newY) || isSolid(player.x + player.width - 2, newY)) {
            player.onPlatform = null;
            player.onGround   = false;
            player.velocityY  = 1;
        } else {
            player.y = newY;
        }
    }
    if (p.dirX !== 0) {
        const newX = player.x + p.speed * p.dirX;
        const hitWall =
            isSolid(newX, player.y + 2) || isSolid(newX, player.y + player.height - 2) ||
            isSolid(newX + player.width, player.y + 2) || isSolid(newX + player.width, player.y + player.height - 2);
        if (!hitWall) {
            player.x = newX;
        } else {
            player.onPlatform = null;
            player.onGround   = false;
        }
    }
    if (player.x + player.width <= p.x || player.x >= p.x + p.width) {
        player.onPlatform = null;
        player.onGround   = false;
    }
}

// ─── Enemy update ─────────────────────────────────────────────────────────────
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const nextX = e.x + e.dirX * e.speed;

        // Turn on wall
        const frontX = nextX + (e.dirX > 0 ? e.width : 0);
        const wallAhead  = isSolid(frontX, e.y + 2) || isSolid(frontX, e.y + e.height - 2);
        // Turn on platform edge
        const edgeAhead  = !isSolid(frontX, e.y + e.height + 1);

        if (wallAhead || edgeAhead) {
            e.dirX = -e.dirX;
        } else {
            e.x = nextX;
        }
        e.sprite.x = e.x;
        e.sprite.y = e.y;
    }
}

// ─── Bullet update ────────────────────────────────────────────────────────────
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.velocityX;
        b.sprite.x = b.x;

        // Off screen or hit wall
        if (b.x < -10 || b.x > MAP_W + 10 ||
            isSolid(b.x, b.y) || isSolid(b.x + b.width, b.y)) {
            world.removeChild(b.sprite);
            bullets.splice(i, 1);
            continue;
        }

        // Hit enemy
        for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            if (b.x < e.x + e.width && b.x + b.width > e.x &&
                b.y < e.y + e.height && b.y + b.height > e.y) {
                world.removeChild(e.sprite);
                enemies.splice(j, 1);
                world.removeChild(b.sprite);
                bullets.splice(i, 1);
                break;
            }
        }
    }
}

// ─── Player update ────────────────────────────────────────────────────────────
function updatePlayer() {
    // Horizontal input
    if (keys['ArrowLeft']) {
        player.velocityX = -player.speed;
        player.lastDir   = -1;
    } else if (keys['ArrowRight']) {
        player.velocityX = player.speed;
        player.lastDir   = 1;
    } else {
        player.velocityX = 0;
    }

    // Shoot
    if (keys['ShiftLeft'] || keys['ShiftRight']) fireBullet();

    // Jump
    if ((keys['Space'] || keys['ArrowUp']) && (player.onGround || player.onPlatform)) {
        player.velocityY  = player.jumpPower;
        player.onGround   = false;
        player.onPlatform = null;
    }

    // Gravity (skip when carried by platform)
    if (!player.onPlatform) {
        player.velocityY += GRAV;
    }

    // ── Horizontal movement ──
    if (!player.onPlatform) {
        const newX = player.x + player.velocityX;
        if (!isSolid(newX,                  player.y + 2) &&
            !isSolid(newX,                  player.y + player.height - 2) &&
            !isSolid(newX + player.width,   player.y + 2) &&
            !isSolid(newX + player.width,   player.y + player.height - 2)) {
            player.x = newX;
        }
    }

    // ── Vertical movement ──
    if (!player.onPlatform) {
        if (player.velocityY > 0) {
            // Falling — check static floor
            if (isSolid(player.x + 2,              player.y + player.height + player.velocityY) ||
                isSolid(player.x + player.width - 2, player.y + player.height + player.velocityY)) {
                player.y = Math.floor((player.y + player.height + player.velocityY) / TS) * TS - player.height;
                player.velocityY = 0;
                player.onGround  = true;
            } else {
                // Check cloud landing
                const footLeft  = player.x + 3;
                const footRight = player.x + player.width - 3;
                const footY     = player.y + player.height;
                const cloudLeft  = isCloud(footLeft,  footY + player.velocityY);
                const cloudRight = isCloud(footRight, footY + player.velocityY);
                if (cloudLeft || cloudRight) {
                    const cloudRow = Math.floor((footY + player.velocityY) / TS);
                    // Only land if player was above the cloud surface this frame
                    if (footY <= cloudRow * TS + 8) {
                        player.y        = cloudRow * TS - player.height;
                        player.velocityY = 0;
                        player.onGround  = true;
                    } else {
                        player.y += player.velocityY;
                        player.onGround = false;
                    }
                } else {
                    // Check moving platform landing
                    const landed = checkLandOnPlatform(player.velocityY);
                    if (landed) {
                        player.y        = landed.y - player.height;
                        player.velocityY = 0;
                        player.onPlatform = landed;
                    } else {
                        player.y += player.velocityY;
                        player.onGround = false;
                    }
                }
            }
        } else if (player.velocityY < 0) {
            // Rising — check ceiling
            if (isSolid(player.x + 2,              player.y + player.velocityY) ||
                isSolid(player.x + player.width - 2, player.y + player.velocityY)) {
                player.y = Math.ceil(player.y / TS) * TS;
                player.velocityY = 0;
            } else {
                player.y += player.velocityY;
                player.onGround = false;
            }
        }
    }

    // Check if player walked off any surface
    if (player.onGround && !player.onPlatform) {
        const footLeft  = isSolid(player.x + 2,              player.y + player.height + 1) ||
                          isCloud(player.x + 2,              player.y + player.height + 1);
        const footRight = isSolid(player.x + player.width - 2, player.y + player.height + 1) ||
                          isCloud(player.x + player.width - 2, player.y + player.height + 1);
        if (!footLeft && !footRight) player.onGround = false;
    }

    player.x = Math.max(TS, Math.min(player.x, MAP_W - TS - player.width));
    player.sprite.x = player.x;
    player.sprite.y = player.y;
}

// ─── Game loop ────────────────────────────────────────────────────────────────
function gameLoop() {
    player.lastY = player.y;

    // Order matters:
    // 1. Platforms move (and carry the player if already aboard)
    // 2. Player input + physics
    // 3. Enemies
    // 4. Bullets
    // 5. Camera
    updatePlatforms();
    updatePlayer();
    updateEnemies();
    updateBullets();
    updateCamera();
}

buildPlatforms();
spawnEnemies();
app.ticker.add(gameLoop);
{{< /pixidemo >}}

Controls: arrow keys to move, Space or Up to jump, Shift to shoot.

## What Changed When the Systems Merged

Running these mechanics individually is straightforward. Running them together exposed ordering dependencies and shared state problems that don't exist in isolation.

### Update Order

The game loop above runs in this sequence:

```
updatePlatforms → updatePlayer → updateEnemies → updateBullets → updateCamera
```

Platforms run first because they carry the player. If the player updated before the platform moved, they'd trail behind by one frame — visible as jitter on vertical platforms. Enemy and bullet updates run after the player so that their positions are already final when collision checks happen.

The camera always runs last. Applying the camera offset before positions are final would read stale data.

### `player.lastY` Must Be Set Before Anything Moves

The moving platform landing check uses `player.lastY` to determine whether the player was above the tile top on the previous frame. If platforms run first and the player moves before `lastY` is captured, the landing check will use the wrong reference frame. The fix is one line at the very top of `gameLoop`:

```js
function gameLoop() {
    player.lastY = player.y;  // ← must be first
    updatePlatforms();
    // ...
}
```

### Unified Tile Type Constants

Each standalone tutorial defined its own `EMPTY = 0, SOLID = 1, CLOUD = 2` constants. Once combined, two tutorials using `2` for different tile types would conflict. The synthesis uses a single object:

```js
const TILE = { EMPTY: 0, SOLID: 1, CLOUD: 2 };
```

All tile checks go through the same `tileAt` helper. Adding a new type (ladders, for instance) means adding one entry here and updating only the functions that need to respond to it.

### Three Ground States, Not One

In the individual tutorials, `player.onGround` was a boolean. In the combined game, the player can be on a static tile, a cloud tile, or a moving platform — and these require different behaviour:

- Static tile: normal physics, `onGround = true`
- Cloud tile: same as static, but only from above; no ceiling or side collision
- Moving platform: player carried by the platform object; gravity skipped; lateral movement clamped to platform bounds

This is handled with two flags: `player.onGround` (true when on static or cloud) and `player.onPlatform` (holds a reference to the platform object, or `null`). Physics checks both before applying gravity or accepting a jump:

```js
if (!player.onPlatform) {
    player.velocityY += GRAV;
}

if ((keys['Space']) && (player.onGround || player.onPlatform)) {
    player.velocityY  = player.jumpPower;
    player.onPlatform = null;
}
```

### Collision Priority

When falling, the player checks surfaces in this order: static floor first, then clouds, then moving platforms. Static tiles are authoritative — if the player has landed on one, the check stops. This avoids a bug where a moving platform and a static floor occupy the same y-range and the player snaps to the wrong one.

```js
if (hitStaticFloor) {
    // snap to tile
} else if (hitCloud) {
    // land on cloud
} else {
    const landed = checkLandOnPlatform(player.velocityY);
    if (landed) { /* snap to platform */ }
    else { player.y += player.velocityY; }
}
```

### Enemy Collision Uses AABB, Not Distance

The individual "Shoot Him" tutorial used circular distance collision (`Math.sqrt(dx² + dy²)`). The enemies in this series are axis-aligned rectangles and the combined game uses rectangle overlap (AABB) for bullets:

```js
if (b.x < e.x + e.width  && b.x + b.width  > e.x &&
    b.y < e.y + e.height && b.y + b.height > e.y) {
    // hit
}
```

AABB is faster (no square root) and more accurate for rectangular hitboxes.

### The Camera Is Invisible to Game Logic

None of the update functions reference `camX` or `world.x`. The camera is applied purely at render time as an offset on the world container. Collision checks, position updates, and spawn coordinates all use world-space pixels. This is the key architectural decision that keeps scrolling from complicating every other system.
