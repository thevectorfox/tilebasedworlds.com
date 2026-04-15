+++
title = "Getting Items"
date = 2026-03-09T11:00:00+11:00
weight = 8
draft = false
slug = "getting-items"
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/world-one/open-the-door/"
prev = "/tutorial/world-one/hit-the-wall/"
+++

Collectibles are a staple of tile-based games — coins in Mario, rupees in Zelda, rings in Sonic. The pickup system needs to do three things: track what items exist and where, detect when the player steps on one, and remove it permanently so it doesn't reappear.

{{< pixidemo title="Getting Items" >}}
const app = new PIXI.Application();
await app.init({ width: 300, height: 240, backgroundColor: 0x1a1a2e });

const TILE_SIZE = 30;

const map = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,0,0,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,1,1,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,0,0,0,1,0,1],
    [1,1,1,1,1,1,1,1,1,1]
];

for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
        if (map[row][col] === 1) {
            const tile = new PIXI.Graphics().rect(0, 0, TILE_SIZE, TILE_SIZE).fill(0x4a3728);
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            app.stage.addChild(tile);
        }
    }
}

const ITEM_TYPES = {
    1: { points: 1,  color: 0xFFD700, size: 5 },
    2: { points: 10, color: 0x00BFFF, size: 4 }
};

const game = { currentRoom: 1, tileSize: TILE_SIZE, points: 0 };

const myItems = [
    [],
    [[1,2,1],[1,5,1],[1,7,1],[2,1,3],[2,8,3],[1,3,5],[1,6,5],[2,4,6]]
];

const activeItems = new Map();

const pointsStyle = new PIXI.TextStyle({ fill: 0xFFFFFF, fontSize: 12, fontFamily: 'monospace' });
const pointsDisplay = new PIXI.Text({ text: 'Points: 0', style: pointsStyle });
pointsDisplay.x = 8;
pointsDisplay.y = 8;

function buildItems() {
    activeItems.forEach(item => app.stage.removeChild(item.sprite));
    activeItems.clear();

    for (const [type, tileX, tileY] of myItems[game.currentRoom]) {
        const itemType = ITEM_TYPES[type];
        const sprite = new PIXI.Graphics().circle(0, 0, itemType.size).fill(itemType.color);
        sprite.x = tileX * TILE_SIZE + TILE_SIZE / 2;
        sprite.y = tileY * TILE_SIZE + TILE_SIZE / 2;
        app.stage.addChild(sprite);
        activeItems.set(`${tileX}_${tileY}`, { sprite, type, tileX, tileY, pointValue: itemType.points });
    }

    app.stage.addChild(pointsDisplay);
}

const heroSprite = new PIXI.Graphics().rect(0, 0, 12, 12).fill(0xff4444);
const player = { sprite: heroSprite, x: 30, y: 30, width: 12, height: 12, speed: 2 };
app.stage.addChild(heroSprite);

function isSolid(x, y) {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) return true;
    return map[row][col] === 1;
}

function checkItemPickup() {
    const tileX = Math.floor((player.x + player.width / 2) / TILE_SIZE);
    const tileY = Math.floor((player.y + player.height / 2) / TILE_SIZE);
    const item = activeItems.get(`${tileX}_${tileY}`);

    if (item) {
        game.points += item.pointValue;
        pointsDisplay.text = `Points: ${game.points}`;
        app.stage.removeChild(item.sprite);
        activeItems.delete(`${tileX}_${tileY}`);
        myItems[game.currentRoom] = myItems[game.currentRoom].filter(
            ([, tx, ty]) => !(tx === item.tileX && ty === item.tileY)
        );
        player.sprite.tint = 0xFFFFAA;
        setTimeout(() => { player.sprite.tint = 0xFFFFFF; }, 120);
    }
}

const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

function gameLoop() {
    let newX = player.x;
    let newY = player.y;
    if (keys['ArrowLeft'])  newX -= player.speed;
    if (keys['ArrowRight']) newX += player.speed;
    if (keys['ArrowUp'])    newY -= player.speed;
    if (keys['ArrowDown'])  newY += player.speed;

    if (!isSolid(newX, player.y) && !isSolid(newX + player.width, player.y) &&
        !isSolid(newX, player.y + player.height) && !isSolid(newX + player.width, player.y + player.height)) {
        player.x = newX;
    }
    if (!isSolid(player.x, newY) && !isSolid(player.x + player.width, newY) &&
        !isSolid(player.x, newY + player.height) && !isSolid(player.x + player.width, newY + player.height)) {
        player.y = newY;
    }

    player.sprite.x = player.x;
    player.sprite.y = player.y;
    checkItemPickup();
}

buildItems();
app.ticker.add(gameLoop);

document.body.appendChild(app.canvas);
{{< /pixidemo >}}

Items are different in what they do - coins add a little to your score, gems are worth ten times more. That's the same trick games use to reward you for exploring off the beaten path. In this tutorial all items just give points, but the same pattern works for health potions, ammo pickups, power-ups, or anything else you want to create!

## Tracking your score

Add a `points` property to your `game` object:

```js
const game = {
    currentRoom: 1,
    tileSize: 30,
    points: 0    // Score lives here, safe across all rooms
};
```

To show the score on screen, use a PixiJS `Text` object positioned in the top-left corner, outside the tile area so walls can't cover it:

```js
import { Text, TextStyle } from 'https://unpkg.com/pixi.js@8.0.0/dist/pixi.min.mjs';

const pointsStyle = new TextStyle({ fill: 0xFFFFFF, fontSize: 14, fontFamily: 'monospace' });
const pointsDisplay = new Text({ text: 'Points: 0', style: pointsStyle });
pointsDisplay.x = 8;
pointsDisplay.y = 8;
app.stage.addChild(pointsDisplay);

// Call this whenever points change:
pointsDisplay.text = `Points: ${game.points}`;
```

## Something to pick up

Like enemies, items are stored in a data array - one sub-array per room. Each item is three numbers: `[type, tileX, tileY]`.

```js
// myItems[roomIndex] = [[type, tileX, tileY], ...]
const myItems = [
    [],                             // Room 0 - unused
    [[1,1,1],[1,1,2],[2,1,3]],     // Room 1: 3 items
    [[2,1,3],[2,6,3],[1,5,4]]      // Room 2: 3 items
];
```

Then define what each type looks like and what it's worth:

```js
// Item type definitions - add as many as you like!
const ITEM_TYPES = {
    1: { points: 1,  color: 0xFFD700, size: 5, label: 'coin' },  // Gold coin
    2: { points: 10, color: 0x00BFFF, size: 4, label: 'gem'  }   // Blue gem
};
```

The type number in `myItems` is the key into `ITEM_TYPES`. So `[2,6,3]` means "a gem (type 2) at tile column 6, row 3". Type 1 gives 1 point, type 2 gives 10.

## Placing items on the map

When you call `buildMap()`, loop through the items for the current room and create a PixiJS graphic for each one. Store everything in a JavaScript `Map` object keyed by tile position so you can do instant lookups during pickup checks.

```js
// Active items on screen: key = "tileX_tileY", value = item data + sprite
const activeItems = new Map();

function buildItems() {
    const roomItems = myItems[game.currentRoom];

    for (const [type, tileX, tileY] of roomItems) {
        const itemType = ITEM_TYPES[type];

        // Draw a colored circle for the item
        const sprite = new Graphics()
            .circle(0, 0, itemType.size)
            .fill(itemType.color);

        // Center it inside its tile
        sprite.x = tileX * game.tileSize + game.tileSize / 2;
        sprite.y = tileY * game.tileSize + game.tileSize / 2;

        app.stage.addChild(sprite);

        // Store by tile position for instant lookup
        const key = `${tileX}_${tileY}`;
        activeItems.set(key, { sprite, type, tileX, tileY, pointValue: itemType.points });
    }

    // Show current score (player may already have points from other rooms)
    pointsDisplay.text = `Points: ${game.points}`;
}
```

The key is just `"tileX_tileY"` - for example a gem at column 6, row 3 gets the key `"6_3"`. When the hero steps on that tile you can check `activeItems.get("6_3")` instantly, no looping required.

## Collecting items

Add this check at the end of your movement function. After every step, look up the player's current tile in `activeItems`:

```js
function checkItemPickup() {
    // Which tile is the center of the player on?
    const tileX = Math.floor((player.x + player.width / 2) / game.tileSize);
    const tileY = Math.floor((player.y + player.height / 2) / game.tileSize);

    const item = activeItems.get(`${tileX}_${tileY}`);

    if (item) {
        // Got one — add points and update display
        game.points += item.pointValue;
        pointsDisplay.text = `Points: ${game.points}`;

        // Remove the sprite from screen
        app.stage.removeChild(item.sprite);

        // Remove from the tracking map
        activeItems.delete(`${tileX}_${tileY}`);

        // Remove from source data so it won't respawn
        myItems[game.currentRoom] = myItems[game.currentRoom].filter(
            ([, tx, ty]) => !(tx === item.tileX && ty === item.tileY)
        );
    }
}
```

Each collected item needs to vanish from **three places**:

1. **The screen** → `app.stage.removeChild(item.sprite)`
2. **The active tracking map** → `activeItems.delete(key)`
3. **The source data** → filter it out of `myItems`

That third step is the critical one. Without it the item reappears every time the player re-enters the room!


**What you built:**

- Score tracking in the `game` object, updated on pickup
- Multiple item types defined in a single lookup table
- Instant pickup detection via tile-position Map key
- Permanent removal from screen, tracking Map, and source data

Items don't have to give points. The same pattern works for health pickups, ammo, power-ups, or anything else — the item type definition determines the effect.

**Next up**: [Open the Door](/tutorial/world-one/open-the-door/) — build a multi-room world your items can live across.
