+++
title = "Isometric Mouse"
date = 2026-03-09T18:00:00+11:00
weight = 3
draft = false
slug = "isometric-mouse"
tags = ["advanced", "optimization", "tutorial"]
next = "/tutorial/the-quarter/isometric-scroll/"
prev = "/tutorial/the-quarter/isometric-view/"
+++

You know how to move in isometric. You know how to click-to-move. Now combine them. The tricky part isn't the movement — it's figuring out which diamond tile the mouse is actually over:

{{< pixidemo title="Isometric Mouse" >}}
const app = new PIXI.Application();
await app.init({ width: 300, height: 240, backgroundColor: 0x1a1a2e });
document.body.appendChild(app.canvas);

const TILE_SIZE = 30;
const OFFSET_X = 150;
const OFFSET_Y = 20;
const CENTER = (TILE_SIZE - 12) / 2; // 9px - center offset for 12px player in 30px tile

const map = [
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,0,1,0,1],
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

function screenToWorld(mx, my) {
    const relX = mx - OFFSET_X;
    const relY = my - OFFSET_Y;
    return {
        worldX: (relX + 2 * relY) / 2,
        worldY: (2 * relY - relX) / 2
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
        tile.x = screen.x - TILE_SIZE;
        tile.y = screen.y - TILE_SIZE / 2;
        tile.zIndex = worldX + worldY;
        app.stage.addChild(tile);
    }
}

// Diamond-shaped cursor highlight
const cursor = new PIXI.Graphics()
    .poly([30, 0, 60, 15, 30, 30, 0, 15])
    .fill({ color: 0xffff00, alpha: 0.4 });
cursor.visible = false;
cursor.zIndex = 9999;
app.stage.addChild(cursor);

// Target crosshair marker
const targetMarker = new PIXI.Graphics();
targetMarker.visible = false;
targetMarker.zIndex = 9999;
app.stage.addChild(targetMarker);

const heroSprite = new PIXI.Graphics()
    .poly([8, 0, 16, 4, 8, 8, 0, 4])
    .fill(0xff4444);
app.stage.addChild(heroSprite);

const player = {
    sprite: heroSprite,
    worldX: 1 * TILE_SIZE + CENTER, worldY: 1 * TILE_SIZE + CENTER,
    tileX: 1, tileY: 1,
    dirX: 0, dirY: 0,
    width: 12, height: 12,
    speed: 2,
    moving: false,
    targetTileX: 1, targetTileY: 1
};

// Sync sprite to initial position
const initScreen = isoToScreen(player.worldX, player.worldY);
player.sprite.x = initScreen.x - 8;
player.sprite.y = initScreen.y - 4;
player.sprite.zIndex = player.worldX + player.worldY + TILE_SIZE / 2;

function isWalkable(col, row) {
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) return false;
    return map[row][col] === 0;
}

let mouseCol = -1, mouseRow = -1;

app.canvas.addEventListener('mousemove', (e) => {
    const rect = app.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Convert screen position to world, then to tile
    const world = screenToWorld(mx, my);
    mouseCol = Math.round(world.worldX / TILE_SIZE);
    mouseRow = Math.round(world.worldY / TILE_SIZE);

    if (isWalkable(mouseCol, mouseRow)) {
        const screen = isoToScreen(mouseCol * TILE_SIZE, mouseRow * TILE_SIZE);
        cursor.x = screen.x - TILE_SIZE;
        cursor.y = screen.y - TILE_SIZE / 2;
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

    const screen = isoToScreen(mouseCol * TILE_SIZE, mouseRow * TILE_SIZE);
    const cx = screen.x;
    const cy = screen.y;
    targetMarker.clear()
        .moveTo(cx - 5, cy).lineTo(cx + 5, cy)
        .moveTo(cx, cy - 5).lineTo(cx, cy + 5)
        .stroke({ color: 0xffff00, width: 2 });
    targetMarker.visible = true;
});

function movePlayer() {
    if (!player.moving) return;

    const atCenter = player.worldX % TILE_SIZE === CENTER &&
                     player.worldY % TILE_SIZE === CENTER;

    if (atCenter) {
        player.tileX = Math.floor(player.worldX / TILE_SIZE);
        player.tileY = Math.floor(player.worldY / TILE_SIZE);

        if (player.tileX === player.targetTileX && player.tileY === player.targetTileY) {
            player.moving = false;
            targetMarker.visible = false;
            return;
        }

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
            player.moving = false;
            targetMarker.visible = false;
            return;
        }
    }

    player.worldX += player.dirX * player.speed;
    player.worldY += player.dirY * player.speed;

    const screen = isoToScreen(player.worldX, player.worldY);
    player.sprite.x = screen.x - 8;
    player.sprite.y = screen.y - 4;
    player.sprite.zIndex = player.worldX + player.worldY + TILE_SIZE / 2;
}

app.ticker.add(movePlayer);
{{< /pixidemo >}}

## THE CHALLENGE 🤔

In the previous mouse tutorial, converting a click to a tile was simple division:

```js
const tileCol = Math.floor(mx / TILE_SIZE);
const tileRow = Math.floor(my / TILE_SIZE);
```

In isometric, tiles are placed at angles. The same screen pixel could be in completely different logical tiles depending on whether you're looking at it as a row or column. Simple division doesn't work anymore.

The diamond tile that lives at logical position (2, 1) appears at a completely different screen location than the tile at (1, 2) — even though both might be at the same screen Y coordinate. You need to invert the `isoToScreen()` transform.

## INVERTING THE FORMULA 🔄

The forward transform is:

```js
screenX = (worldX - worldY) + OFFSET_X
screenY = (worldX + worldY) / 2 + OFFSET_Y
```

To invert it, solve for `worldX` and `worldY`. First, strip the offsets:

```js
relX = screenX - OFFSET_X  →  relX = worldX - worldY       ... (1)
relY = screenY - OFFSET_Y  →  relY = (worldX + worldY) / 2 ... (2)
```

Add equation (1) to `2 × equation (2)`:

```
relX + 2 × relY = (worldX - worldY) + (worldX + worldY) = 2 × worldX
∴ worldX = (relX + 2 × relY) / 2
```

Subtract equation (1) from `2 × equation (2)`:

```
2 × relY - relX = (worldX + worldY) - (worldX - worldY) = 2 × worldY
∴ worldY = (2 × relY - relX) / 2
```

In code:

```js
function screenToWorld(mx, my) {
    const relX = mx - OFFSET_X;
    const relY = my - OFFSET_Y;
    return {
        worldX: (relX + 2 * relY) / 2,
        worldY: (2 * relY - relX) / 2
    };
}
```

Then round `worldX / TILE_SIZE` and `worldY / TILE_SIZE` to get tile coordinates:

```js
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const world = screenToWorld(mx, my);
    mouseCol = Math.round(world.worldX / TILE_SIZE);
    mouseRow = Math.round(world.worldY / TILE_SIZE);
});
```

`Math.round` (not `Math.floor`) gives the nearest tile center, which feels right for isometric picking.

## THE DIAMOND CURSOR 🔶

A rectangular highlight rectangle looks wrong on diamond tiles. Draw the cursor as a diamond polygon matching the tile shape exactly:

```js
// Matches makeGroundTile() exactly - same polygon, just semi-transparent
const cursor = new PIXI.Graphics()
    .poly([30, 0, 60, 15, 30, 30, 0, 15])
    .fill({ color: 0xffff00, alpha: 0.4 });
cursor.zIndex = 9999; // always on top
app.stage.addChild(cursor);

canvas.addEventListener('mousemove', (e) => {
    // ... get mouseCol, mouseRow via screenToWorld() ...

    if (isWalkable(mouseCol, mouseRow)) {
        // Position using the same formula as regular tiles
        const screen = isoToScreen(mouseCol * TILE_SIZE, mouseRow * TILE_SIZE);
        cursor.x = screen.x - TILE_SIZE;
        cursor.y = screen.y - TILE_SIZE / 2;
        cursor.visible = true;
    } else {
        cursor.visible = false;
    }
});
```

The cursor polygon is identical to the ground tile polygon - it just snaps to the nearest valid tile as the mouse moves.

## THE MOVEMENT CODE 🚶

The tile-by-tile movement from tutorial 20 works unchanged in world space. `worldX % TILE_SIZE === CENTER` still detects tile centers, `dirX`/`dirY` still control horizontal/vertical movement - it's all the same. Only the final render step changes:

```js
function movePlayer() {
    // ... same atCenter check, same direction picking as tutorial 20 ...

    player.worldX += player.dirX * player.speed;
    player.worldY += player.dirY * player.speed;

    // Convert world position to isometric screen coords
    const screen = isoToScreen(player.worldX, player.worldY);
    player.sprite.x = screen.x - 8;  // center 16px sprite
    player.sprite.y = screen.y - 4;  // center 8px sprite
    player.sprite.zIndex = player.worldX + player.worldY + TILE_SIZE / 2;
}
```

The player visually glides diagonally along the isometric grid while internally moving on the flat world grid.

**What you've built:**

- ✅ `screenToWorld()` inverse transform derived from the forward formula
- ✅ Diamond-shaped tile cursor that snaps to the nearest tile
- ✅ Click-to-move that targets isometric tiles correctly
- ✅ Tile-by-tile movement adapted to render in isometric space

**Next up**: The iso world gets bigger than the screen. [Next: Isometric Scroll](/tutorial/world-one/23-isometric-scroll/)
