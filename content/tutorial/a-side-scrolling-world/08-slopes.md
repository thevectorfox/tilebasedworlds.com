+++
title = "Slopes"
date = 2026-03-10T00:00:00+11:00
weight = 8
draft = false
slug = "slopes"
tags = ["advanced", "optimization", "tutorial"]
next = "/tutorial/a-side-scrolling-world/scrolling/"
prev = "/tutorial/a-side-scrolling-world/depth/"
+++

Slopes replace the hard tile edges with diagonal surfaces the player slides up and down. The visual is a triangle tile; the physics are a surface height that changes linearly across the tile's width.

{{< pixidemo title="Slopes" >}}
const app = new PIXI.Application();
await app.init({ width: 300, height: 240, backgroundColor: 0x87CEEB });
document.body.appendChild(app.canvas);

const TS = 30;  // TILE_SIZE
const GRAVITY = 0.6;

const EMPTY = 0, SOLID = 1, SLOPE_UP = 2, SLOPE_DOWN = 3;

// 10×8 map. 2 = / slope, 3 = \ slope
const map = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,2,3,0,0,0,1],
    [1,0,0,2,1,1,3,0,0,1],
    [1,0,2,1,1,1,1,3,0,1],
    [1,1,1,1,1,1,1,1,1,1]
];

for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
        const t = map[row][col];
        const x = col * TS, y = row * TS;
        let g;
        if (t === SOLID) {
            g = new PIXI.Graphics().rect(0, 0, TS, TS).fill(0x8B4513);
        } else if (t === SLOPE_UP) {
            // / triangle: bottom-left → top-right → bottom-right
            g = new PIXI.Graphics().poly([0, TS, TS, 0, TS, TS]).fill(0x5A8A3A);
        } else if (t === SLOPE_DOWN) {
            // \ triangle: top-left → bottom-right → bottom-left
            g = new PIXI.Graphics().poly([0, 0, TS, TS, 0, TS]).fill(0x5A8A3A);
        }
        if (g) { g.x = x; g.y = y; app.stage.addChild(g); }
    }
}

const heroSprite = new PIXI.Graphics().rect(0, 0, 12, 12).fill(0xff4444);
app.stage.addChild(heroSprite);

const player = {
    x: 30, y: 198, width: 12, height: 12,
    velocityX: 0, velocityY: 0,
    speed: 2, jumpPower: -10,
    onGround: false
};

const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (['Space','ArrowLeft','ArrowRight','ArrowUp'].includes(e.code)) e.preventDefault();
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

function tileAt(col, row) {
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) return SOLID;
    return map[row][col];
}

function isSolid(x, y) {
    return tileAt(Math.floor(x / TS), Math.floor(y / TS)) === SOLID;
}

// Surface Y for a slope tile at the given pixel coordinate.
// Returns null if the tile at (x, y) is not a slope.
function slopeSurface(x, y) {
    const col = Math.floor(x / TS);
    const row = Math.floor(y / TS);
    const t   = tileAt(col, row);
    if (t !== SLOPE_UP && t !== SLOPE_DOWN) return null;
    const localX     = x - col * TS;
    const tileBottomY = (row + 1) * TS;
    // SLOPE_UP  (/): left end at tile floor, right end at tile ceiling
    if (t === SLOPE_UP)   return tileBottomY - localX;
    // SLOPE_DOWN(\): left end at tile ceiling, right end at tile floor
    if (t === SLOPE_DOWN) return tileBottomY - (TS - localX);
}

function gameLoop() {
    // Input
    if (keys['ArrowLeft'])  player.velocityX = -player.speed;
    else if (keys['ArrowRight']) player.velocityX = player.speed;
    else player.velocityX = 0;

    if ((keys['Space'] || keys['ArrowUp']) && player.onGround) {
        player.velocityY = player.jumpPower;
        player.onGround = false;
    }

    player.velocityY += GRAVITY;

    // Horizontal movement
    const newX = player.x + player.velocityX;
    if (!isSolid(newX, player.y + 2) && !isSolid(newX, player.y + player.height - 2) &&
        !isSolid(newX + player.width, player.y + 2) &&
        !isSolid(newX + player.width, player.y + player.height - 2)) {
        player.x = newX;
    }

    // Vertical movement
    const footX    = player.x + player.width / 2;
    const newFeetY = player.y + player.height + player.velocityY;

    if (player.velocityY >= 0) {
        // Check solid floor first
        if (isSolid(footX - 2, newFeetY) || isSolid(footX + 2, newFeetY)) {
            player.y     = Math.floor(newFeetY / TS) * TS - player.height;
            player.velocityY = 0;
            player.onGround  = true;
        } else {
            // Check slope at foot level; also check one tile above for flat→slope transitions
            let surf = slopeSurface(footX, newFeetY);
            if (surf === null) surf = slopeSurface(footX, newFeetY - TS + 1);
            if (surf !== null && newFeetY >= surf) {
                player.y     = surf - player.height;
                player.velocityY = 0;
                player.onGround  = true;
            } else {
                player.y    += player.velocityY;
                player.onGround = false;
            }
        }
    } else {
        // Rising: check ceiling
        const newTop = player.y + player.velocityY;
        if (isSolid(player.x + 2, newTop) || isSolid(player.x + player.width - 2, newTop)) {
            player.y = Math.ceil(newTop / TS) * TS;
            player.velocityY = 0;
        } else {
            player.y += player.velocityY;
        }
    }

    player.x = Math.max(0, Math.min(player.x, 300 - player.width));
    heroSprite.x = player.x;
    heroSprite.y = player.y;
}

app.ticker.add(gameLoop);
{{< /pixidemo >}}

## Slope Tile Types

Only two diagonal variants are needed to build any terrain shape:

```
SLOPE_UP  (value 2, / shape): bottom-left corner to top-right corner
SLOPE_DOWN(value 3, \ shape): top-left corner to bottom-right corner
```

In PixiJS v8, draw these as filled polygons using `.poly()`. The coordinate list is `[x1, y1, x2, y2, x3, y3]`, relative to the tile's top-left corner:

```javascript
const TS = TILE_SIZE;

// SLOPE_UP /  — bottom-left, top-right, bottom-right
new PIXI.Graphics().poly([0, TS, TS, 0, TS, TS]).fill(0x5A8A3A);

// SLOPE_DOWN \ — top-left, bottom-right, bottom-left
new PIXI.Graphics().poly([0, 0, TS, TS, 0, TS]).fill(0x5A8A3A);
```

## Surface Height Calculation

The surface Y at a given pixel X within a slope tile changes linearly from one corner to the other. Given `localX = x - (col * TILE_SIZE)`:

```javascript
function slopeSurface(x, y) {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    const t   = map[row][col];

    if (t !== SLOPE_UP && t !== SLOPE_DOWN) return null;

    const localX      = x - col * TILE_SIZE;
    const tileBottomY = (row + 1) * TILE_SIZE;

    // SLOPE_UP (/): left end at tile floor, right end at tile ceiling
    if (t === SLOPE_UP)   return tileBottomY - localX;

    // SLOPE_DOWN (\): left end at tile ceiling, right end at tile floor
    if (t === SLOPE_DOWN) return tileBottomY - (TILE_SIZE - localX);
}
```

At `localX = 0` on a SLOPE_UP tile, `surfaceY = tileBottomY` — floor level.
At `localX = TILE_SIZE`, `surfaceY = tileTopY` — ceiling level.
Values in between are proportional, giving the smooth slope.

## Collision: Flat-to-Slope Transition

The standard falling check compares the player's next foot position against solid tiles. Slopes require an additional step: if no solid floor is found, look for a slope surface at foot level. Also check one tile-height above the foot to handle the transition from flat floor onto the base of a slope:

```javascript
if (player.velocityY >= 0) {
    const footX    = player.x + player.width / 2;
    const newFeetY = player.y + player.height + player.velocityY;

    // 1. Solid floor takes priority
    if (isSolid(footX - 2, newFeetY) || isSolid(footX + 2, newFeetY)) {
        player.y         = Math.floor(newFeetY / TS) * TS - player.height;
        player.velocityY = 0;
        player.onGround  = true;
    } else {
        // 2. Slope at foot level; or one tile up (flat→slope transition)
        let surf = slopeSurface(footX, newFeetY);
        if (surf === null) surf = slopeSurface(footX, newFeetY - TS + 1);

        if (surf !== null && newFeetY >= surf) {
            player.y         = surf - player.height;
            player.velocityY = 0;
            player.onGround  = true;
        } else {
            player.y       += player.velocityY;
            player.onGround = false;
        }
    }
}
```

The `slopeSurface(footX, newFeetY - TS + 1)` call checks whether there is a slope tile in the row immediately above the foot's current tile. Without it, a player walking from a flat floor onto the bottom of a slope would briefly "fall through" by one frame because the foot-level tile is still the flat floor, not the slope.

Next: [Scrolling](/tutorial/a-side-scrolling-world/scrolling/)
