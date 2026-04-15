+++
title = "Open the Door"
date = 2026-03-09T04:00:00+11:00
weight = 9
draft = false
slug = "open-the-door"
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/world-one/locked-doors/"
prev = "/tutorial/world-one/getting-items/"
+++

A single room is a demo. A connected world — rooms that lead to other rooms — is a game. This tutorial adds a multi-room system: each room is a map stored in an object, and door tiles trigger transitions between them.

{{< pixidemo title="Multi-Room World Explorer" >}}
    // Create PixiJS application for room transition demo
    const app = new PIXI.Application();
    await app.init({
        width: 300,
        height: 240,
        backgroundColor: 0x2c3e50,
        antialias: true
    });
    
    document.body.appendChild(app.canvas);
    
    // Multiple rooms to explore!
    const rooms = {
        1: {
            name: "Starting Room",
            map: [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 2, 1],  // Door on the right
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ]
        },
        2: {
            name: "Secret Chamber",
            map: [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
                [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
                [3, 0, 1, 1, 0, 0, 1, 1, 0, 1],  // Door on the left
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ]
        }
    };
    
    // Door definitions - where each door leads
    const doors = {
        2: { toRoom: 2, playerX: 1, playerY: 6 },  // Right door goes to room 2
        3: { toRoom: 1, playerX: 8, playerY: 6 }   // Left door goes back to room 1
    };
    
    // Game state
    const game = {
        currentRoom: 1,
        tileSize: 30
    };
    
    // Hero object
    const hero = {
        tileX: 2,
        tileY: 3,
        x: 0,
        y: 0,
        width: 12,
        height: 12,
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
    
    // Room title text
    const roomTitle = new PIXI.Text('Starting Room', {
        fontSize: 16,
        fill: 0x00ff41,
        fontFamily: 'monospace'
    });
    roomTitle.x = 10;
    roomTitle.y = 5;
    
    // Build and display current room
    function buildRoom(roomId) {
        // Clear previous room
        app.stage.removeChildren();
        
        const room = rooms[roomId];
        const map = room.map;
        
        // Render tiles
        for (let row = 0; row < map.length; row++) {
            for (let col = 0; col < map[row].length; col++) {
                const tileType = map[row][col];
                const tile = new PIXI.Graphics();
                
                // Different colors for different tile types
                if (tileType === 1) {
                    tile.beginFill(0x00ff41);  // Wall
                } else if (tileType === 2 || tileType === 3) {
                    tile.beginFill(0xffff00);  // Door (yellow)
                } else {
                    tile.beginFill(0x003311);  // Floor
                }
                
                tile.drawRect(0, 0, game.tileSize, game.tileSize);
                tile.lineStyle(1, 0x00ff41, 0.3);
                tile.drawRect(0, 0, game.tileSize, game.tileSize);
                tile.endFill();
                tile.x = col * game.tileSize;
                tile.y = row * game.tileSize;
                app.stage.addChild(tile);
            }
        }
        
        // Add hero and title
        app.stage.addChild(hero.sprite);
        updateHeroPosition();
        
        roomTitle.text = room.name;
        app.stage.addChild(roomTitle);
    }
    
    function updateHeroPosition() {
        hero.x = (hero.tileX * game.tileSize) + (game.tileSize / 2);
        hero.y = (hero.tileY * game.tileSize) + (game.tileSize / 2);
        hero.sprite.x = hero.x;
        hero.sprite.y = hero.y;
    }
    
    // Check for door transitions
    function checkDoors() {
        const currentMap = rooms[game.currentRoom].map;
        const tileType = currentMap[hero.tileY][hero.tileX];
        
        if (doors[tileType]) {
            // Found a door! Transition to new room
            const door = doors[tileType];
            game.currentRoom = door.toRoom;
            hero.tileX = door.playerX;
            hero.tileY = door.playerY;
            
            // Flash effect for transition
            hero.sprite.tint = 0xffff00;
            setTimeout(() => {
                hero.sprite.tint = 0xffffff;
            }, 200);
            
            buildRoom(game.currentRoom);
        }
    }
    
    // Discrete movement - one tile per keypress!
    function moveHero(deltaX, deltaY) {
        const currentMap = rooms[game.currentRoom].map;
        let newTileX = hero.tileX + deltaX;
        let newTileY = hero.tileY + deltaY;
        
        // Check boundaries
        if (newTileX < 0 || newTileX >= currentMap[0].length || 
            newTileY < 0 || newTileY >= currentMap.length) {
            return; // Out of bounds
        }
        
        // Check if new position is walkable (not a wall)
        const newTileType = currentMap[newTileY][newTileX];
        if (newTileType !== 1) {  // 1 = wall
            hero.tileX = newTileX;
            hero.tileY = newTileY;
            updateHeroPosition();
            checkDoors();  // Check for room transitions!
        }
    }
    
    // Handle individual keypresses
    window.addEventListener('keydown', (e) => {
        // Prevent key repeat when holding down keys
        if (e.repeat) return;
        
        switch(e.code) {
            case 'ArrowUp':
                moveHero(0, -1);
                e.preventDefault();
                break;
            case 'ArrowDown':
                moveHero(0, 1);
                e.preventDefault();
                break;
            case 'ArrowLeft':
                moveHero(-1, 0);
                e.preventDefault();
                break;
            case 'ArrowRight':
                moveHero(1, 0);
                e.preventDefault();
                break;
        }
    });
    
    // Start in room 1
    buildRoom(1);
{{< /pixidemo >}}

Walk into the yellow door tiles to move between rooms.

## Multiple rooms

Each room is an entry in a `rooms` object keyed by room ID. The map array lives inside each room, alongside any other per-room data you need:

```js
// Our room database - easy to expand!
const rooms = {
    1: {
        name: "Village Square",
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 2, 1],  // Door (tile type 2)
            [1, 1, 1, 1, 1, 1, 1, 1]
        ],
        music: "village_theme.ogg",
        background: "#2c3e50"
    },
    
    2: {
        name: "Mysterious Cave", 
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [3, 0, 0, 0, 0, 0, 0, 1],  // Different door (tile type 3)
            [1, 1, 1, 1, 1, 1, 1, 1]
        ],
        music: "cave_ambient.ogg",
        background: "#1a1a2e"
    }
};

// Door destinations - where each door type leads
const doors = {
    2: { 
        toRoom: 2, 
        playerX: 1, 
        playerY: 4,
        message: "Entering the mysterious cave..."
    },
    3: { 
        toRoom: 1, 
        playerX: 6, 
        playerY: 4,
        message: "Returning to the village..."
    }
};

// Game state manager
const gameState = {
    currentRoom: 1,
    previousRoom: null,
    transitionInProgress: false
};
```

All room data is in one place and each room can carry its own settings — background colour, music track, particle effects — without any other room needing to know about them.

## Room transitions

**Step 1: Door detection**

```js
// Check if player is standing on a door
function checkForDoors(hero, currentRoom) {
    const map = rooms[currentRoom].map;
    const tileType = map[hero.tileY][hero.tileX];
    
    // Is this tile a door?
    if (doors[tileType]) {
        return doors[tileType];
    }
    
    return null; // No door here
}
```

**Step 2: Transition system**

```js
function transitionToRoom(doorData, hero, gameState, app) {
    // Prevent multiple rapid transitions
    if (gameState.transitionInProgress) return;
    
    gameState.transitionInProgress = true;
    
    // Optional: Show transition effect
    showTransitionEffect(doorData.message);
    
    // Update game state
    gameState.previousRoom = gameState.currentRoom;
    gameState.currentRoom = doorData.toRoom;
    
    // Move hero to new position
    hero.tileX = doorData.playerX;
    hero.tileY = doorData.playerY;
    
    // Rebuild the room
    buildRoom(gameState.currentRoom, app);
    
    // Re-enable transitions after a brief delay
    setTimeout(() => {
        gameState.transitionInProgress = false;
    }, 500);
}

function showTransitionEffect(message) {
    // Simple fade effect or message display
    console.log(message);
    
    // You could add visual effects here:
    // - Screen fade
    // - Flash effect  
    // - Loading animation
    // - Sound effects
}
```

**Step 3: Integration with movement**

```js
function updateMovement(hero, keys, gameState, app) {
    // ... normal movement code ...
    
    // After successful movement, check for doors
    const doorData = checkForDoors(hero, gameState.currentRoom);
    if (doorData) {
        transitionToRoom(doorData, hero, gameState, app);
    }
}
```

## Extended door types

The `buildRoom` function can read per-room properties to set background colour, start music, or trigger effects:

```js
function buildRoom(roomId, app) {
    const room = rooms[roomId];
    
    app.stage.removeChildren();
    app.renderer.background.color = room.background || 0x2c3e50;
    
    renderMap(room.map, app);
    
    if (room.particles) addParticleEffects(room.particles, app);
    if (room.music)     playBackgroundMusic(room.music);
    
    displayRoomTitle(room.name, app);
}

// Doors with conditions
const specialDoors = {
    LOCKED: {
        canUse: (hero) => hero.hasKey,
        message: "This door is locked.",
        sound: "door_locked.ogg"
    },
    
    MAGIC: {
        canUse: (hero) => hero.mana >= 10,
        cost: { mana: 10 },
        effect: "sparkle"
    },
    
    TELEPORTER: {
        canUse: () => true,
        effect: "flash"
    }
};

// Smart door system
function tryUseDoor(tileType, hero) {
    const doorData = doors[tileType];
    if (!doorData) return false;
    
    // Check if door can be used
    if (doorData.special) {
        const specialType = specialDoors[doorData.special];
        if (!specialType.canUse(hero)) {
            showMessage(specialType.message);
            return false;
        }
        
        // Apply costs
        if (specialType.cost) {
            Object.assign(hero, specialType.cost);
        }
        
        // Show special effects
        if (specialType.effect) {
            playEffect(specialType.effect);
        }
    }
    
    return true; // Door can be used!
}
```

**What you built:**

- A `rooms` object that stores each map alongside per-room settings
- A `doors` lookup that maps tile values to destination rooms and spawn positions
- A `buildRoom` function that clears the stage and renders the new room
- A transition guard (`transitionInProgress`) to prevent double-triggers

[Next: Locked Doors](/tutorial/world-one/locked-doors/)
