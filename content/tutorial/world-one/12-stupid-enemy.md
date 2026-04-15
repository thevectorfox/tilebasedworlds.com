+++
title = "Stupid Enemy"
date = 2026-03-09T08:00:00+11:00
weight = 12
draft = false
slug = "stupid-enemy"
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/world-one/bringing-it-together/"
prev = "/tutorial/world-one/pushing-tiles/"
+++

A wall-bouncing enemy is the simplest moving threat: each frame, advance by `moveX`/`moveY`; if the next position hits a solid tile, reverse direction. That's the entire AI.

{{< pixidemo title="Stupid Enemy" >}}
const app = new PIXI.Application();

await app.init({
    width: 300,
    height: 240,
    backgroundColor: 0x87CEEB
});

document.body.appendChild(app.canvas);

// Game constants
const TILE_SIZE = 30;

// Create a map with platforms for enemies to patrol
const map = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,0,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,0,0,0,0,0,0,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1]
];

// Enemy definitions - different types with different behaviors
const enemyTypes = {
    HORIZONTAL: {
        color: 0x8A2BE2,
        moveX: 1,
        moveY: 0,
        speed: 1
    },
    VERTICAL: {
        color: 0x8A2BE2,
        moveX: 0,
        moveY: 1,
        speed: 1
    }
};

// Enemy spawn data for this level
const enemySpawns = [
    { type: 'HORIZONTAL', x: 2, y: 3 },
    { type: 'VERTICAL', x: 8, y: 1 },
    { type: 'HORIZONTAL', x: 1, y: 5 }
];

// Create map display
const mapContainer = new PIXI.Container();
app.stage.addChild(mapContainer);

for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
        if (map[row][col] === 1) {
            const tile = new PIXI.Graphics()
                .rect(0, 0, TILE_SIZE, TILE_SIZE)
                .fill(0x8B4513);
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            mapContainer.addChild(tile);
        }
    }
}

// Create hero
const hero = new PIXI.Graphics()
    .rect(0, 0, 12, 12)
    .fill(0xff4444);
hero.x = 60;
hero.y = 180;
app.stage.addChild(hero);

// Hero object
const player = {
    sprite: hero,
    x: 60,
    y: 180,
    width: 12,
    height: 12,
    speed: 2,
    alive: true
};

// Enemy system
const enemies = [];

// Create enemies from spawn data
function createEnemies() {
    enemySpawns.forEach((spawn, index) => {
        const type = enemyTypes[spawn.type];
        const enemySprite = new PIXI.Graphics()
            .rect(0, 0, 10, 10)
            .fill(type.color);
        
        const enemy = {
            id: index,
            sprite: enemySprite,
            x: spawn.x * TILE_SIZE + TILE_SIZE/2 - 5,
            y: spawn.y * TILE_SIZE + TILE_SIZE/2 - 5,
            width: 10,
            height: 10,
            moveX: type.moveX,
            moveY: type.moveY,
            speed: type.speed,
            type: spawn.type
        };
        
        enemy.sprite.x = enemy.x;
        enemy.sprite.y = enemy.y;
        app.stage.addChild(enemy.sprite);
        enemies.push(enemy);
    });
}

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; e.preventDefault(); });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

// Collision detection
function isSolid(x, y) {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) return true;
    return map[row][col] === 1;
}

function wouldHitWall(x, y, width, height) {
    return isSolid(x, y) || isSolid(x + width, y) ||
           isSolid(x, y + height) || isSolid(x + width, y + height);
}

// Update player
function updatePlayer() {
    if (!player.alive) return;
    
    let newX = player.x;
    let newY = player.y;
    
    if (keys['ArrowLeft'])  newX -= player.speed;
    if (keys['ArrowRight']) newX += player.speed;
    if (keys['ArrowUp'])    newY -= player.speed;
    if (keys['ArrowDown'])  newY += player.speed;
    
    if (!wouldHitWall(newX, player.y, player.width, player.height)) player.x = newX;
    if (!wouldHitWall(player.x, newY, player.width, player.height)) player.y = newY;
    
    player.x = Math.max(0, Math.min(player.x, 300 - player.width));
    player.y = Math.max(0, Math.min(player.y, 240 - player.height));
    
    player.sprite.x = player.x;
    player.sprite.y = player.y;
}

// Enemy movement
function updateEnemies() {
    enemies.forEach(enemy => {
        const nextX = enemy.x + enemy.moveX * enemy.speed;
        const nextY = enemy.y + enemy.moveY * enemy.speed;
        
        if (wouldHitWall(nextX, nextY, enemy.width, enemy.height)) {
            enemy.moveX = -enemy.moveX;
            enemy.moveY = -enemy.moveY;
        } else {
            enemy.x = nextX;
            enemy.y = nextY;
        }
        
        enemy.sprite.x = enemy.x;
        enemy.sprite.y = enemy.y;
        
        // AABB collision with player
        if (player.alive &&
            enemy.x < player.x + player.width  && enemy.x + enemy.width  > player.x &&
            enemy.y < player.y + player.height && enemy.y + enemy.height > player.y) {
            playerDie();
        }
    });
}

// Game over
function playerDie() {
    player.alive = false;
    player.sprite.tint = 0x666666;
    
    setTimeout(() => {
        player.alive = true;
        player.sprite.tint = 0xFFFFFF;
        player.x = 60;
        player.y = 180;
    }, 2000);
}

// Game loop
function gameLoop() {
    updatePlayer();
    updateEnemies();
}

// Initialize and start
createEnemies();
app.ticker.add(gameLoop);
{{< /pixidemo >}}

## Why simple enemies work

Pac-Man's ghosts use simple chase and scatter rules. Mario's Goombas walk in straight lines. Space Invaders move in formation. None of these are complex behaviours, but all of them create spatial and timing challenges for the player.

Predictable patterns are fair — players can learn them and improve. Simple movement is also cheap to compute, so you can run large numbers of enemies without performance concerns. The challenge in enemy design comes almost entirely from placement, not from the AI itself.

## Enemy type definitions

Store enemy properties in a lookup object, one entry per type:

```js
const ENEMY_TYPES = {
    HORIZONTAL_PATROL: {
        color: 0x8A2BE2,
        moveX: 1,   // Moves right initially
        moveY: 0,
        speed: 1,
        size: 10
    },
    VERTICAL_PATROL: {
        color: 0x00CED1,
        moveX: 0,
        moveY: 1,   // Moves down initially
        speed: 1,
        size: 10
    },
    FAST_HORIZONTAL: {
        color: 0x32CD32,
        moveX: 1,
        moveY: 0,
        speed: 2,
        size: 8
    }
};
```

Store spawn positions separately — one per-level array describing which type appears at which tile:

```js
const levelEnemies = {
    1: [
        { type: 'HORIZONTAL_PATROL', tileX: 2, tileY: 1 },
        { type: 'VERTICAL_PATROL',   tileX: 8, tileY: 1 },
        { type: 'FAST_HORIZONTAL',   tileX: 1, tileY: 5 }
    ]
};
```

## Spawning enemies

Convert spawn data to live enemy objects and add them to the stage:

```js
const enemies = [];

function createEnemy(typeName, tileX, tileY) {
    const type = ENEMY_TYPES[typeName];
    if (!type) return;

    const sprite = new PIXI.Graphics()
        .rect(0, 0, type.size, type.size)
        .fill(type.color);

    const enemy = {
        sprite,
        type: typeName,
        x: tileX * TILE_SIZE + (TILE_SIZE - type.size) / 2,
        y: tileY * TILE_SIZE + (TILE_SIZE - type.size) / 2,
        width:  type.size,
        height: type.size,
        moveX: type.moveX,
        moveY: type.moveY,
        speed: type.speed
    };

    sprite.x = enemy.x;
    sprite.y = enemy.y;
    app.stage.addChild(sprite);
    enemies.push(enemy);
}
```

## Enemy movement

Each frame: calculate next position, check for a wall, reverse direction if blocked, otherwise move:

```js
function updateEnemies() {
    enemies.forEach(enemy => {
        const nextX = enemy.x + enemy.moveX * enemy.speed;
        const nextY = enemy.y + enemy.moveY * enemy.speed;

        if (wouldHitWall(nextX, nextY, enemy.width, enemy.height)) {
            // Reverse on the same axis
            enemy.moveX = -enemy.moveX;
            enemy.moveY = -enemy.moveY;
        } else {
            enemy.x = nextX;
            enemy.y = nextY;
        }

        enemy.sprite.x = enemy.x;
        enemy.sprite.y = enemy.y;
    });
}
```

The direction vector (`moveX`, `moveY`) starts at `(1, 0)` for a horizontal patroller. On hitting a wall it becomes `(-1, 0)`, then `(1, 0)` again. The enemy oscillates between its two boundary walls indefinitely.

## Player collision

Check AABB overlap between each enemy and the player after positions are updated:

```js
function checkEnemyPlayerCollision(enemy) {
    if (!player.alive) return;

    const hit = enemy.x < player.x + player.width  &&
                enemy.x + enemy.width  > player.x  &&
                enemy.y < player.y + player.height &&
                enemy.y + enemy.height > player.y;

    if (hit) handlePlayerHit();
}

function handlePlayerHit() {
    player.alive = false;
    player.sprite.tint = 0x666666;

    setTimeout(() => {
        player.alive = true;
        player.sprite.tint = 0xFFFFFF;
        player.x = 60;
        player.y = 180;
    }, 1500);
}
```

AABB (axis-aligned bounding box) tests whether two rectangles overlap. It's more accurate for rectangular sprites than a circular distance check and avoids the `Math.sqrt` call.

## Game loop integration

```js
function gameLoop() {
    handleInput();
    updateEnemies();
    updatePhysics();
}

app.ticker.add(gameLoop);
```

**What you built:**

- Enemy type definitions with movement direction and speed
- A spawning function that converts tile coordinates to pixel positions
- Wall-reversal movement: advance, check for solid tile, reverse if blocked
- AABB collision detection between enemies and the player

[Next: Bringing it Together](/tutorial/world-one/bringing-it-together/)
