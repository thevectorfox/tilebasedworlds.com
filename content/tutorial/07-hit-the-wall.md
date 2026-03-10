+++
title = "Hit the Wall"
date = 2026-03-09T03:00:00+11:00
weight = 7
draft = false
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/08-open-the-door/"
prev = "/tutorial/06-keys-to-move/"
+++

Time to make your game world SOLID! 💥 Collision detection is what separates real games from slideshows - it's the magic that makes walls feel solid, platforms feel sturdy, and your hero feel like they truly exist in the world. You're about to master one of the most crucial skills in game development!

<div id="collision-demo" style="border: 2px solid #00ff41; border-radius: 8px; margin: 20px 0; background: #000;"></div>

<script>
window.addEventListener('load', async function() {
    // Create PixiJS application for collision demo
    const app = new PIXI.Application();
    await app.init({
        width: 300,
        height: 240,
        backgroundColor: 0x2c3e50,
        antialias: true
    });
    
    document.getElementById('collision-demo').appendChild(app.canvas);
    
    // Game world with walls
    const gameMap = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 1, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];
    
    const TILE_SIZE = 30;
    
    // Render the map
    for (let row = 0; row < gameMap.length; row++) {
        for (let col = 0; col < gameMap[row].length; col++) {
            const tile = new PIXI.Graphics();
            tile.beginFill(gameMap[row][col] === 1 ? 0x00ff41 : 0x003311);
            tile.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
            tile.lineStyle(1, 0x00ff41, 0.3);
            tile.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
            tile.endFill();
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            app.stage.addChild(tile);
        }
    }
    
    // Our collision-aware hero
    const hero = {
        tileX: 2,
        tileY: 2,
        x: 0,
        y: 0,
        width: 12,   // Collision box size
        height: 12,
        speed: 2,
        sprite: null
    };
    
    // Create hero sprite
    const heroSprite = new PIXI.Graphics();
    heroSprite.beginFill(0xff4444);
    heroSprite.drawRect(-6, -6, 12, 12);
    heroSprite.endFill();
    heroSprite.lineStyle(2, 0xffffff);
    heroSprite.drawRect(-6, -6, 12, 12);
    hero.sprite = heroSprite;
    app.stage.addChild(heroSprite);
    
    // Position update
    function updateHeroPosition() {
        hero.x = (hero.tileX * TILE_SIZE) + (TILE_SIZE / 2);
        hero.y = (hero.tileY * TILE_SIZE) + (TILE_SIZE / 2);
        hero.sprite.x = hero.x;
        hero.sprite.y = hero.y;
    }
    updateHeroPosition();
    
    // COLLISION DETECTION!
    function canMoveTo(tileX, tileY) {
        // Check bounds
        if (tileX < 0 || tileX >= gameMap[0].length || 
            tileY < 0 || tileY >= gameMap.length) {
            return false;
        }
        
        // Check if tile is walkable (0 = walkable, 1 = wall)
        return gameMap[tileY][tileX] === 0;
    }
    
    // Input handling
    const keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false
    };
    
    window.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.code)) {
            keys[e.code] = true;
            e.preventDefault();
        }
    });
    
    window.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.code)) {
            keys[e.code] = false;
            e.preventDefault();
        }
    });
    
    // Movement with collision
    function updateMovement() {
        let newTileX = hero.tileX;
        let newTileY = hero.tileY;
        let moved = false;
        
        if (keys.ArrowUp) {
            newTileY = hero.tileY - 1;
        } else if (keys.ArrowDown) {
            newTileY = hero.tileY + 1;
        } else if (keys.ArrowLeft) {
            newTileX = hero.tileX - 1;
        } else if (keys.ArrowRight) {
            newTileX = hero.tileX + 1;
        }
        
        // Check collision before moving
        if (canMoveTo(newTileX, newTileY)) {
            hero.tileX = newTileX;
            hero.tileY = newTileY;
            updateHeroPosition();
            hero.sprite.tint = 0xffffff;  // White when moving freely
            moved = true;
        } else if (newTileX !== hero.tileX || newTileY !== hero.tileY) {
            // Hit a wall! Show feedback
            hero.sprite.tint = 0xff8888;  // Light red when hitting wall
        }
    }
    
    app.ticker.add(updateMovement);
});
</script>

**Try it!** Use arrow keys to move around. Notice how the hero can't pass through walls and turns slightly red when hitting them! 🚧

## COLLISION DETECTION: THE FOUNDATION 🧱

**Step 1: Simple Tile-Based Collision**

Let's start with the simplest approach - checking if the tile we want to move to is walkable:

```js
// Our collision detection function - clean and simple!
function canMoveTo(tileX, tileY, gameMap) {
    // First, check if we're trying to go outside the map
    if (tileX < 0 || tileX >= gameMap[0].length || 
        tileY < 0 || tileY >= gameMap.length) {
        return false;  // Can't go outside the world!
    }
    
    // Check if the tile is walkable
    // 0 = floor (walkable), 1 = wall (solid)
    return gameMap[tileY][tileX] === 0;
}

// Using it in movement
function tryMoveTo(hero, newTileX, newTileY, gameMap) {
    if (canMoveTo(newTileX, newTileY, gameMap)) {
        // Safe to move!
        hero.tileX = newTileX;
        hero.tileY = newTileY;
        updateHeroPosition(hero);
        return true;
    } else {
        // Blocked! Stay where we are
        return false;
    }
}
```

**Why this approach rocks:**
- 🚀 **Super fast**: Just one array lookup per movement
- 🧠 **Easy to understand**: Clear logic anyone can follow
- 🔧 **Easy to extend**: Simple to add different tile types
- 🎮 **Perfect for tile games**: Works great for grid-based movement


## ADVANCED: BOUNDING BOX COLLISION 📦

**For pixel-perfect movement and larger characters:**

Sometimes you want smooth pixel-based movement instead of tile-by-tile jumping, or your character is larger than one tile. Here's how to handle that:

```js
// Check collision using character's bounding box
function checkBoundingBoxCollision(x, y, width, height, gameMap, tileSize) {
    // Calculate which tiles the character's corners touch
    const leftTile = Math.floor((x - width/2) / tileSize);
    const rightTile = Math.floor((x + width/2 - 1) / tileSize);
    const topTile = Math.floor((y - height/2) / tileSize);
    const bottomTile = Math.floor((y + height/2 - 1) / tileSize);
    
    // Check all tiles the character overlaps
    for (let tileY = topTile; tileY <= bottomTile; tileY++) {
        for (let tileX = leftTile; tileX <= rightTile; tileX++) {
            // Check bounds
            if (tileX < 0 || tileX >= gameMap[0].length || 
                tileY < 0 || tileY >= gameMap.length) {
                return true; // Hit world boundary
            }
            
            // Check if any overlapping tile is solid
            if (gameMap[tileY][tileX] === 1) {
                return true; // Hit a wall!
            }
        }
    }
    
    return false; // No collision!
}

// Smooth movement with collision
function updateSmoothMovement(hero, keys, gameMap, tileSize) {
    let newX = hero.x;
    let newY = hero.y;
    
    if (keys.ArrowLeft) newX -= hero.speed;
    if (keys.ArrowRight) newX += hero.speed;
    if (keys.ArrowUp) newY -= hero.speed;
    if (keys.ArrowDown) newY += hero.speed;
    
    // Check X movement first
    if (newX !== hero.x && !checkBoundingBoxCollision(newX, hero.y, hero.width, hero.height, gameMap, tileSize)) {
        hero.x = newX;
    }
    
    // Check Y movement separately  
    if (newY !== hero.y && !checkBoundingBoxCollision(hero.x, newY, hero.width, hero.height, gameMap, tileSize)) {
        hero.y = newY;
    }
    
    // Update sprite position
    hero.sprite.x = hero.x;
    hero.sprite.y = hero.y;
}
```

**Why separate X and Y checks?**
This allows "wall sliding" - if you hit a wall while moving diagonally, you can still slide along it. Just like in Mario or Zelda!


## COMPLETE COLLISION SYSTEM 🎮

**Put it all together:**

```js
// Complete movement system with collision
class CollisionSystem {
    constructor(gameMap, tileSize) {
        this.gameMap = gameMap;
        this.tileSize = tileSize;
    }
    
    // Check if a tile coordinate is walkable
    isTileWalkable(tileX, tileY) {
        if (tileX < 0 || tileX >= this.gameMap[0].length || 
            tileY < 0 || tileY >= this.gameMap.length) {
            return false;
        }
        return this.gameMap[tileY][tileX] === 0;
    }
    
    // Check pixel-based collision
    checkCollision(x, y, width, height) {
        const leftTile = Math.floor((x - width/2) / this.tileSize);
        const rightTile = Math.floor((x + width/2 - 1) / this.tileSize);
        const topTile = Math.floor((y - height/2) / this.tileSize);
        const bottomTile = Math.floor((y + height/2 - 1) / this.tileSize);
        
        for (let tileY = topTile; tileY <= bottomTile; tileY++) {
            for (let tileX = leftTile; tileX <= rightTile; tileX++) {
                if (!this.isTileWalkable(tileX, tileY)) {
                    return true; // Collision detected!
                }
            }
        }
        return false;
    }
    
    // Try to move an object
    moveObject(obj, deltaX, deltaY) {
        const newX = obj.x + deltaX;
        const newY = obj.y + deltaY;
        
        // Check X movement
        if (deltaX !== 0) {
            if (!this.checkCollision(newX, obj.y, obj.width, obj.height)) {
                obj.x = newX;
            }
        }
        
        // Check Y movement
        if (deltaY !== 0) {
            if (!this.checkCollision(obj.x, newY, obj.width, obj.height)) {
                obj.y = newY;
            }
        }
    }
}

// Usage
const collisionSystem = new CollisionSystem(gameMap, TILE_SIZE);

function updateMovement(hero, keys) {
    let deltaX = 0;
    let deltaY = 0;
    
    if (keys.ArrowLeft) deltaX = -hero.speed;
    if (keys.ArrowRight) deltaX = hero.speed;
    if (keys.ArrowUp) deltaY = -hero.speed;
    if (keys.ArrowDown) deltaY = hero.speed;
    
    collisionSystem.moveObject(hero, deltaX, deltaY);
    
    // Update sprite
    hero.sprite.x = hero.x;
    hero.sprite.y = hero.y;
}
```

## PRO TIPS & ENHANCEMENTS 🚀

**Visual Feedback:**
```js
// Show collision feedback
function updateCollisionFeedback(hero, hitWall) {
    if (hitWall) {
        hero.sprite.tint = 0xff8888;  // Light red
        // Optional: Add screen shake
        hero.sprite.x += Math.random() * 2 - 1;
    } else {
        hero.sprite.tint = 0xffffff;  // White
    }
}
```

**Sound Effects:**
```js
// Add audio feedback (using Web Audio API)
function playCollisionSound() {
    // Simple beep when hitting walls
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 200;
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}
```

**Different Tile Types:**
```js
const TileTypes = {
    FLOOR: 0,
    WALL: 1,
    WATER: 2,    // Slows movement
    SPIKES: 3,   // Damages player
    ICE: 4       // Slippery movement
};

function getTileEffect(tileType) {
    switch(tileType) {
        case TileTypes.WATER: return { walkable: true, speedMultiplier: 0.5 };
        case TileTypes.SPIKES: return { walkable: true, damage: 10 };
        case TileTypes.ICE: return { walkable: true, friction: 0.1 };
        default: return { walkable: tileType === TileTypes.FLOOR };
    }
}
```

🏆 **COLLISION MASTERY ACHIEVED!**

You've just mastered one of the most important systems in game development! Your games now have solid, responsive collision detection that makes the world feel real and interactive.

**What you've conquered:**
- ✅ Simple tile-based collision detection
- ✅ Advanced bounding box collision
- ✅ Smooth movement with wall sliding
- ✅ Professional collision system architecture
- ✅ The foundation for physics-based games!

Ready to make your world more interactive? Next up: doors, switches, and interactive objects! [Next: Open the Door](/tutorial/08-open-the-door/)