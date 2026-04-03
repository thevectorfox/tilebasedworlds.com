+++
title = "Pushing Tiles"
date = 2026-03-20T00:00:00+11:00
weight = 11
draft = false
slug = "pushing-tiles"
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/world-one/stupid-enemy/"
prev = "/tutorial/world-one/locked-doors/"
+++

{{< pixidemo title="Pushing Tiles" >}}
const app = new PIXI.Application();
await app.init({
    width: 300,
    height: 300,
    backgroundColor: 0x1a1a2e,
    antialias: true
});

document.body.appendChild(app.canvas);

const TILE_SIZE = 30;

// 0 = floor, 1 = wall, 3 = pushable block
const gameMap = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 3, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 3, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 3, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const tileLayer = new PIXI.Container();
app.stage.addChild(tileLayer);

function drawTile(type, col, row) {
    const g = new PIXI.Graphics();
    g.x = col * TILE_SIZE;
    g.y = row * TILE_SIZE;

    if (type === 1) {
        g.beginFill(0x00ff41);
        g.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
        g.endFill();
    } else if (type === 3) {
        g.beginFill(0x0a1a0a);
        g.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
        g.endFill();
        g.beginFill(0xe07820);
        g.drawRect(4, 4, TILE_SIZE - 8, TILE_SIZE - 8);
        g.endFill();
        g.lineStyle(1, 0xf0a040);
        g.drawRect(4, 4, TILE_SIZE - 8, TILE_SIZE - 8);
    } else {
        g.beginFill(0x0a1a0a);
        g.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
        g.lineStyle(1, 0x1a3a1a);
        g.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
        g.endFill();
    }

    return g;
}

function renderMap() {
    tileLayer.removeChildren();
    for (let row = 0; row < gameMap.length; row++) {
        for (let col = 0; col < gameMap[row].length; col++) {
            tileLayer.addChild(drawTile(gameMap[row][col], col, row));
        }
    }
}

renderMap();

// Hero
const heroSprite = new PIXI.Graphics();
heroSprite.beginFill(0xff4444);
heroSprite.drawRect(-7, -7, 14, 14);
heroSprite.endFill();
heroSprite.lineStyle(2, 0xffffff);
heroSprite.drawRect(-7, -7, 14, 14);
app.stage.addChild(heroSprite);

const hero = { tileX: 5, tileY: 7 };

function updateHeroSprite() {
    heroSprite.x = hero.tileX * TILE_SIZE + TILE_SIZE / 2;
    heroSprite.y = hero.tileY * TILE_SIZE + TILE_SIZE / 2;
}
updateHeroSprite();

function moveHero(dx, dy) {
    const nx = hero.tileX + dx;
    const ny = hero.tileY + dy;

    if (nx < 0 || ny < 0 || ny >= gameMap.length || nx >= gameMap[0].length) return;

    const tile = gameMap[ny][nx];

    if (tile === 0) {
        hero.tileX = nx;
        hero.tileY = ny;
        updateHeroSprite();
    } else if (tile === 3) {
        const bx = nx + dx;
        const by = ny + dy;
        const inBounds = bx >= 0 && by >= 0 && by < gameMap.length && bx < gameMap[0].length;
        if (inBounds && gameMap[by][bx] === 0) {
            gameMap[ny][nx] = 0;
            gameMap[by][bx] = 3;
            hero.tileX = nx;
            hero.tileY = ny;
            renderMap();
            updateHeroSprite();
        }
    }
}

window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    switch (e.code) {
        case 'ArrowUp':    moveHero(0, -1);  e.preventDefault(); break;
        case 'ArrowDown':  moveHero(0, 1);   e.preventDefault(); break;
        case 'ArrowLeft':  moveHero(-1, 0);  e.preventDefault(); break;
        case 'ArrowRight': moveHero(1, 0);   e.preventDefault(); break;
    }
});
{{< /pixidemo >}}

Walk into an orange block and it slides one tile in the direction you were moving — but only if the tile behind it is empty. Walk it into a wall and it stops. Walk it into a corner and it's stuck there permanently.

That last part is the puzzle.

## A NEW TILE TYPE

Everything so far has been binary: a tile is either a wall or it isn't. Pushable blocks introduce a third category — a tile that has solidity *and* behaviour. Add it to your map with a new value:

```js
// 0 = floor, 1 = wall, 3 = pushable block
const gameMap = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 3, 0, 0, 0, 0, 1],  // block at column 4
    // ...
];
```

Give it a distinct colour so players can read the map at a glance:

```js
function drawTile(type, col, row) {
    const g = new PIXI.Graphics();
    g.x = col * TILE_SIZE;
    g.y = row * TILE_SIZE;

    if (type === 1) {
        g.rect(0, 0, TILE_SIZE, TILE_SIZE).fill(0x4a3728);       // wall
    } else if (type === 3) {
        g.rect(0, 0, TILE_SIZE, TILE_SIZE).fill(0x0a1a0a);       // block shadow
        g.rect(4, 4, TILE_SIZE - 8, TILE_SIZE - 8).fill(0xe07820); // block face
    } else {
        g.rect(0, 0, TILE_SIZE, TILE_SIZE).fill(0x1a1a2e);       // floor
    }

    return g;
}
```

The inset inner square is a cheap way to make blocks look physical without needing sprites. The 4-pixel border on each side reads clearly at small tile sizes.

## LOOKING AHEAD

Movement into a wall is a dead stop. Movement into a pushable block is different: you need to check one tile *further* in the same direction to see if there's room.

The direction the player is moving is already encoded in `dx` and `dy`. Apply it twice — once to find the block, once to find where the block would land:

```js
function moveHero(dx, dy) {
    const nx = hero.tileX + dx;   // tile the hero wants to enter
    const ny = hero.tileY + dy;

    if (nx < 0 || ny < 0 || ny >= gameMap.length || nx >= gameMap[0].length) return;

    const tile = gameMap[ny][nx];

    if (tile === 0) {
        // Empty floor — move normally
        hero.tileX = nx;
        hero.tileY = ny;
        updateHeroSprite();

    } else if (tile === 3) {
        // Pushable block — check one tile further
        const bx = nx + dx;
        const by = ny + dy;

        const inBounds = bx >= 0 && by >= 0 && by < gameMap.length && bx < gameMap[0].length;

        if (inBounds && gameMap[by][bx] === 0) {
            // Room behind the block — push it
            gameMap[ny][nx] = 0;   // block's old tile becomes floor
            gameMap[by][bx] = 3;   // block's new tile becomes block
            hero.tileX = nx;
            hero.tileY = ny;
            renderMap();
            updateHeroSprite();
        }
        // If not, do nothing — the push fails silently
    }
    // Walls (tile === 1) are ignored entirely
}
```

The condition `gameMap[by][bx] === 0` is strict: only empty floor is a valid landing spot. A wall, another block, or the map boundary all cause the push to fail.

## UPDATING THE MAP

When a block moves, you're not animating a sprite across the screen — you're rewriting two cells in the map array and re-rendering.

```js
gameMap[ny][nx] = 0;   // where the block was
gameMap[by][bx] = 3;   // where the block is now
renderMap();
```

`renderMap()` clears the tile layer and redraws every tile from scratch. That's fine here because the map is small. For larger worlds you'd want to redraw only the affected tiles, but the principle is the same: the block is a number in a grid, and moving it means changing that number.

This is why tile-based games can represent complex interactive state with so little code. There are no separate physics objects, no position vectors to track. The map array *is* the game state.

## WHEN THE PUSH FAILS

A failed push produces no visible response — the player just doesn't move. That's intentional. In a puzzle context, the failure is the information: you can't push this block because something is in the way.

The consequence is permanent. There's no undo. Push a block into a corner and it's there for the rest of the session. That's where the puzzle design lives — placing blocks and walls so that careless pushes create unsolvable situations, and the player has to think before they act.

If you want to be kinder, you can reset the room to its original state when the player triggers a "restart" key. Store the initial map as a constant and copy it back:

```js
const initialMap = gameMap.map(row => [...row]);  // deep copy before any moves

function resetRoom() {
    for (let row = 0; row < gameMap.length; row++) {
        gameMap[row] = [...initialMap[row]];
    }
    renderMap();
    hero.tileX = 5;
    hero.tileY = 7;
    updateHeroSprite();
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyR') resetRoom();
    // ... movement keys
});
```

Whether you add a reset is a design choice. Without one, every push has weight.

**What you built:**

- A third tile type that acts like a wall but can be displaced
- A look-ahead check that uses the player's direction vector twice
- Map mutation as the mechanism for moving objects — no sprites, no physics
- A push that fails silently, which is where puzzle difficulty comes from

**Next up**: [Stupid Enemy](/tutorial/world-one/stupid-enemy/) — add a character that moves on its own.
