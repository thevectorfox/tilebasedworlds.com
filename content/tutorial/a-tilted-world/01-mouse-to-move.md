+++
title = "Mouse to Move"
date = 2026-03-09T16:00:00+11:00
weight = 1
draft = true
slug = "mouse-to-move"
tags = ["advanced", "optimization", "tutorial"]
next = "/tutorial/the-quarter/isometric-view/"
prev = ""
+++

Put down the keyboard and click anywhere on the map. The hero walks there. Click-to-move is the movement style behind countless RPGs, strategy games, and point-and-click adventures. Let's build it!

{{< pixidemo title="Mouse to Move" >}}
const app = new PIXI.Application();
await app.init({ width: 300, height: 240, backgroundColor: 0x5a8a3a });
document.body.appendChild(app.canvas);

const TILE_SIZE = 30;
const CENTER = (TILE_SIZE - 12) / 2; // 9px offset to center a 12px hero in a 30px tile

const map = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1],
];

// Draw walls
for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
        if (map[row][col] === 1) {
            const wall = new PIXI.Graphics().rect(0, 0, TILE_SIZE, TILE_SIZE).fill(0x8B4513);
            wall.x = col * TILE_SIZE;
            wall.y = row * TILE_SIZE;
            app.stage.addChild(wall);
        }
    }
}

const heroSprite = new PIXI.Graphics().rect(0, 0, 12, 12).fill(0xff4444);
app.stage.addChild(heroSprite);

const player = {
    sprite: heroSprite,
    x: 39, y: 39,       // Pixel position (tile 1,1 center: 1*30+9)
    width: 12, height: 12,
    tileX: 1, tileY: 1,
    dirX: 0, dirY: 0,
    speed: 2,
    moving: false,
    targetTileX: 1, targetTileY: 1
};

heroSprite.x = player.x;
heroSprite.y = player.y;

// Tile hover cursor - yellow highlight
const cursor = new PIXI.Graphics()
    .rect(1, 1, TILE_SIZE - 2, TILE_SIZE - 2)
    .fill({ color: 0xffff00, alpha: 0.35 });
cursor.visible = false;
app.stage.addChild(cursor);

// Target marker - small crosshair at destination
const targetMarker = new PIXI.Graphics();
targetMarker.visible = false;
app.stage.addChild(targetMarker);

function isWalkable(col, row) {
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) return false;
    return map[row][col] === 0;
}

let mouseCol = -1;
let mouseRow = -1;

app.canvas.addEventListener('mousemove', (e) => {
    const rect = app.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    mouseCol = Math.floor(mx / TILE_SIZE);
    mouseRow = Math.floor(my / TILE_SIZE);

    if (isWalkable(mouseCol, mouseRow)) {
        cursor.x = mouseCol * TILE_SIZE;
        cursor.y = mouseRow * TILE_SIZE;
        cursor.visible = true;
    } else {
        cursor.visible = false;
    }
});

app.canvas.addEventListener('mouseleave', () => {
    cursor.visible = false;
    mouseCol = -1;
    mouseRow = -1;
});

app.canvas.addEventListener('click', () => {
    if (!isWalkable(mouseCol, mouseRow)) return;

    player.targetTileX = mouseCol;
    player.targetTileY = mouseRow;
    player.moving = true;

    // Draw crosshair at target
    const cx = mouseCol * TILE_SIZE + TILE_SIZE / 2;
    const cy = mouseRow * TILE_SIZE + TILE_SIZE / 2;
    targetMarker.clear()
        .moveTo(cx - 5, cy).lineTo(cx + 5, cy)
        .moveTo(cx, cy - 5).lineTo(cx, cy + 5)
        .stroke({ color: 0xffff00, width: 2 });
    targetMarker.visible = true;
});

function movePlayer() {
    if (!player.moving) return;

    // Are we exactly at a tile center?
    const atCenter = player.x % TILE_SIZE === CENTER &&
                     player.y % TILE_SIZE === CENTER;

    if (atCenter) {
        player.tileX = Math.floor(player.x / TILE_SIZE);
        player.tileY = Math.floor(player.y / TILE_SIZE);

        // Reached the destination?
        if (player.tileX === player.targetTileX && player.tileY === player.targetTileY) {
            player.moving = false;
            targetMarker.visible = false;
            return;
        }

        // Pick next direction: try horizontal first, then vertical
        player.dirX = 0;
        player.dirY = 0;
        if (player.tileX < player.targetTileX && isWalkable(player.tileX + 1, player.tileY)) {
            player.dirX = 1;
        } else if (player.tileX > player.targetTileX && isWalkable(player.tileX - 1, player.tileY)) {
            player.dirX = -1;
        } else if (player.tileY < player.targetTileY && isWalkable(player.tileX, player.tileY + 1)) {
            player.dirY = 1;
        } else if (player.tileY > player.targetTileY && isWalkable(player.tileX, player.tileY - 1)) {
            player.dirY = -1;
        } else {
            player.moving = false; // blocked - can't reach target
            targetMarker.visible = false;
            return;
        }
    }

    player.x += player.dirX * player.speed;
    player.y += player.dirY * player.speed;
    player.sprite.x = player.x;
    player.sprite.y = player.y;
}

function gameLoop() {
    movePlayer();
}

app.ticker.add(gameLoop);
{{< /pixidemo >}}

Notice the hero steps from tile center to tile center - no stopping halfway. That's the key characteristic of tile-based movement: the hero is always perfectly aligned to the grid.

## TILE-TO-TILE MOVEMENT 🗂️

Keyboard movement is pixel-perfect - hold the key and the hero drifts wherever you point. Click-to-move is different: each click sets a destination **tile**, and the hero walks there by stepping from center to center.

This simplification is actually a strength:

- **No mid-step collision detection** - we only check if the next tile is walkable when the hero is centered and choosing a direction
- **Predictable movement** - the hero never ends up between tiles or wedged in a corner
- **Easy animation** - facing direction updates cleanly at each tile boundary

## TRACKING THE MOUSE 🖱️

Two canvas events give us everything we need:

```js
let mouseCol = -1;
let mouseRow = -1;

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;  // pixel position within the canvas
    const my = e.clientY - rect.top;

    // Convert pixel → tile
    mouseCol = Math.floor(mx / TILE_SIZE);
    mouseRow = Math.floor(my / TILE_SIZE);
});
```

`getBoundingClientRect()` accounts for the canvas's position on the page, so `mx` and `my` are always relative to the canvas top-left corner, not the browser window.

Add a highlight rectangle to show which tile is hovered. Put it on `app.stage` last so it renders on top of everything:

```js
const cursor = new PIXI.Graphics()
    .rect(1, 1, TILE_SIZE - 2, TILE_SIZE - 2)
    .fill({ color: 0xffff00, alpha: 0.35 });
app.stage.addChild(cursor); // added last = renders on top

canvas.addEventListener('mousemove', (e) => {
    // ... update mouseCol and mouseRow ...

    if (isWalkable(mouseCol, mouseRow)) {
        cursor.x = mouseCol * TILE_SIZE;
        cursor.y = mouseRow * TILE_SIZE;
        cursor.visible = true;
    } else {
        cursor.visible = false; // hide over walls
    }
});

canvas.addEventListener('mouseleave', () => {
    cursor.visible = false;
});
```

## CLICK TO SET TARGET {{< icon name="target" >}}

When the player clicks a walkable tile, store the destination and tell the hero to start moving:

```js
canvas.addEventListener('click', () => {
    if (!isWalkable(mouseCol, mouseRow)) return; // ignore wall clicks

    player.targetTileX = mouseCol;
    player.targetTileY = mouseRow;
    player.moving = true;
});
```

Wall clicks are silently ignored - nothing visible happens. Only valid walkable tiles trigger movement.

The `player` object needs a few extra properties for this system:

```js
const player = {
    x: 39, y: 39,           // Pixel position (starts at tile 1,1 center)
    width: 12, height: 12,
    tileX: 1, tileY: 1,     // Current tile (updated each time hero centers)
    dirX: 0, dirY: 0,       // Current movement direction
    speed: 2,               // Must divide evenly into TILE_SIZE (30 ÷ 2 = 15 frames/tile)
    moving: false,
    targetTileX: 1, targetTileY: 1,
    sprite: heroSprite
};
```

The `speed` constraint matters: since the hero moves `speed` pixels per frame, and must stop exactly at tile centers, `TILE_SIZE ÷ speed` must be a whole number. Speed 2 works perfectly (30 ÷ 2 = 15 frames per tile). Speed 7 would not (30 ÷ 7 = 4.28...).

## MOVING TILE BY TILE 🚶

The movement function runs every frame. It does three things:

1. **Check if at tile center** - if yes, pick a new direction
2. **Check if at destination** - if yes, stop
3. **Move** in the current direction

```js
function movePlayer() {
    if (!player.moving) return;

    // A 12px hero centered in a 30px tile has x offset of (30-12)/2 = 9
    const CENTER = (TILE_SIZE - player.width) / 2;
    const atCenter = player.x % TILE_SIZE === CENTER &&
                     player.y % TILE_SIZE === CENTER;

    if (atCenter) {
        // Snap tile coordinates from pixel position
        player.tileX = Math.floor(player.x / TILE_SIZE);
        player.tileY = Math.floor(player.y / TILE_SIZE);

        if (player.tileX === player.targetTileX && player.tileY === player.targetTileY) {
            player.moving = false; // arrived!
            return;
        }

        // Greedy direction choice: close horizontal gap first, then vertical
        player.dirX = 0;
        player.dirY = 0;

        if (player.tileX < player.targetTileX && isWalkable(player.tileX + 1, player.tileY)) {
            player.dirX = 1;
        } else if (player.tileX > player.targetTileX && isWalkable(player.tileX - 1, player.tileY)) {
            player.dirX = -1;
        } else if (player.tileY < player.targetTileY && isWalkable(player.tileX, player.tileY + 1)) {
            player.dirY = 1;
        } else if (player.tileY > player.targetTileY && isWalkable(player.tileX, player.tileY - 1)) {
            player.dirY = -1;
        } else {
            player.moving = false; // can't reach target from here
            return;
        }
    }

    // Move in chosen direction
    player.x += player.dirX * player.speed;
    player.y += player.dirY * player.speed;
    player.sprite.x = player.x;
    player.sprite.y = player.y;
}
```

The modulo check `player.x % TILE_SIZE === CENTER` is the trick. Since the hero starts at a tile center (x=39 for tile 1, where 39 % 30 = 9 = CENTER), and moves in 2px steps, it hits the next center (x=69, 69 % 30 = 9) after exactly 15 frames - and every tile center beyond that.

## THE PATHFINDING TRADE-OFF {{< icon name="map-trifold" >}}

This approach is called **greedy pathfinding**: always try to close the gap directly. It works well on open maps, but gets stuck when walls are in the way:

```text
H = hero, T = target, # = wall

. H . . . . .
. . . # . . .    ← hero tries to go right, hits wall, stops
. . . . T . .
```

The hero reaches the wall column and can't progress: going right hits the wall, going down/up doesn't reduce the horizontal gap, so it gives up.

The proper solution is **A\* pathfinding** (pronounced "A star") - an algorithm that finds the shortest route around any obstacle. The good news: the tile grid you already have is exactly the structure A\* needs. There are excellent JavaScript A\* libraries, and swapping out the direction-picking `if/else` block for an A\* path is straightforward when your map grows complex enough to need it.

For open maps, puzzle games, or games where the player can see obstacles before clicking, the greedy approach works fine - and it's much simpler to understand and debug.

**What you've built:**

- ✅ Mouse hover highlighting with a tile cursor
- ✅ Click-to-set-target that ignores wall clicks
- ✅ Tile-by-tile movement using modulo center detection
- ✅ Greedy pathfinding: close horizontal gap first, then vertical

**Next up**: Rotate the whole world 45 degrees. [Next: Isometric View](/tutorial/world-one/21-isometric-view/)
