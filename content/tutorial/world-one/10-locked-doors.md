+++
title = "Locked Doors"
date = 2026-03-24T00:00:00+11:00
weight = 10
draft = false
slug = "locked-doors"
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/world-one/pushing-tiles/"
prev = "/tutorial/world-one/open-the-door/"
+++

A door you can walk through is a transition. A door you have to *earn* is a puzzle. Locked doors are one of the oldest tricks in game design — find the key, open the way forward. Let's combine what you know about items and doors to build one.

{{< pixidemo title="Locked Doors" >}}
const app = new PIXI.Application();
await app.init({ width: 300, height: 240, backgroundColor: 0x1a1a2e });
document.body.appendChild(app.canvas);

const TILE_SIZE = 30;

const rooms = {
    1: {
        map: [
            [1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,1,0,0,0,0,1,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,1,1,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,1,0,0,0,0,1,0,4],
            [1,1,1,1,1,1,1,1,1,1]
        ]
    },
    2: {
        map: [
            [1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [3,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1]
        ]
    }
};

const doors = {
    2: { toRoom: 2, playerX: 1, playerY: 6, locked: false },
    3: { toRoom: 1, playerX: 8, playerY: 6, locked: false },
    4: { toRoom: 2, playerX: 1, playerY: 3, locked: true }
};

const game = { currentRoom: 1, tileSize: TILE_SIZE, hasKey: false };

const KEY_TILE = { tileX: 5, tileY: 2, room: 1 };
let keySprite = null;
let keyCollected = false;

const statusStyle = new PIXI.TextStyle({ fill: 0xFFFFFF, fontSize: 11, fontFamily: 'monospace' });
const statusDisplay = new PIXI.Text({ text: 'No key', style: statusStyle });
statusDisplay.x = 8;
statusDisplay.y = 8;

function buildMap() {
    app.stage.removeChildren();

    const map = rooms[game.currentRoom].map;
    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
            const t = map[row][col];
            let color = 0x4a3728;
            if (t === 0) color = 0x1a1a2e;
            else if (t === 2 || t === 3) color = 0x44bb44;
            else if (t === 4) color = game.hasKey ? 0x44bb44 : 0xcc4422;
            const tile = new PIXI.Graphics().rect(0, 0, TILE_SIZE, TILE_SIZE).fill(color);
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            app.stage.addChild(tile);
        }
    }

    if (game.currentRoom === KEY_TILE.room && !keyCollected) {
        keySprite = new PIXI.Graphics().circle(0, 0, 6).fill(0xFFD700);
        keySprite.x = KEY_TILE.tileX * TILE_SIZE + TILE_SIZE / 2;
        keySprite.y = KEY_TILE.tileY * TILE_SIZE + TILE_SIZE / 2;
        app.stage.addChild(keySprite);
    } else {
        keySprite = null;
    }

    app.stage.addChild(heroSprite);
    app.stage.addChild(statusDisplay);
    statusDisplay.text = game.hasKey ? 'Key: ✓' : 'No key';
}

const heroSprite = new PIXI.Graphics().rect(0, 0, 12, 12).fill(0xff4444);
const player = { x: 30, y: 150, width: 12, height: 12, speed: 2 };

function isSolid(x, y) {
    const map = rooms[game.currentRoom].map;
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) return true;
    const t = map[row][col];
    if (t === 4 && !game.hasKey) return true;
    return t === 1;
}

function checkEvents() {
    const map = rooms[game.currentRoom].map;
    const cx = Math.floor((player.x + player.width / 2) / TILE_SIZE);
    const cy = Math.floor((player.y + player.height / 2) / TILE_SIZE);

    // Key pickup
    if (!keyCollected && game.currentRoom === KEY_TILE.room &&
        cx === KEY_TILE.tileX && cy === KEY_TILE.tileY) {
        keyCollected = true;
        game.hasKey = true;
        if (keySprite) app.stage.removeChild(keySprite);
        statusDisplay.text = 'Key: ✓';
        // Redraw map so locked door turns green
        buildMap();
        player.sprite = heroSprite;
        app.stage.addChild(heroSprite);
        app.stage.addChild(statusDisplay);
    }

    // Door check
    const tileType = map[cy] && map[cy][cx];
    if (doors[tileType]) {
        const door = doors[tileType];
        if (door.locked && !game.hasKey) return;
        game.currentRoom = door.toRoom;
        player.x = door.playerX * TILE_SIZE;
        player.y = door.playerY * TILE_SIZE;
        buildMap();
    }
}

const keys = {};
window.addEventListener('keydown', e => { keys[e.code] = true; });
window.addEventListener('keyup', e => { keys[e.code] = false; });

function gameLoop() {
    let nx = player.x, ny = player.y;
    if (keys['ArrowLeft'])  nx -= player.speed;
    if (keys['ArrowRight']) nx += player.speed;
    if (keys['ArrowUp'])    ny -= player.speed;
    if (keys['ArrowDown'])  ny += player.speed;

    if (!isSolid(nx, player.y) && !isSolid(nx + player.width, player.y) &&
        !isSolid(nx, player.y + player.height) && !isSolid(nx + player.width, player.y + player.height))
        player.x = nx;
    if (!isSolid(player.x, ny) && !isSolid(player.x + player.width, ny) &&
        !isSolid(player.x, ny + player.height) && !isSolid(player.x + player.width, ny + player.height))
        player.y = ny;

    heroSprite.x = player.x;
    heroSprite.y = player.y;
    checkEvents();
}

buildMap();
app.ticker.add(gameLoop);
{{< /pixidemo >}}

The gold circle is the key. The red door on the right won't let you through until you've picked it up — then it turns green and you can pass. Try walking into it without the key first.

## THE KEY AS A SPECIAL ITEM

A key is just an item with a side effect: it sets a flag on your game state. Add `hasKey` to your `game` object alongside anything else you're tracking:

```js
const game = {
    currentRoom: 1,
    tileSize: 30,
    hasKey: false
};
```

The key sits in the world as a positioned object, exactly like a collectible from the previous tutorial. Check whether the player is on its tile each frame:

```js
const KEY_POS = { tileX: 5, tileY: 2, room: 1 };
let keyCollected = false;

function checkKeyPickup() {
    if (keyCollected) return;
    if (game.currentRoom !== KEY_POS.room) return;

    const cx = Math.floor((player.x + player.width / 2) / game.tileSize);
    const cy = Math.floor((player.y + player.height / 2) / game.tileSize);

    if (cx === KEY_POS.tileX && cy === KEY_POS.tileY) {
        keyCollected = true;
        game.hasKey = true;
        app.stage.removeChild(keySprite);
    }
}
```

## THE LOCKED DOOR TILE

In your map, use a new tile value for the locked door — say `4`. How you handle it depends on two things: whether the player can walk into it, and whether it triggers a room transition.

**Block movement when locked:**

```js
function isSolid(x, y) {
    const col = Math.floor(x / game.tileSize);
    const row = Math.floor(y / game.tileSize);
    const t = rooms[game.currentRoom].map[row][col];

    if (t === 4 && !game.hasKey) return true;  // Locked door is a wall
    return t === 1;
}
```

This is the whole trick. When `hasKey` is false, tile `4` behaves like a wall. When it's true, the player can walk through it and the normal door-transition logic takes over.

**Mark the door in your doors table:**

```js
const doors = {
    2: { toRoom: 2, playerX: 1, playerY: 4, locked: false },
    4: { toRoom: 2, playerX: 1, playerY: 4, locked: true  }  // Requires key
};
```

**Transition logic with key check:**

```js
function checkDoors() {
    const map = rooms[game.currentRoom].map;
    const cx = Math.floor((player.x + player.width / 2) / game.tileSize);
    const cy = Math.floor((player.y + player.height / 2) / game.tileSize);
    const tileType = map[cy][cx];
    const door = doors[tileType];

    if (!door) return;
    if (door.locked && !game.hasKey) return;  // Blocked

    // Consume the key on use
    if (door.locked) game.hasKey = false;

    game.currentRoom = door.toRoom;
    player.x = door.playerX * game.tileSize;
    player.y = door.playerY * game.tileSize;
    buildMap();
}
```

The key is consumed (`game.hasKey = false`) when the door is used. That's optional — some games let one key open many doors, others are single-use. It's a design decision, not a technical one.

## VISUAL FEEDBACK

A locked door that looks the same as an open one is confusing. The simplest approach is to render tile `4` differently depending on game state:

```js
function renderTile(tileType, col, row) {
    let color;
    if (tileType === 1) {
        color = 0x4a3728;           // Wall
    } else if (tileType === 2) {
        color = 0x44bb44;           // Open door (green)
    } else if (tileType === 4) {
        color = game.hasKey
            ? 0x44bb44              // Unlocked (green)
            : 0xcc4422;            // Locked (red)
    } else {
        color = 0x1a1a2e;           // Floor
    }
    // ... draw tile
}
```

Call `buildMap()` after the player picks up the key so the door redraws immediately. That instant colour change gives the player a clear signal that something has changed.

## KEEPING ITEMS ACROSS ROOMS

Now that items and doors exist in the same world, you need to persist item state when the player moves between rooms. Add this to your `changeMap` function:

```js
function changeMap(newRoom) {
    // Snapshot which items are still uncollected before leaving
    myItems[game.currentRoom] = [...activeItems.values()].map(
        item => [item.type, item.tileX, item.tileY]
    );

    activeItems.forEach(item => app.stage.removeChild(item.sprite));
    activeItems.clear();

    game.currentRoom = newRoom;
    buildMap();
}
```

This rebuilds `myItems[currentRoom]` from whatever is still in `activeItems`. Anything collected is gone from there, so it won't reappear when the player returns.

**Next up**: [Pushing Tiles](/tutorial/world-one/pushing-tiles/) — make tiles in the world movable.
