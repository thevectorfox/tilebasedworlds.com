+++
title = "Enemy on Platform"
date = 2026-03-09T09:00:00+11:00
weight = 13
draft = false
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/world-one/14-shoot-him/"
prev = "/tutorial/world-one/12-stupid-enemy/"
+++

Time to make your enemies SMART! 🧠 While basic wall-bouncing enemies are useful, platform-aware enemies that don't fall off edges create much more interesting and unpredictable gameplay. Think of the Goombas in Mario that patrol platforms, or the security robots in Mega Man that never fall into pits - these enemies feel more alive and create better spatial challenges!

<div id="platformDemo" style="text-align: center; margin: 20px 0;">
    <canvas id="platformCanvas" width="300" height="240" style="border: 2px solid #333; background: #87CEEB;"></canvas>
    <div style="margin-top: 10px;">
        <strong>Controls:</strong> Arrow Keys to move, Spacebar to jump<br>
        <strong>Watch:</strong> Purple enemies stay on platforms, turquoise ones patrol more randomly!
    </div>
</div>

<script type="module">
import { Application, Sprite, Container, Graphics, Ticker } from 'https://unpkg.com/pixi.js@8.0.0/dist/pixi.min.mjs';

const canvas = document.getElementById('platformCanvas');
const app = new Application();

await app.init({
    canvas: canvas,
    width: 300,
    height: 240,
    backgroundColor: 0x87CEEB
});

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
const mapContainer = new Container();
app.stage.addChild(mapContainer);

for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
        if (map[row][col] === 1) {
            const tile = new Graphics()
                .rect(0, 0, TILE_SIZE, TILE_SIZE)
                .fill(0x8B4513);
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            mapContainer.addChild(tile);
        }
    }
}

// Create hero
const hero = new Graphics()
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
        const enemySprite = new Graphics()
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
    // Was moving horizontally? Try vertical. Was vertical? Try horizontal.
    if (enemy.moveX === 0) {
        // Was moving vertically, now try horizontal
        enemy.moveX = Math.random() < 0.5 ? -1 : 1;
        enemy.moveY = 0;
        
        // Test if new direction is safe
        const testX = enemy.x + enemy.moveX * enemy.speed;
        const testY = enemy.y;
        
        if (wouldHitWall(testX, testY, enemy.width, enemy.height) ||
            (enemy.edgeDetection && !hasGroundBelow(testX, testY, enemy.width, enemy.height))) {
            enemy.moveX = -enemy.moveX; // Reverse if unsafe
        }
    } else {
        // Was moving horizontally, now try vertical
        enemy.moveX = 0;
        enemy.moveY = Math.random() < 0.5 ? -1 : 1;
        
        // Test if new direction is safe
        const testX = enemy.x;
        const testY = enemy.y + enemy.moveY * enemy.speed;
        
        if (wouldHitWall(testX, testY, enemy.width, enemy.height)) {
            enemy.moveY = -enemy.moveY; // Reverse if unsafe
        }
    }
    
    // Visual feedback when turning
    // enemy.sprite.tint = 0xFFFF99;
    setTimeout(() => {
        if (enemy.sprite) enemy.sprite.tint = 0xFFFFFF;
    }, 150);
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
</script>


## Smart Direction Changes: Adding Unpredictability 🎲

Basic edge detection is great, but predictable enemies get boring fast! Let's add intelligent direction changes that make enemies feel more alive:

<div id="smartEnemyDemo" style="text-align: center; margin: 20px 0;">
    <canvas id="smartCanvas" width="300" height="240" style="border: 2px solid #333; background: #87CEEB;"></canvas>
    <div style="margin-top: 10px;">
        <strong>Watch:</strong> These enemies change direction even without hitting walls!<br>
        Different colors = different AI personalities.
    </div>
</div>

<script type="module">
// Simplified demo for smart direction changes
const canvas2 = document.getElementById('smartCanvas');
const app2 = new Application();

await app2.init({
    canvas: canvas2,
    width: 300,
    height: 240,
    backgroundColor: 0x87CEEB
});

// Simple map
const map2 = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,1,0,0,0,0,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1]
];

// Draw map2
for (let row = 0; row < map2.length; row++) {
    for (let col = 0; col < map2[row].length; col++) {
        if (map2[row][col] === 1) {
            const tile = new Graphics().
                rect(0, 0, 30, 30).
                fill(0x8B4513);
            tile.x = col * 30;
            tile.y = row * 30;
            app2.stage.addChild(tile);
        }
    }
}

// Smart enemies with different personalities
const smartEnemies = [
    {
        sprite: new Graphics().rect(0, 0, 10, 10).fill(0x9370DB),
        x: 60, y: 60, moveX: 1, moveY: 0,
        turnChance: 3, personality: 'cautious'
    },
    {
        sprite: new Graphics().rect(0, 0, 10, 10).fill(0xFF6347),
        x: 120, y: 120, moveX: 0, moveY: 1,
        turnChance: 12, personality: 'erratic'
    },
    {
        sprite: new Graphics().rect(0, 0, 10, 10).fill(0x32CD32),
        x: 180, y: 60, moveX: -1, moveY: 0,
        turnChance: 7, personality: 'explorer'
    }
];

smartEnemies.forEach(enemy => {
    enemy.sprite.x = enemy.x;
    enemy.sprite.y = enemy.y;
    app2.stage.addChild(enemy.sprite);
});

// Smart AI with personality
function updateSmartEnemies() {
    smartEnemies.forEach(enemy => {
        const speed = 1;
        const nextX = enemy.x + enemy.moveX * speed;
        const nextY = enemy.y + enemy.moveY * speed;
        
        // Check walls
        const hitWall = nextX <= 30 || nextX >= 270 || nextY <= 30 || nextY >= 210 ||
                       (nextY >= 120 && nextY <= 150 && (nextX <= 90 || nextX >= 210));
        
        // Random direction change based on personality
        const randomTurn = Math.random() * 100 < enemy.turnChance;
        
        if (hitWall || randomTurn) {
            // Smart direction choosing
            if (enemy.moveX === 0) {
                enemy.moveX = Math.random() < 0.5 ? -1 : 1;
                enemy.moveY = 0;
            } else {
                enemy.moveX = 0;
                enemy.moveY = Math.random() < 0.5 ? -1 : 1;
            }
            
            // Brief flash when changing direction
            enemy.sprite.tint = 0xFFFF00;
            setTimeout(() => enemy.sprite.tint = 0xFFFFFF, 100);
        } else {
            enemy.x = nextX;
            enemy.y = nextY;
        }
        
        enemy.sprite.x = enemy.x;
        enemy.sprite.y = enemy.y;
    });
}

app2.ticker.add(updateSmartEnemies);
</script>

### Random Direction Algorithm

```javascript
// Enemy personalities through turn chance
const ENEMY_PERSONALITIES = {
    PREDICTABLE: { turnChance: 0 },   // Never turns randomly
    CAUTIOUS: { turnChance: 3 },      // Rarely changes direction
    NORMAL: { turnChance: 8 },        // Moderate unpredictability  
    ERRATIC: { turnChance: 20 },      // Frequently changes direction
    CHAOTIC: { turnChance: 80 }       // Almost always changing!
};

function chooseNewDirection(enemy) {
    // Smart direction logic: alternate between horizontal and vertical
    if (enemy.moveX === 0) {
        // Was moving vertically, now go horizontal
        enemy.moveX = Math.random() < 0.5 ? -1 : 1;
        enemy.moveY = 0;
        
        // Safety check: make sure new direction is valid
        if (wouldHitObstacle(enemy, enemy.moveX, 0)) {
            enemy.moveX = -enemy.moveX; // Try opposite direction
        }
    } else {
        // Was moving horizontally, now go vertical
        enemy.moveX = 0;
        enemy.moveY = Math.random() < 0.5 ? -1 : 1;
        
        if (wouldHitObstacle(enemy, 0, enemy.moveY)) {
            enemy.moveY = -enemy.moveY;
        }
    }
}

// Random turn check in main AI loop
function updateEnemyAI(enemy) {
    // ... normal movement and collision checks ...
    
    // Add unpredictability!
    const randomTurn = Math.random() * 100 < enemy.turnChance;
    if (randomTurn && !justTurned) {
        chooseNewDirection(enemy);
        enemy.justTurned = true; // Prevent immediate flip-flopping
        
        // Reset flag after a delay
        setTimeout(() => { enemy.justTurned = false; }, 500);
    }
}
```

**Why this creates better gameplay:**
- 🎯 **Unpredictable but fair**: Players can't memorize exact patterns
- 🎭 **Personality variety**: Different enemies feel distinct
- ⏳ **Spatial coverage**: Enemies explore more of the level
- 🤔 **Adaptive challenge**: Players must stay alert and reactive

## Complete Implementation Summary 🏆

**🔥 What you've built:**
- ✅ **Platform-aware enemies** that don't fall off edges
- ✅ **Smart direction changes** that create unpredictability
- ✅ **Personality-based AI** through simple turn chance parameters
- ✅ **Visual feedback** for direction changes and collisions
- ✅ **Performance-optimized** collision detection

**🎮 Gameplay impact:**
Your enemies now feel **intentional and alive** rather than mindlessly bouncing around. They patrol platforms like guards, explore areas like scouts, and create dynamic spatial challenges that keep players engaged.

**🚀 Performance tips:**
- Limit smart enemies to 3-5 per level for smooth gameplay
- Use different AI personalities to create variety without complexity
- Edge detection only for horizontal movement saves processing power

**Next up**: Time to give players a way to fight back against these smart enemies! [Next: Shoot Him](/tutorial/world-one/14-shoot-him/)
</script>

### Random Direction Algorithm

```javascript
// Enemy personalities through turn chance
const ENEMY_PERSONALITIES = {
    PREDICTABLE: { turnChance: 0 },   // Never turns randomly
    CAUTIOUS: { turnChance: 3 },      // Rarely changes direction
    NORMAL: { turnChance: 8 },        // Moderate unpredictability  
    ERRATIC: { turnChance: 20 },      // Frequently changes direction
    CHAOTIC: { turnChance: 80 }       // Almost always changing!
};

function chooseNewDirection(enemy) {
    // Smart direction logic: alternate between horizontal and vertical
    if (enemy.moveX === 0) {
        // Was moving vertically, now go horizontal
        enemy.moveX = Math.random() < 0.5 ? -1 : 1;
        enemy.moveY = 0;
        
        // Safety check: make sure new direction is valid
        if (wouldHitObstacle(enemy, enemy.moveX, 0)) {
            enemy.moveX = -enemy.moveX; // Try opposite direction
        }
    } else {
        // Was moving horizontally, now go vertical
        enemy.moveX = 0;
        enemy.moveY = Math.random() < 0.5 ? -1 : 1;
        
        if (wouldHitObstacle(enemy, 0, enemy.moveY)) {
            enemy.moveY = -enemy.moveY;
        }
    }
}

// Random turn check in main AI loop
function updateEnemyAI(enemy) {
    // ... normal movement and collision checks ...
    
    // Add unpredictability!
    const randomTurn = Math.random() * 100 < enemy.turnChance;
    if (randomTurn && !justTurned) {
        chooseNewDirection(enemy);
        enemy.justTurned = true; // Prevent immediate flip-flopping
        
        // Reset flag after a delay
        setTimeout(() => { enemy.justTurned = false; }, 500);
    }
}
```

**Why this creates better gameplay:**
- 🎯 **Unpredictable but fair**: Players can't memorize exact patterns
- 🎭 **Personality variety**: Different enemies feel distinct
- ⏳ **Spatial coverage**: Enemies explore more of the level
- 🤔 **Adaptive challenge**: Players must stay alert and reactive

