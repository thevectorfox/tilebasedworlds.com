+++
title = "Getting Items"
date = 2026-03-09T11:00:00+11:00
weight = 9
draft = false
slug = "getting-items"
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/world-one/pushing-tiles/"
prev = "/tutorial/world-one/open-the-door/"
+++

Time to get rewarded! 🌟 Collectibles are the heartbeat of so many classic games - coins in Mario, rupees in Zelda, rings in Sonic. That satisfying *ding* when your score ticks up? Pure dopamine. Let's build that item pickup system!

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
const player = { sprite: heroSprite, x: 60, y: 180, width: 12, height: 12, speed: 2 };
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

We'll start from the multi-room setup in the [Open the Door](/tutorial/world-one/08-open-the-door/) tutorial so we're not buried in unrelated code.

## TRACKING YOUR SCORE 💰

Add a `points` property to your `game` object. Storing it here means the score survives room transitions - the player doesn't lose their hard-earned coins just by walking through a door.

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

## SOMETHING TO PICK UP 🪙💎

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

The type number in `myItems` is the key into `ITEM_TYPES`. So `[2,6,3]` means "a gem (type 2) at tile column 6, row 3". Type 1 gives 1 point, type 2 gives 10 - go hunt those gems!

## PLACING ITEMS ON THE MAP 🗺️

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

## COLLECTING ITEMS 🎯

Add this check at the end of your movement function. After every step, look up the player's current tile in `activeItems`:

```js
function checkItemPickup() {
    // Which tile is the center of the player on?
    const tileX = Math.floor((player.x + player.width / 2) / game.tileSize);
    const tileY = Math.floor((player.y + player.height / 2) / game.tileSize);

    const item = activeItems.get(`${tileX}_${tileY}`);

    if (item) {
        // 🎉 Got one! Add points and update display
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

## KEEPING ITEMS GONE WHEN YOU LEAVE 🚪

When the player uses a door, save the current state of the room's items before building the new one. Add this to the start of your `changeMap` function:

```js
function changeMap(newRoom) {
    // Save which items are still uncollected on the current map
    myItems[game.currentRoom] = [...activeItems.values()].map(
        item => [item.type, item.tileX, item.tileY]
    );

    // Remove item sprites from the old room
    activeItems.forEach(item => app.stage.removeChild(item.sprite));
    activeItems.clear();

    // Switch rooms and rebuild
    game.currentRoom = newRoom;
    buildMap();
}
```

This rebuilds `myItems[currentRoom]` from whatever's still in `activeItems`. Anything already collected won't be in there, so it won't come back. Return to any room and you'll find it exactly as you left it!

## SIDE-SCROLLING ITEMS: PLATFORM PICKUPS 🏃‍♂️

The same system works perfectly in a side-scrolling platformer. Here's the complete picture - jumping, enemies, shooting, and now items all together:

{{< pixidemo title="Platform Items" >}}
const app = new PIXI.Application();
await app.init({ width: 300, height: 240, backgroundColor: 0x87CEEB });
document.body.appendChild(app.canvas);

const TILE_SIZE = 30;
const GRAVITY = 0.6;

const map = [
    [1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,0,0,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [1,1,0,0,1,1,0,0,1,1],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
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

const ITEM_TYPES = {
    1: { points: 1,  color: 0xFFD700, size: 5 },
    2: { points: 10, color: 0x00BFFF, size: 4 }
};

const game = { currentRoom: 1, tileSize: TILE_SIZE, points: 0 };

const myItems = [
    [],
    [[1,1,0],[2,3,0],[1,5,0],[2,7,0],[1,2,1],[1,6,1],[2,4,3],[1,0,3],[1,8,3]]
];

const activeItems = new Map();

const pointsStyle = new PIXI.TextStyle({ fill: 0x000000, fontSize: 11, fontFamily: 'monospace' });
const pointsDisplay = new PIXI.Text({ text: 'Points: 0', style: pointsStyle });
pointsDisplay.x = 8;
pointsDisplay.y = 8;

function buildItems() {
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
app.stage.addChild(heroSprite);

const player = {
    sprite: heroSprite,
    x: 60, y: 180,
    width: 12, height: 12,
    velocityX: 0, velocityY: 0,
    speed: 2, jumpPower: -10,
    onGround: false,
    lastDirection: { x: 1, y: 0 },
    lastShot: 0, shootCooldown: 350
};

const bullets = [];
const enemies = [];

// Spawn some enemies
for (let i = 0; i < 3; i++) {
    const s = new PIXI.Graphics().rect(0, 0, 10, 10).fill(0x8A2BE2);
    app.stage.addChild(s);
    enemies.push({ sprite: s, x: 120 + i * 60, y: 60 + i * 30, width: 10, height: 10, active: true });
}

function isSolid(x, y) {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    return row >= 0 && row < map.length && col >= 0 && col < map[0].length && map[row][col] === 1;
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
        player.sprite.tint = 0xFFFFAA;
        setTimeout(() => { player.sprite.tint = 0xFFFFFF; }, 120);
    }
}

const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

function gameLoop() {
    // Input
    if (keys['ArrowLeft']) { player.velocityX = -player.speed; player.lastDirection = { x: -1, y: 0 }; }
    else if (keys['ArrowRight']) { player.velocityX = player.speed; player.lastDirection = { x: 1, y: 0 }; }
    else { player.velocityX = 0; }

    if ((keys['Space'] || keys['ArrowUp']) && player.onGround) {
        player.velocityY = player.jumpPower;
        player.onGround = false;
    }

    if ((keys['ShiftLeft'] || keys['ShiftRight']) && Date.now() - player.lastShot > player.shootCooldown) {
        const bSprite = new PIXI.Graphics().rect(0, 0, 4, 4).fill(0xFFFF00);
        bSprite.x = player.x + player.width / 2;
        bSprite.y = player.y + player.height / 2;
        app.stage.addChild(bSprite);
        bullets.push({ sprite: bSprite, x: bSprite.x, y: bSprite.y, velocityX: player.lastDirection.x * 5, velocityY: 0, width: 4, height: 4 });
        player.lastShot = Date.now();
    }

    // Physics
    player.velocityY += GRAVITY;
    player.x += player.velocityX;
    player.y += player.velocityY;

    // Ground collision
    if (player.velocityY > 0 && isSolid(player.x + player.width / 2, player.y + player.height)) {
        player.y = Math.floor((player.y + player.height) / TILE_SIZE) * TILE_SIZE - player.height;
        player.velocityY = 0;
        player.onGround = true;
    } else {
        player.onGround = false;
    }
    if (player.velocityY < 0 && isSolid(player.x + player.width / 2, player.y)) {
        player.y = Math.ceil(player.y / TILE_SIZE) * TILE_SIZE;
        player.velocityY = 0;
    }

    player.x = Math.max(0, Math.min(player.x, 288));
    player.y = Math.max(0, player.y);
    player.sprite.x = player.x;
    player.sprite.y = player.y;
    checkItemPickup();

    // Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.velocityX;
        b.sprite.x = b.x;
        if (isSolid(b.x, b.y) || b.x < 0 || b.x > 300) {
            app.stage.removeChild(b.sprite);
            bullets.splice(i, 1);
            continue;
        }
        for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            if (!e.active) continue;
            const dx = b.x - e.x, dy = b.y - e.y;
            if (Math.sqrt(dx*dx + dy*dy) < 9) {
                app.stage.removeChild(e.sprite);
                app.stage.removeChild(b.sprite);
                enemies.splice(j, 1);
                bullets.splice(i, 1);
                break;
            }
        }
    }

    enemies.forEach(e => { e.sprite.x = e.x; e.sprite.y = e.y; });
}

buildItems();
app.ticker.add(gameLoop);
{{< /pixidemo >}}

**🎉 Congratulations!** Your game world now has collectibles! Everything in this tutorial is the same pattern whether it's a top-down RPG or a side-scrolling platformer - the key idea is always: store items in a data array, render sprites for the current room, check tile position on every frame, and remove collected items from all three places.

**What you've built:**
- ✅ **Score tracking** that persists across room transitions
- ✅ **Multiple item types** with different point values
- ✅ **Instant pickup detection** using tile-position lookup
- ✅ **Permanent collection** - items don't respawn when you revisit rooms
- ✅ **Platform item pickups** working alongside jumping, enemies, and shooting

**What you've learned:** Items aren't just about score - they teach players to explore. Hidden gems reward curious players, scattered coins build a trail that guides beginners. How you place items is part of your game's design!

**Next up**: Ready to make your world feel alive? [Next: Moving Tiles](/tutorial/world-one/16-moving-tiles/)
