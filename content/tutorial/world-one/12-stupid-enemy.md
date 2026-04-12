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

Time to add some DANGER to your world! {{< icon name="alien" >}} A game without enemies is like a movie without conflict - technically possible, but nowhere near as exciting! You're about to breathe life into your levels with patrolling enemies that turn peaceful exploration into heart-pounding challenge. Even "stupid" enemies can create incredible tension and satisfaction!

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
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

// Collision detection
function isSolid(x, y) {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) {
        return true; // Treat out of bounds as solid
    }
    
    return map[row][col] === 1;
}

// Check if moving to position would hit wall
function wouldHitWall(x, y, width, height) {
    return isSolid(x, y) || isSolid(x + width, y) ||
           isSolid(x, y + height) || isSolid(x + width, y + height);
}

// Distance between two points
function distance(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Update player
function updatePlayer() {
    if (!player.alive) return;
    
    let newX = player.x;
    let newY = player.y;
    
    if (keys['ArrowLeft']) newX -= player.speed;
    if (keys['ArrowRight']) newX += player.speed;
    if (keys['ArrowUp']) newY -= player.speed;
    if (keys['ArrowDown']) newY += player.speed;
    
    // Check wall collisions
    if (!wouldHitWall(newX, player.y, player.width, player.height)) {
        player.x = newX;
    }
    if (!wouldHitWall(player.x, newY, player.width, player.height)) {
        player.y = newY;
    }
    
    // Keep in bounds
    player.x = Math.max(0, Math.min(player.x, 300 - player.width));
    player.y = Math.max(0, Math.min(player.y, 240 - player.height));
    
    player.sprite.x = player.x;
    player.sprite.y = player.y;
}

// Enemy AI - simple but effective!
function updateEnemies() {
    enemies.forEach(enemy => {
        // Calculate next position
        const nextX = enemy.x + enemy.moveX * enemy.speed;
        const nextY = enemy.y + enemy.moveY * enemy.speed;
        
        // Check if next position hits wall
        if (wouldHitWall(nextX, nextY, enemy.width, enemy.height)) {
            // Hit wall - reverse direction!
            enemy.moveX = -enemy.moveX;
            enemy.moveY = -enemy.moveY;
        } else {
            // Safe to move
            enemy.x = nextX;
            enemy.y = nextY;
        }
        
        // Update sprite position
        enemy.sprite.x = enemy.x;
        enemy.sprite.y = enemy.y;
        
        // Check collision with player
        if (player.alive && distance(enemy, player) < (enemy.width + player.width) / 2 + 2) {
            playerDie();
        }
    });
}

// Game over
function playerDie() {
    player.alive = false;
    player.sprite.tint = 0x666666; // Gray out dead player
    
    // Show game over message
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

## Why "Stupid" Enemies Are Actually Genius! {{< icon name="brain" >}}

Before you think your game needs super-intelligent AI, let's talk strategy! Many legendary games use beautifully simple enemy patterns:

**- Pac-Man ghosts**: Simple chase/scatter patterns that create complex emergent gameplay
**- Sonic badniks**: Basic back-and-forth patrolling that's predictable yet challenging  
**- Mario Goombas**: Walk in straight lines, but placement makes them deadly
**{{< icon name="alien" >}} Space Invaders**: Move in formation - simple rules, intense gameplay

**Why simple enemies work:**
- {{< icon name="target" >}} **Predictable = Fair**: Players can learn patterns and improve
- {{< icon name="lightning" >}} **Performance friendly**: Hundreds of simple enemies > few complex ones
- {{< icon name="mask-happy" >}} **Personality through movement**: Each pattern creates different feelings
- {{< icon name="puzzle-piece" >}} **Placement matters more than AI**: Smart level design beats smart AI

**The wisdom**: Players don't need enemies to surprise them with complex decisions. They need enemies that create interesting spatial puzzles, timing challenges, and satisfying patterns to overcome!

### Our Enemy Types

We'll create two fundamental enemy archetypes:

**{{< icon name="arrows-clockwise" >}} Horizontal Patroller**
- Walks left ↔ right between walls
- Creates timing-based challenges
- Perfect for corridor and platform sections

**⬆⬇ Vertical Patroller**  
- Moves up ↔ down between barriers
- Controls vertical space effectively
- Great for ladder and climbing sections

These simple behaviors combine to create surprisingly complex level challenges!


## Setting Up Enemy Types: Modern Class Design

Let's create a clean, flexible enemy system using contemporary JavaScript patterns:

```javascript
// Enemy type definitions - easy to extend!
const ENEMY_TYPES = {
    HORIZONTAL_PATROL: {
        color: 0x8A2BE2,    // Purple
        moveX: 1,           // Moves right initially
        moveY: 0,           // No vertical movement
        speed: 1,           // Pixels per frame
        size: 10            // Square size
    },
    
    VERTICAL_PATROL: {
        color: 0x00CED1,    // Dark turquoise
        moveX: 0,           // No horizontal movement
        moveY: 1,           // Moves down initially
        speed: 1,
        size: 10
    },
    
    FAST_HORIZONTAL: {
        color: 0x32CD32,    // Lime green
        moveX: 1,
        moveY: 0,
        speed: 2,           // Twice as fast!
        size: 8             // Smaller but faster
    }
};

// Enemy spawn configuration for each level
const levelEnemies = {
    1: [
        { type: 'HORIZONTAL_PATROL', tileX: 2, tileY: 1 },
        { type: 'VERTICAL_PATROL', tileX: 8, tileY: 1 },
        { type: 'FAST_HORIZONTAL', tileX: 1, tileY: 5 }
    ],
    
    2: [
        { type: 'HORIZONTAL_PATROL', tileX: 3, tileY: 3 },
        { type: 'HORIZONTAL_PATROL', tileX: 6, tileY: 4 }
    ]
};
```

**Why this approach rocks:**
- {{< icon name="package" >}} **Organized data**: All enemy properties in one place
- {{< icon name="rocket-launch" >}} **Easy expansion**: Add new types without touching existing code
- {{< icon name="target" >}} **Level-specific**: Different enemy layouts per level
- {{< icon name="wrench" >}} **Tweakable**: Change speeds, colors, sizes instantly


## Spawning Enemies: Bringing Danger to Life

Let's create a robust enemy spawning system:

```javascript
// Active enemies array
const enemies = [];
let nextEnemyId = 0;

// Spawn enemies for current level
function spawnEnemiesForLevel(levelId) {
    // Clear existing enemies
    enemies.forEach(enemy => enemy.sprite.destroy());
    enemies.length = 0;
    
    // Get enemy spawn data for this level
    const spawns = levelEnemies[levelId] || [];
    
    spawns.forEach(spawnData => {
        createEnemy(spawnData.type, spawnData.tileX, spawnData.tileY);
    });
}

// Create individual enemy
function createEnemy(typeName, tileX, tileY) {
    const type = ENEMY_TYPES[typeName];
    if (!type) {
        console.warn(`Unknown enemy type: ${typeName}`);
        return;
    }
    
    // Create enemy sprite
    const sprite = new Graphics()
        .rect(0, 0, type.size, type.size)
        .fill(type.color)
        .stroke({width: 1, color: 0x000000}); // Black outline
    
    // Create enemy object
    const enemy = {
        id: nextEnemyId++,
        sprite: sprite,
        type: typeName,
        
        // Position (convert tile coords to pixels)
        x: tileX * TILE_SIZE + (TILE_SIZE - type.size) / 2,
        y: tileY * TILE_SIZE + (TILE_SIZE - type.size) / 2,
        width: type.size,
        height: type.size,
        
        // Movement properties
        moveX: type.moveX,
        moveY: type.moveY, 
        speed: type.speed,
        
        // State
        active: true
    };
    
    // Position sprite
    sprite.x = enemy.x;
    sprite.y = enemy.y;
    
    // Add to stage and tracking
    app.stage.addChild(sprite);
    enemies.push(enemy);
    
    return enemy;
}
```

**Smart spawning features:**
- {{< icon name="target" >}} **Tile-based positioning**: Place enemies precisely on grid
- 🆔 **Unique IDs**: Track individual enemies for special behaviors
- {{< icon name="broom" >}} **Clean lifecycle**: Proper creation and cleanup
- {{< icon name="paint-brush" >}} **Visual variety**: Different colors and sizes per type


## Enemy AI: Simple Brains, Effective Results! {{< icon name="robot" >}}

Time to give our enemies the intelligence to patrol and threaten the player:

```javascript
// Main enemy AI update function
function updateEnemies() {
    enemies.forEach(enemy => {
        if (!enemy.active) return;
        
        // Calculate next position
        const nextX = enemy.x + enemy.moveX * enemy.speed;
        const nextY = enemy.y + enemy.moveY * enemy.speed;
        
        // Check for wall collision
        if (wouldHitWall(nextX, nextY, enemy.width, enemy.height)) {
            // Hit wall - reverse direction!
            enemy.moveX = -enemy.moveX;
            enemy.moveY = -enemy.moveY;
            
            // Optional: Add turning animation or sound here
            enemy.sprite.tint = 0xFFAAAA; // Brief flash
            setTimeout(() => {
                if (enemy.active) enemy.sprite.tint = 0xFFFFFF;
            }, 100);
        } else {
            // Safe to move - update position
            enemy.x = nextX;
            enemy.y = nextY;
        }
        
        // Update sprite to match position
        enemy.sprite.x = enemy.x;
        enemy.sprite.y = enemy.y;
        
        // Check collision with player
        checkEnemyPlayerCollision(enemy);
    });
}

// Collision detection between enemy and player
function checkEnemyPlayerCollision(enemy) {
    if (!player.alive) return;
    
    const distance = getDistance(enemy, player);
    const minDistance = (enemy.width + player.width) / 2;
    
    if (distance < minDistance) {
        handlePlayerHit(enemy);
    }
}

// Handle what happens when player gets hit
function handlePlayerHit(enemy) {
    player.alive = false;
    
    // Visual feedback
    player.sprite.tint = 0xFF0000; // Flash red
    enemy.sprite.tint = 0xFFFF00;  // Enemy flashes yellow
    
    // Respawn after delay
    setTimeout(() => {
        respawnPlayer();
    }, 1500);
}

function respawnPlayer() {
    player.alive = true;
    player.sprite.tint = 0xFFFFFF;
    
    // Reset to starting position
    player.x = 60;
    player.y = 180;
    
    // Reset enemy colors
    enemies.forEach(enemy => {
        enemy.sprite.tint = 0xFFFFFF;
    });
}

// Utility: Distance between two objects
function getDistance(obj1, obj2) {
    const dx = (obj1.x + obj1.width/2) - (obj2.x + obj2.width/2);
    const dy = (obj1.y + obj1.height/2) - (obj2.y + obj2.height/2);
    return Math.sqrt(dx * dx + dy * dy);
}
```

### The Magic of Simple AI

**What makes this "stupid" AI actually brilliant:**

{{< icon name="arrows-clockwise" >}} **Predictable patterns**: Players can learn and plan around enemy movements

{{< icon name="lightning" >}} **Instant feedback**: Enemies react immediately to walls with direction changes

{{< icon name="target" >}} **Consistent threat**: Always moving, always dangerous, never idle

{{< icon name="paint-brush" >}} **Visual personality**: Different colors and speeds create distinct "characters"

**Performance benefits:**
- {{< icon name="chart-bar" >}} **Efficient**: Simple math operations, no complex pathfinding
- {{< icon name="rocket-launch" >}} **Scalable**: Can handle dozens of enemies without lag
- {{< icon name="puzzle-piece" >}} **Modular**: Easy to add new behaviors or modify existing ones

**Design wisdom**: The best enemy AI doesn't try to outsmart the player - it creates interesting spatial and temporal puzzles for them to solve!

### Integration with Game Loop

```javascript
// Add to your main game loop
function gameLoop() {
    handleInput();      // Player movement
    updateEnemies();    // Enemy AI and movement
    updatePhysics();    // Gravity, collisions, etc.
    render();          // Draw everything
}

app.ticker.add(gameLoop);
```

**{{< icon name="confetti" >}} Boom!** Your peaceful world is now alive with danger and challenge! These simple patrolling enemies transform static levels into dynamic puzzles. Players must now time their movements, find safe paths, and feel the thrill of narrowly avoiding threats!

**Coming next**: We'll make these enemies even smarter by adding platform awareness and more sophisticated patrol behaviors! [Next: Enemy on Platform](/tutorial/world-one/13-enemy-on-platform/)