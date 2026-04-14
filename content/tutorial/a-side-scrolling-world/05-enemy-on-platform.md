+++
title = "Enemy on Platform"
date = 2026-03-09T09:00:00+11:00
weight = 5
draft = false
slug = "enemy-on-platform"
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/a-side-scrolling-world/shoot-him/"
prev = "/tutorial/a-side-scrolling-world/moving-tiles/"
+++

A basic wall-bouncing enemy will walk off platform edges and fall. A platform-aware enemy checks for ground ahead before stepping forward and turns back if there is none. This tutorial adds that edge-detection logic to enemy movement.

{{< pixidemo title="Enemy on Platform" >}}
const app = new PIXI.Application();

await app.init({
    width: 300,
    height: 240,
    backgroundColor: 0x87CEEB
});

document.body.appendChild(app.canvas);

// Game constants
const TILE_SIZE = 30;
const GRAVITY = 0.8;
const JUMP_POWER = -15;

// Create a platformer map with edges
const map = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,1,0,0,0,0,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,0,0,0,0,0,0,1,1],
    [1,1,1,1,1,1,1,1,1,1]
];

// Platform-aware enemy types
const enemyTypes = {
    PLATFORM_PATROL: {
        color: 0x8A2BE2,     // Purple
        speed: 1,
        turnChance: 2,       // 2% chance per frame to turn randomly
        edgeDetection: true  // Won't fall off platforms
    },
    SMART_WANDERER: {
        color: 0x00CED1,     // Turquoise
        speed: 1.5,
        turnChance: 8,       // 8% chance to turn randomly
        edgeDetection: true
    }
};

// Enemy spawn positions
const enemySpawns = [
    { type: 'PLATFORM_PATROL', tileX: 2, tileY: 1 },
    { type: 'SMART_WANDERER', tileX: 7, tileY: 1 },
    { type: 'PLATFORM_PATROL', tileX: 2, tileY: 3 }
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
    velocityX: 0,
    velocityY: 0,
    speed: 2,
    jumpPower: JUMP_POWER,
    onGround: false,
    alive: true
};

// Enemy system
const enemies = [];

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

// Collision detection helpers
function isSolid(x, y) {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) {
        return true;
    }
    
    return map[row][col] === 1;
}

// Check if position would be in a wall
function wouldHitWall(x, y, width, height) {
    return isSolid(x, y) || isSolid(x + width, y) ||
           isSolid(x, y + height) || isSolid(x + width, y + height);
}

// Check if there's ground below position (for edge detection)
function hasGroundBelow(x, y, width, height) {
    const leftFoot = isSolid(x + 2, y + height + 1);
    const rightFoot = isSolid(x + width - 2, y + height + 1);
    return leftFoot || rightFoot;
}

// Create enemies
function createEnemies() {
    enemySpawns.forEach((spawn, index) => {
        const type = enemyTypes[spawn.type];
        const enemySprite = new PIXI.Graphics()
            .rect(0, 0, 10, 10)
            .fill(type.color)
            .stroke({width: 1, color: 0x000000});
        
        const enemy = {
            id: index,
            sprite: enemySprite,
            x: spawn.tileX * TILE_SIZE + (TILE_SIZE - 10) / 2,
            y: spawn.tileY * TILE_SIZE + (TILE_SIZE - 10) / 2,
            width: 10,
            height: 10,
            moveX: Math.random() < 0.5 ? -1 : 1,  // Start moving randomly left or right
            moveY: 0,
            speed: type.speed,
            turnChance: type.turnChance,
            edgeDetection: type.edgeDetection,
            type: spawn.type
        };
        
        enemy.sprite.x = enemy.x;
        enemy.sprite.y = enemy.y;
        app.stage.addChild(enemy.sprite);
        enemies.push(enemy);
    });
}

// Smart enemy AI with platform awareness
function updateEnemies() {
    enemies.forEach(enemy => {
        // Calculate next position
        const nextX = enemy.x + enemy.moveX * enemy.speed;
        const nextY = enemy.y + enemy.moveY * enemy.speed;
        
        let shouldTurn = false;
        
        // Check for wall collision
        if (wouldHitWall(nextX, nextY, enemy.width, enemy.height)) {
            shouldTurn = true;
        }
        
        // Platform edge detection
        if (enemy.edgeDetection && enemy.moveX !== 0) {
            const edgeCheckX = nextX + (enemy.moveX > 0 ? enemy.width : 0);
            if (!hasGroundBelow(edgeCheckX, nextY, 1, enemy.height)) {
                shouldTurn = true;
            }
        }
        
        // Random direction change (creates unpredictability)
        if (!shouldTurn && Math.random() * 100 < enemy.turnChance) {
            shouldTurn = true;
        }
        
        if (shouldTurn) {
            chooseNewDirection(enemy);
        } else {
            // Safe to move
            enemy.x = nextX;
            enemy.y = nextY;
        }
        
        // Update sprite position
        enemy.sprite.x = enemy.x;
        enemy.sprite.y = enemy.y;
        
        // Check collision with player
        if (player.alive && getDistance(enemy, player) < (enemy.width + player.width) / 2 + 2) {
            playerDie();
        }
    });
}

// Smart direction choosing
function chooseNewDirection(enemy) {
    if (enemy.edgeDetection) {
        // Edge-detecting enemies stay horizontal — vertical movement
        // would bypass the ground check and send them off platforms
        enemy.moveX = -enemy.moveX || (Math.random() < 0.5 ? -1 : 1);
        enemy.moveY = 0;
    } else if (enemy.moveX === 0) {
        // Was moving vertically, now try horizontal
        enemy.moveX = Math.random() < 0.5 ? -1 : 1;
        enemy.moveY = 0;
        const testX = enemy.x + enemy.moveX * enemy.speed;
        if (wouldHitWall(testX, enemy.y, enemy.width, enemy.height)) {
            enemy.moveX = -enemy.moveX;
        }
    } else {
        // Was moving horizontally, now try vertical
        enemy.moveX = 0;
        enemy.moveY = Math.random() < 0.5 ? -1 : 1;
        const testY = enemy.y + enemy.moveY * enemy.speed;
        if (wouldHitWall(enemy.x, testY, enemy.width, enemy.height)) {
            enemy.moveY = -enemy.moveY;
        }
    }
}

// Player physics (jumping platformer)
function updatePlayer() {
    if (!player.alive) return;
    
    // Horizontal movement
    if (keys['ArrowLeft']) {
        player.velocityX = -player.speed;
    } else if (keys['ArrowRight']) {
        player.velocityX = player.speed;
    } else {
        player.velocityX = 0;
    }
    
    // Jumping
    if (keys['Space'] && player.onGround) {
        player.velocityY = player.jumpPower;
        player.onGround = false;
    }
    
    // Apply gravity
    player.velocityY += GRAVITY;
    
    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Ground collision
    const groundCheck = isSolid(player.x + player.width/2, player.y + player.height + 1);
    if (groundCheck && player.velocityY > 0) {
        player.y = Math.floor((player.y + player.height) / TILE_SIZE) * TILE_SIZE - player.height;
        player.velocityY = 0;
        player.onGround = true;
    } else if (!groundCheck) {
        player.onGround = false;
    }
    
    // Ceiling collision
    if (isSolid(player.x + player.width/2, player.y) && player.velocityY < 0) {
        player.y = Math.ceil(player.y / TILE_SIZE) * TILE_SIZE;
        player.velocityY = 0;
    }
    
    // Keep player in bounds
    player.x = Math.max(0, Math.min(player.x, 300 - player.width));
    player.y = Math.max(0, player.y);
    
    // Update sprite position
    player.sprite.x = player.x;
    player.sprite.y = player.y;
}

// Utility functions
function getDistance(obj1, obj2) {
    const dx = (obj1.x + obj1.width/2) - (obj2.x + obj2.width/2);
    const dy = (obj1.y + obj1.height/2) - (obj2.y + obj2.height/2);
    return Math.sqrt(dx * dx + dy * dy);
}

function playerDie() {
    player.alive = false;
    player.sprite.tint = 0x666666;
    
    setTimeout(() => {
        player.alive = true;
        player.sprite.tint = 0xFFFFFF;
        player.x = 60;
        player.y = 180;
        player.velocityY = 0;
    }, 2000);
}

// Game loop
function gameLoop() {
    updatePlayer();
    updateEnemies();
}

// Initialize
createEnemies();
app.ticker.add(gameLoop);
{{< /pixidemo >}}


## Random Direction Changes

A `turnChance` percentage applied each frame creates variation between enemy types without adding new AI logic:

```javascript
const ENEMY_PERSONALITIES = {
    PREDICTABLE: { turnChance: 0 },   // Never turns randomly
    CAUTIOUS:    { turnChance: 3 },   // Rarely changes direction
    NORMAL:      { turnChance: 8 },   // Moderate unpredictability
    ERRATIC:     { turnChance: 20 },  // Frequently changes direction
};

// In the main AI loop:
if (!shouldTurn && Math.random() * 100 < enemy.turnChance) {
    shouldTurn = true;
}
```

The `chooseNewDirection` function (shown in the demo above) handles edge-detecting enemies differently from free-moving ones: edge-detecting enemies stay horizontal and simply reverse, while free-moving enemies can alternate between axes.

Next: [Shoot Him](/tutorial/a-side-scrolling-world/shoot-him/)

