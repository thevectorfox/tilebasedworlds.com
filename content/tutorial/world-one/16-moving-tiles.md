+++
title = "Moving Tiles"
date = 2026-03-09T12:00:00+11:00
weight = 16
draft = false
slug = "moving-tiles"
tags = ["advanced", "optimization", "tutorial"]
next = "/tutorial/world-one/scrolling/"
prev = "/tutorial/world-one/getting-items/"
+++

Moving platforms! 🏃‍♂️ They're in every great platformer - the swinging platforms in Donkey Kong Country, the cloud lifts in Mario, the crumbling bridges in Crash Bandicoot. They transform a flat level into a dynamic puzzle that rewards timing and skill. Let's build them!

{{< pixidemo title="Moving Tiles" >}}
const app = new PIXI.Application();
await app.init({ width: 300, height: 240, backgroundColor: 0x87CEEB });
document.body.appendChild(app.canvas);

const TILE_SIZE = 30;
const GRAVITY = 0.6;

const map = [
    [1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [1,1,1,0,0,0,0,1,1,1],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [1,1,0,0,0,0,0,0,1,1],
    [1,1,1,1,1,1,1,1,1,1]
];

for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
        if (map[row][col] === 1) {
            const tile = new PIXI.Graphics().rect(0, 0, TILE_SIZE, TILE_SIZE).fill(0x8B4513);
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            app.stage.addChild(tile);
        }
    }
}

// Moving tile definitions: speed, direction, range (relative tiles from start)
const MOVING_TILE_TYPES = {
    1: { speed: 1, dirX: 0, dirY: 1,  rangeMinY: 0, rangeMaxY: 4, color: 0x44BB44 }, // vertical
    2: { speed: 1, dirX: 1, dirY: 0,  rangeMinX: 0, rangeMaxX: 5, color: 0x44AACC }  // horizontal
};

// Moving tile data: [type, startTileX, startTileY]
const myMovingTiles = [
    [],
    [[1, 5, 1], [2, 2, 5]]
];

const game = { currentRoom: 1, tileSize: TILE_SIZE };
const movingTiles = [];

function buildMovingTiles() {
    for (const [type, startTileX, startTileY] of myMovingTiles[game.currentRoom]) {
        const def = MOVING_TILE_TYPES[type];
        const sprite = new PIXI.Graphics().rect(0, 0, TILE_SIZE, TILE_SIZE / 2).fill(def.color);

        const tile = {
            sprite,
            x: startTileX * TILE_SIZE,
            y: startTileY * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE / 2,
            speed: def.speed,
            dirX: def.dirX,
            dirY: def.dirY,
            minX: (startTileX + (def.rangeMinX || 0)) * TILE_SIZE,
            maxX: (startTileX + (def.rangeMaxX || 0)) * TILE_SIZE,
            minY: (startTileY + (def.rangeMinY || 0)) * TILE_SIZE,
            maxY: (startTileY + (def.rangeMaxY || 0)) * TILE_SIZE,
        };

        sprite.x = tile.x;
        sprite.y = tile.y;
        app.stage.addChild(sprite);
        movingTiles.push(tile);
    }
}

const heroSprite = new PIXI.Graphics().rect(0, 0, 12, 12).fill(0xff4444);
app.stage.addChild(heroSprite);

const player = {
    sprite: heroSprite,
    x: 60, y: 150,
    width: 12, height: 12,
    velocityX: 0, velocityY: 0,
    speed: 2, jumpPower: -10,
    onGround: false,
    onMovingTile: null,
    lastY: 150
};

function isSolid(x, y) {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) return true;
    return map[row][col] === 1;
}

function checkLandOnMovingTile(dy) {
    for (const tile of movingTiles) {
        // Only land from above: player's bottom was above tile top last frame
        if (player.lastY + player.height > tile.y) continue;

        const nextBottom = player.y + player.height + dy;
        if (nextBottom >= tile.y && nextBottom <= tile.y + tile.height) {
            // Check horizontal overlap
            if (player.x + player.width > tile.x && player.x < tile.x + tile.width) {
                return tile;
            }
        }
    }
    return null;
}

function updateMovingTiles() {
    for (const tile of movingTiles) {
        // Bounce at boundaries
        const nextX = tile.x + tile.speed * tile.dirX;
        const nextY = tile.y + tile.speed * tile.dirY;

        if (tile.dirX !== 0 && (nextX <= tile.minX || nextX >= tile.maxX)) tile.dirX = -tile.dirX;
        if (tile.dirY !== 0 && (nextY <= tile.minY || nextY >= tile.maxY)) tile.dirY = -tile.dirY;

        tile.x += tile.speed * tile.dirX;
        tile.y += tile.speed * tile.dirY;
        tile.sprite.x = tile.x;
        tile.sprite.y = tile.y;

        // If tile is moving up, check if it scoops up a stationary player
        if (tile.dirY < 0 && player.onMovingTile === null) {
            const tileTop = tile.y;
            if (player.y + player.height >= tileTop && player.y + player.height <= tileTop + tile.height) {
                if (player.x + player.width > tile.x && player.x < tile.x + tile.width) {
                    player.onMovingTile = tile;
                    player.onGround = true;
                }
            }
        }
    }

    // Carry player with their platform
    if (player.onMovingTile) {
        const tile = player.onMovingTile;

        // Move vertically with tile
        if (tile.dirY !== 0) {
            const newPlayerY = tile.y - player.height;
            // Check if the tile is pushing player into a ceiling
            if (isSolid(player.x + 2, newPlayerY) || isSolid(player.x + player.width - 2, newPlayerY)) {
                // Squashed - detach and push down
                player.onMovingTile = null;
                player.onGround = false;
                player.velocityY = 1;
            } else {
                player.y = newPlayerY;
            }
        }

        // Move horizontally with tile
        if (tile.dirX !== 0) {
            const newPlayerX = player.x + tile.speed * tile.dirX;
            const hitLeft  = isSolid(newPlayerX, player.y + 2) || isSolid(newPlayerX, player.y + player.height - 2);
            const hitRight = isSolid(newPlayerX + player.width, player.y + 2) || isSolid(newPlayerX + player.width, player.y + player.height - 2);

            if (!hitLeft && !hitRight) {
                player.x = newPlayerX;
            } else {
                // Wall stopped horizontal movement - fall off
                player.onMovingTile = null;
                player.onGround = false;
            }
        }

        // Check if player has walked off the edge of the tile
        if (player.x + player.width <= tile.x || player.x >= tile.x + tile.width) {
            player.onMovingTile = null;
            player.onGround = false;
        }

        player.sprite.x = player.x;
        player.sprite.y = player.y;
    }
}

const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

function gameLoop() {
    player.lastY = player.y;

    // Update tiles first (they carry the player)
    updateMovingTiles();

    // Horizontal input
    if (keys['ArrowLeft'])  player.velocityX = -player.speed;
    else if (keys['ArrowRight']) player.velocityX = player.speed;
    else player.velocityX = 0;

    // Jump
    if ((keys['Space'] || keys['ArrowUp']) && (player.onGround || player.onMovingTile)) {
        player.velocityY = player.jumpPower;
        player.onGround = false;
        player.onMovingTile = null; // Leave the platform
    }

    // Gravity (not while standing on a tile)
    if (!player.onMovingTile) {
        player.velocityY += GRAVITY;
    }

    // Horizontal movement + wall collision
    if (!player.onMovingTile) {
        const newX = player.x + player.velocityX;
        if (!isSolid(newX, player.y + 2) && !isSolid(newX, player.y + player.height - 2) &&
            !isSolid(newX + player.width, player.y + 2) && !isSolid(newX + player.width, player.y + player.height - 2)) {
            player.x = newX;
        }
    }

    // Vertical movement + collision (only when not carried by a tile)
    if (!player.onMovingTile) {
        if (player.velocityY > 0) {
            // Falling down - check static tiles first
            const newY = player.y + player.velocityY;
            if (isSolid(player.x + 2, newY + player.height) || isSolid(player.x + player.width - 2, newY + player.height)) {
                player.y = Math.floor((player.y + player.height) / TILE_SIZE) * TILE_SIZE - player.height;
                player.velocityY = 0;
                player.onGround = true;
            } else {
                // Check moving tile landing
                const landedTile = checkLandOnMovingTile(player.velocityY);
                if (landedTile) {
                    player.y = landedTile.y - player.height;
                    player.velocityY = 0;
                    player.onGround = false;
                    player.onMovingTile = landedTile;
                } else {
                    player.y = newY;
                    player.onGround = false;
                }
            }
        } else if (player.velocityY < 0) {
            // Moving up - check ceiling
            const newY = player.y + player.velocityY;
            if (isSolid(player.x + 2, newY) || isSolid(player.x + player.width - 2, newY)) {
                player.y = Math.ceil(player.y / TILE_SIZE) * TILE_SIZE;
                player.velocityY = 0;
            } else {
                player.y = newY;
            }
        }
    }

    player.x = Math.max(0, Math.min(player.x, 288));
    player.sprite.x = player.x;
    player.sprite.y = player.y;
}

buildMovingTiles();
app.ticker.add(gameLoop);
{{< /pixidemo >}}

Before we start coding, let's agree on the rules. Moving platforms in this tutorial work like cloud tiles - the hero can only land on them from above. Here's what we need to handle:

- Moving tiles travel horizontally or vertically between two boundaries
- The hero can land on a moving tile only by falling onto it from above
- A tile moving upward can scoop up a stationary hero
- When riding a tile, the hero moves with it
- Walls still block the hero even while riding a moving tile
- When a tile pushes the hero into a wall, the hero detaches and falls

## DEFINING MOVING TILE TYPES 📐

Instead of static map tiles, moving tiles need a set of behavior properties. Define them as plain objects - one entry per tile type:

```js
const MOVING_TILE_TYPES = {
    1: {
        speed: 2,
        dirX: 0,  dirY: 1,      // Vertical mover (0 = no movement on that axis)
        rangeMinY: -1,           // Relative to starting tile: goes 1 tile up...
        rangeMaxY: 4,            // ...and 4 tiles down
        color: 0x44BB44
    },
    2: {
        speed: 2,
        dirX: 1,  dirY: 0,      // Horizontal mover
        rangeMinX: -2,           // 2 tiles left of start...
        rangeMaxX: 3,            // ...3 tiles right
        color: 0x44AACC
    }
};
```

`dirX`/`dirY` tell the tile which way to start moving. The range values are **relative to the starting tile position**, so you can place the same tile type anywhere in a map and its travel range will follow it. The tile bounces when it hits either boundary.

## PLACING MOVING TILES 🗺️

Like enemies and items, moving tiles are stored in a data array per room:

```js
// myMovingTiles[roomIndex] = [[type, startTileX, startTileY], ...]
const myMovingTiles = [
    [],                       // Room 0 - unused
    [[1, 4, 2]],              // Room 1: one vertical platform starting at tile (4, 2)
    [[2, 4, 4]]               // Room 2: one horizontal platform starting at tile (4, 4)
];
```

Call `buildMovingTiles()` when you build the room. It converts the relative range values into absolute pixel boundaries so you never have to recalculate them during gameplay:

```js
const movingTiles = []; // all active moving tile objects

function buildMovingTiles() {
    movingTiles.length = 0; // Clear previous room's tiles

    for (const [type, startTileX, startTileY] of myMovingTiles[game.currentRoom]) {
        const def = MOVING_TILE_TYPES[type];

        const sprite = new PIXI.Graphics()
            .rect(0, 0, game.tileSize, game.tileSize / 2)
            .fill(def.color);

        const tile = {
            sprite,
            x: startTileX * game.tileSize,
            y: startTileY * game.tileSize,
            width:  game.tileSize,
            height: game.tileSize / 2,
            speed: def.speed,
            dirX:  def.dirX,
            dirY:  def.dirY,
            // Convert relative range → absolute pixel bounds
            minX: (startTileX + (def.rangeMinX ?? 0)) * game.tileSize,
            maxX: (startTileX + (def.rangeMaxX ?? 0)) * game.tileSize,
            minY: (startTileY + (def.rangeMinY ?? 0)) * game.tileSize,
            maxY: (startTileY + (def.rangeMaxY ?? 0)) * game.tileSize,
        };

        sprite.x = tile.x;
        sprite.y = tile.y;
        app.stage.addChild(sprite);
        movingTiles.push(tile);
    }
}
```

Storing absolute boundaries avoids recalculating `start + range` on every frame. That may not sound like much, but at 60fps with many tiles it adds up!

## LANDING ON A MOVING TILE 🎯

The landing check has one critical rule: **the hero must have been above the tile on the previous frame**. Without this, the hero would teleport to the top of any tile they happen to overlap with from the side.

Save `player.lastY` at the very start of your game loop before anything moves:

```js
function gameLoop() {
    player.lastY = player.y;  // ← must be first!

    updateMovingTiles();
    handleInput();
    // ...
}
```

Then when checking downward movement, test against moving tiles after static tiles:

```js
function checkLandOnMovingTile(dy) {
    for (const tile of movingTiles) {
        // Was the player's bottom above the tile top last frame?
        if (player.lastY + player.height > tile.y) continue;

        // Will the player overlap the tile top after this movement?
        const nextBottom = player.y + player.height + dy;
        if (nextBottom >= tile.y && nextBottom <= tile.y + tile.height) {
            // Check horizontal overlap
            if (player.x + player.width > tile.x && player.x < tile.x + tile.width) {
                return tile; // Found it!
            }
        }
    }
    return null;
}
```

Use it inside your downward movement code, after the static floor check:

```js
if (player.velocityY > 0) {
    if (/* static floor check */) {
        // Hit a static floor tile - normal landing
    } else {
        const landedTile = checkLandOnMovingTile(player.velocityY);
        if (landedTile) {
            player.y = landedTile.y - player.height; // Snap to top of platform
            player.velocityY = 0;
            player.onMovingTile = landedTile;        // Remember which tile we're on
        } else {
            player.y += player.velocityY;            // Still falling
        }
    }
}
```

## MOVING ALL THE TILES 🔄

The `updateMovingTiles()` function runs once per frame **before** player input. It handles three jobs:

1. Move each tile and bounce it at its boundaries
2. Scoop up a stationary hero if a tile rises up to meet them
3. Carry the hero along if they're already standing on a tile

```js
function updateMovingTiles() {
    // --- Part 1: Move every tile ---
    for (const tile of movingTiles) {
        const nextX = tile.x + tile.speed * tile.dirX;
        const nextY = tile.y + tile.speed * tile.dirY;

        // Reverse direction at boundaries
        if (tile.dirX !== 0 && (nextX <= tile.minX || nextX >= tile.maxX)) tile.dirX = -tile.dirX;
        if (tile.dirY !== 0 && (nextY <= tile.minY || nextY >= tile.maxY)) tile.dirY = -tile.dirY;

        tile.x += tile.speed * tile.dirX;
        tile.y += tile.speed * tile.dirY;
        tile.sprite.x = tile.x;
        tile.sprite.y = tile.y;

        // Part 2: Can a rising tile scoop up the hero?
        if (tile.dirY < 0 && player.onMovingTile === null) {
            const tileTop = tile.y;
            if (player.y + player.height >= tileTop &&
                player.y + player.height <= tileTop + tile.height &&
                player.x + player.width > tile.x &&
                player.x < tile.x + tile.width) {
                player.onMovingTile = tile;
            }
        }
    }

    // --- Part 3: Carry the hero ---
    if (!player.onMovingTile) return;

    const tile = player.onMovingTile;

    // Move vertically with tile
    if (tile.dirY !== 0) {
        const newPlayerY = tile.y - player.height;
        const hitCeiling = isSolid(player.x + 2, newPlayerY) ||
                           isSolid(player.x + player.width - 2, newPlayerY);
        if (hitCeiling) {
            // Squashed against ceiling - detach
            player.onMovingTile = null;
            player.velocityY = 1;
        } else {
            player.y = newPlayerY;
        }
    }

    // Move horizontally with tile
    if (tile.dirX !== 0) {
        const newPlayerX = player.x + tile.speed * tile.dirX;
        const hitWall = isSolid(newPlayerX, player.y + 2) ||
                        isSolid(newPlayerX, player.y + player.height - 2) ||
                        isSolid(newPlayerX + player.width, player.y + 2) ||
                        isSolid(newPlayerX + player.width, player.y + player.height - 2);
        if (!hitWall) {
            player.x = newPlayerX;
        } else {
            // Wall blocked horizontal movement - detach and fall
            player.onMovingTile = null;
        }
    }

    // Walked off the edge? Let gravity take over
    if (player.x + player.width <= tile.x || player.x >= tile.x + tile.width) {
        player.onMovingTile = null;
    }
}
```

## WRAPPING IT INTO THE GAME LOOP 🔁

Two small changes to your existing game loop:

**Before input processing**, save lastY and run tile updates:

```js
function gameLoop() {
    player.lastY = player.y; // Always first!
    updateMovingTiles();      // Tiles move (and carry player) before input

    handleInput();

    // Skip gravity when riding a platform
    if (!player.onMovingTile) {
        player.velocityY += GRAVITY;
    }

    // ... rest of movement and collision ...
}
```

**In your jump code**, clear `onMovingTile` when the hero leaves the platform:

```js
function handleJump() {
    if (keys['Space'] && (player.onGround || player.onMovingTile)) {
        player.velocityY = player.jumpPower;
        player.onGround = false;
        player.onMovingTile = null; // ← leave the platform on jump
    }
}
```

That's it! Notice that `movingTiles` doesn't need saving when changing rooms - unlike items, platforms always reset to their starting position when you re-enter a room.

## DESIGN TIPS 💡

Now that you can build moving platforms, here's how pros use them:

**Pacing and rhythm**: Platforms that move at the same speed as the player's walk speed create satisfying sync. Try `speed: 2` for tiles in a world where the hero also moves at 2 pixels/frame.

**No wall clipping**: Moving tiles don't check the static map - it's your job to place their boundaries so they don't clip through walls. That's a feature, not a bug! Want a platform that slides through a wall into a secret room? Go for it.

**Multiple tiles**: Add more entries to `myMovingTiles` to fill a room. A gauntlet of precisely timed platforms at different speeds creates the kind of challenge players remember.

**Next up**: Your world is getting dynamic - now let's make it *big*. [Next: Scrolling](/tutorial/world-one/17-scrolling/)
