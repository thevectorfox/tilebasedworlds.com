+++
title = "Pathfinding Breadth-First"
date = 2026-03-09T22:00:00+11:00
weight = 26
draft = false
slug = "pathfinding-breadth-first"
tags = ["advanced", "optimization", "tutorial"]
next = "/tutorial/world-one/pathfinding-best-first/"
prev = "/tutorial/world-one/rotate-background/"
+++

Time to give your characters some serious brains! 🧠 So far, your hero has been pretty... let's say "directionally challenged." Tell them to go left, they go left - even straight into a wall! But what if they could think for themselves and find clever paths around obstacles?

Welcome to the world of **pathfinding** - the AI magic behind every smart enemy in RTS games, every helpful companion in RPGs, and every tower defense unit that knows exactly how to reach their target. You're about to implement the same algorithms that power characters in *Starcraft*, *Age of Empires*, and countless other games!

**What You'll Build:**
- Click-to-move navigation like in RTS games
- Visual breadth-first search algorithm in action
- Smart AI that finds the shortest path around obstacles
- A foundation for enemy AI and companion behavior

**Prerequisites:**
- Completed the tile-based movement tutorials
- Basic understanding of grid coordinates
- Ready to dive into some elegant algorithm magic!

Get ready to watch your dumb hero transform into a navigation genius!

{{< pixidemo title="Pathfinding Breadth-First" >}}
const app = new PIXI.Application();

await app.init({
    width: 300,
    height: 240,
    backgroundColor: 0xf8f9fa
});
document.body.appendChild(app.canvas);

// Game constants
const TILE_SIZE = 20;
const COLS = 15;
const ROWS = 12;

// Create a maze-like map
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,1,1,0,1,1,0,1,0,1,1,0,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,0,0,1,0,1,1,1,0,1,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Create visual tiles
const tiles = [];
for (let row = 0; row < ROWS; row++) {
    tiles[row] = [];
    for (let col = 0; col < COLS; col++) {
        const tile = new PIXI.Graphics();
        
        if (map[row][col] === 1) {
            // Wall tile
            tile.rect(0, 0, TILE_SIZE, TILE_SIZE).fill(0x2c3e50);
        } else {
            // Empty tile
            tile.rect(0, 0, TILE_SIZE, TILE_SIZE)
                .fill(0xffffff)
                .stroke({ color: 0xe0e0e0, width: 0.5 });
        }
        
        tile.x = col * TILE_SIZE;
        tile.y = row * TILE_SIZE;
        tiles[row][col] = tile;
        app.stage.addChild(tile);
    }
}

// Hero (starting position)
const hero = new PIXI.Graphics();
hero.circle(TILE_SIZE/2, TILE_SIZE/2, 6).fill(0xff4444);
let heroPos = { x: 1, y: 1 };
hero.x = heroPos.x * TILE_SIZE;
hero.y = heroPos.y * TILE_SIZE;
app.stage.addChild(hero);

// Pathfinding visualization
let searchTiles = [];
let pathTiles = [];

// Status display
function updateStatus(message) {
    window.parent.postMessage({ type: 'status', text: message }, '*');
}

// Breadth-First Search implementation
class PathfindingNode {
    constructor(x, y, parent = null) {
        this.x = x;
        this.y = y;
        this.parent = parent;
    }
    
    getKey() {
        return `${this.x},${this.y}`;
    }
}

function isValidPosition(x, y) {
    return x >= 0 && x < COLS && y >= 0 && y < ROWS && map[y][x] === 0;
}

function getNeighbors(node) {
    const directions = [
        { x: 0, y: -1 }, // Up
        { x: 1, y: 0 },  // Right  
        { x: 0, y: 1 },  // Down
        { x: -1, y: 0 }  // Left
    ];
    
    return directions
        .map(dir => new PathfindingNode(node.x + dir.x, node.y + dir.y, node))
        .filter(neighbor => isValidPosition(neighbor.x, neighbor.y));
}

function animateSearch(queue, visited, target, step = 0) {
    if (queue.length === 0) {
        updateStatus('❌ No path found!');
        return;
    }
    
    const current = queue.shift();
    
    // Check if we reached the target
    if (current.x === target.x && current.y === target.y) {
        updateStatus('🎉 Path found! Building route...');
        buildPath(current);
        return;
    }
    
    // Visualize search expansion
    const tile = tiles[current.y][current.x];
    tile.clear()
        .rect(0, 0, TILE_SIZE, TILE_SIZE)
        .fill(0x3498db) // Blue for searched
        .stroke({ color: 0xe0e0e0, width: 0.5 });
    
    // Add neighbors to queue
    const neighbors = getNeighbors(current);
    for (const neighbor of neighbors) {
        const key = neighbor.getKey();
        if (!visited.has(key)) {
            visited.add(key);
            queue.push(neighbor);
            
            // Visualize frontier
            const neighborTile = tiles[neighbor.y][neighbor.x];
            neighborTile.clear()
                .rect(0, 0, TILE_SIZE, TILE_SIZE)
                .fill(0x74b9ff) // Light blue for frontier
                .stroke({ color: 0xe0e0e0, width: 0.5 });
        }
    }
    
    updateStatus(`🔍 Searching... Step ${step + 1}, Queue: ${queue.length}`);
    
    // Continue search with animation
    setTimeout(() => animateSearch(queue, visited, target, step + 1), 150);
}

function buildPath(endNode) {
    const path = [];
    let current = endNode;
    
    // Trace back through parents
    while (current.parent !== null) {
        path.unshift(current);
        current = current.parent;
    }
    
    // Animate path building
    animatePath(path, 0);
}

function animatePath(path, index) {
    if (index >= path.length) {
        updateStatus(`✅ Shortest path found! ${path.length} steps.`);
        moveHero(path);
        return;
    }
    
    const node = path[index];
    const tile = tiles[node.y][node.x];
    tile.clear()
        .rect(0, 0, TILE_SIZE, TILE_SIZE)
        .fill(0x00b894) // Green for final path
        .stroke({ color: 0xe0e0e0, width: 0.5 });
    
    setTimeout(() => animatePath(path, index + 1), 100);
}

function moveHero(path) {
    if (path.length === 0) return;
    
    let currentStep = 0;
    function animateMovement() {
        if (currentStep >= path.length) return;
        
        const step = path[currentStep];
        heroPos.x = step.x;
        heroPos.y = step.y;
        hero.x = heroPos.x * TILE_SIZE;
        hero.y = heroPos.y * TILE_SIZE;
        
        currentStep++;
        setTimeout(animateMovement, 200);
    }
    
    setTimeout(animateMovement, 500);
}

function clearVisualization() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (map[row][col] === 0) {
                tiles[row][col].clear()
                    .rect(0, 0, TILE_SIZE, TILE_SIZE)
                    .fill(0xffffff)
                    .stroke({ color: 0xe0e0e0, width: 0.5 });
            }
        }
    }
}

function findPath(startX, startY, targetX, targetY) {
    clearVisualization();
    updateStatus('🎯 Starting pathfinding...');
    
    const startNode = new PathfindingNode(startX, startY);
    const queue = [startNode];
    const visited = new Set();
    visited.add(startNode.getKey());
    
    // Highlight target
    tiles[targetY][targetX].clear()
        .rect(0, 0, TILE_SIZE, TILE_SIZE)
        .fill(0xff6b6b) // Red for target
        .stroke({ color: 0xe0e0e0, width: 0.5 });
    
    // Start animated search
    setTimeout(() => animateSearch(queue, visited, { x: targetX, y: targetY }), 300);
}

// Click handling
app.stage.interactive = true;
app.stage.on('pointerdown', (event) => {
    const pos = event.global;
    const tileX = Math.floor(pos.x / TILE_SIZE);
    const tileY = Math.floor(pos.y / TILE_SIZE);
    
    // Check if clicked on empty tile
    if (isValidPosition(tileX, tileY) && !(tileX === heroPos.x && tileY === heroPos.y)) {
        findPath(heroPos.x, heroPos.y, tileX, tileY);
    }
});

// Initialize
updateStatus('🖱️ Click on any empty tile to see pathfinding in action!');
{{< /pixidemo >}}

## What Just Happened? Algorithm Magic Explained!

**Mind = Blown! 🤯** You just watched the **Breadth-First Search** algorithm in action! Notice how the search expands outward like ripples in a pond? That's the "breadth-first" part - it explores all tiles at distance 1, then all tiles at distance 2, and so on.

**Why This Matters:**
- 🎯 **Guaranteed Shortest Path**: Breadth-first always finds the route with the fewest steps
- 🔍 **Systematic Search**: No randomness - it methodically explores every possibility  
- 🏰 **Perfect for Grid Games**: RTS units, tower defense enemies, puzzle games
- 🧠 **Foundation Knowledge**: Understanding this unlocks more advanced AI algorithms

**Real-World Usage:**
- **RTS Games**: Units finding paths around buildings and terrain
- **Puzzle Games**: AI solving mazes or calculating optimal moves
- **RPG Companions**: NPCs following players through complex environments
- **Tower Defense**: Enemies navigating through maze-like levels


## How Breadth-First Search Works

The algorithm is beautifully simple! Think of it like exploring a building floor by floor:

1. **Start at your current position** (the hero's tile)
2. **Check all neighboring tiles** - up, down, left, right  
3. **Add walkable neighbors to a queue** (list of tiles to visit)
4. **Take the first tile from the queue** and repeat the process
5. **Continue until you find the target** or run out of tiles

**Visual Pattern**: The search expands outward in a diamond/square pattern:

```
      3
    3 2 3
  3 2 1 2 3
3 2 1 S 1 2 3  ← S = Start, numbers = search order
  3 2 1 2 3
    3 2 3
      3
```

**The Magic**: Because we explore tiles in order of distance from start, the first time we reach the target is guaranteed to be via the shortest path!


## Building Your Pathfinding System

Let's implement click-to-move navigation! First, we'll create the data structures to track our search:

```javascript
// Node class to represent each tile in our search
class PathNode {
    constructor(x, y, parent = null) {
        this.x = x;
        this.y = y;
        this.parent = parent; // How we got here (for building the path)
    }
    
    // Unique identifier for this position
    getKey() {
        return `${this.x},${this.y}`;
    }
    
    // Get all valid neighboring tiles
    getNeighbors(map) {
        const directions = [
            { x: 0, y: -1 }, // Up
            { x: 1, y: 0 },  // Right
            { x: 0, y: 1 },  // Down
            { x: -1, y: 0 }  // Left
        ];
        
        return directions
            .map(dir => new PathNode(this.x + dir.x, this.y + dir.y, this))
            .filter(node => isValidTile(node.x, node.y, map));
    }
}

// Check if a tile position is walkable
function isValidTile(x, y, map) {
    return x >= 0 && x < map[0].length && 
           y >= 0 && y < map.length && 
           map[y][x] === 0; // 0 = walkable, 1 = wall
}
```

**Key Concept**: Each node remembers its `parent` - the tile we came from. This lets us trace back the complete path once we find the target!

## The Core Algorithm: Finding the Perfect Path

Here's the heart of breadth-first pathfinding! This function is pure algorithmic poetry:

```javascript
function findPath(startX, startY, targetX, targetY, map) {
    // Initialize the search
    const startNode = new PathNode(startX, startY);
    const queue = [startNode];        // Tiles to explore (FIFO - First In, First Out)
    const visited = new Set();        // Tiles we've already checked
    visited.add(startNode.getKey());
    
    // The main search loop - this is where the magic happens!
    while (queue.length > 0) {
        // Take the first node from the queue (breadth-first!)
        const current = queue.shift();
        
        // Did we find the target? Victory!
        if (current.x === targetX && current.y === targetY) {
            return buildPathArray(current);
        }
        
        // Explore all valid neighbors
        const neighbors = current.getNeighbors(map);
        for (const neighbor of neighbors) {
            const key = neighbor.getKey();
            
            // Skip if we've been here before
            if (visited.has(key)) continue;
            
            // Add to our search queue
            visited.add(key);
            queue.push(neighbor);
        }
    }
    
    // No path found 😢
    return null;
}

// Build the actual path by tracing back through parents
function buildPathArray(endNode) {
    const path = [];
    let current = endNode;
    
    // Trace backwards from target to start
    while (current.parent !== null) {
        path.unshift({ x: current.x, y: current.y });
        current = current.parent;
    }
    
    return path; // Returns path from start to target
}
```

**🎯 Algorithm Breakdown**:
1. **Queue**: Stores tiles we need to explore (breadth-first order)
2. **Visited Set**: Prevents revisiting tiles (infinite loops = bad!)
3. **Parent Tracking**: Each node remembers how we got there
4. **Path Reconstruction**: Work backwards from target to start

## Integrating Click-to-Move Navigation

Now let's wire up the pathfinding to create a smooth click-to-move experience like in RTS games:

```javascript
const player = {
    x: 2,           // Current tile position
    y: 2,
    targetPath: [], // Array of {x, y} positions to follow
    isMoving: false,
    moveSpeed: 4    // Pixels per frame
};

// Handle mouse clicks for navigation
function handleMapClick(mouseX, mouseY) {
    const tileX = Math.floor(mouseX / TILE_SIZE);
    const tileY = Math.floor(mouseY / TILE_SIZE);
    
    // Make sure the tile is walkable
    if (!isValidTile(tileX, tileY, gameMap)) {
        console.log('Cannot walk there!');
        return;
    }
    
    // Find path to clicked location
    const path = findPath(player.x, player.y, tileX, tileY, gameMap);
    
    if (path) {
        player.targetPath = path;
        player.isMoving = true;
        console.log(`Path found! ${path.length} steps.`);
    } else {
        console.log('No path to target!');
    }
}

// Update player movement each frame
function updatePlayerMovement() {
    if (!player.isMoving || player.targetPath.length === 0) {
        return; // Nothing to do
    }
    
    const nextTarget = player.targetPath[0];
    const targetPixelX = nextTarget.x * TILE_SIZE + TILE_SIZE / 2;
    const targetPixelY = nextTarget.y * TILE_SIZE + TILE_SIZE / 2;
    
    // Calculate movement towards target
    const dx = targetPixelX - player.sprite.x;
    const dy = targetPixelY - player.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < player.moveSpeed) {
        // Reached this waypoint - move to next!
        player.x = nextTarget.x;
        player.y = nextTarget.y;
        player.sprite.x = targetPixelX;
        player.sprite.y = targetPixelY;
        
        player.targetPath.shift(); // Remove completed waypoint
        
        if (player.targetPath.length === 0) {
            player.isMoving = false; // Journey complete!
        }
    } else {
        // Move towards target
        player.sprite.x += (dx / distance) * player.moveSpeed;
        player.sprite.y += (dy / distance) * player.moveSpeed;
    }
}

// Add to your game loop
function gameLoop() {
    updatePlayerMovement();
    // ... other game updates
}
```

**🎮 User Experience Magic**: 
- **Instant feedback**: Path calculation happens immediately on click
- **Smooth movement**: Character smoothly follows the calculated route
- **Flexible targeting**: Click anywhere reachable for navigation
- **Professional feel**: Same system used in AAA strategy games!

## Performance and Optimization

**⚡ Real-World Considerations**: Pathfinding can be expensive! Here's how to keep your game smooth:

```javascript
// Optimization 1: Limit search area
function findPathOptimized(startX, startY, targetX, targetY, map, maxDistance = 50) {
    const startNode = new PathNode(startX, startY);
    const queue = [startNode];
    const visited = new Set();
    let searchCount = 0;
    
    visited.add(startNode.getKey());
    
    while (queue.length > 0 && searchCount < maxDistance) {
        const current = queue.shift();
        searchCount++;
        
        if (current.x === targetX && current.y === targetY) {
            return buildPathArray(current);
        }
        
        // ... rest of algorithm
    }
    
    return null; // No path found within limit
}

// Optimization 2: Async pathfinding for large maps
async function findPathAsync(startX, startY, targetX, targetY, map) {
    return new Promise((resolve) => {
        const startNode = new PathNode(startX, startY);
        const queue = [startNode];
        const visited = new Set();
        let processCount = 0;
        
        function processChunk() {
            const chunkSize = 10; // Process 10 nodes per frame
            
            for (let i = 0; i < chunkSize && queue.length > 0; i++) {
                const current = queue.shift();
                
                if (current.x === targetX && current.y === targetY) {
                    resolve(buildPathArray(current));
                    return;
                }
                
                // Add neighbors...
            }
            
            if (queue.length > 0) {
                requestAnimationFrame(processChunk); // Continue next frame
            } else {
                resolve(null); // No path found
            }
        }
        
        processChunk();
    });
}
```

**🚀 Performance Tips**:
- **Limit search distance**: Don't search the entire world for every path
- **Cache common paths**: Store frequently-used routes
- **Use async for large maps**: Spread pathfinding across multiple frames
- **Early exit**: Stop searching if distance gets too far

**🎉 Amazing Work!** You've just implemented **professional-grade pathfinding**! Your characters can now:

- ✨ Navigate intelligently around obstacles
- 🎯 Find the shortest route every time
- 🧠 Make decisions like real game AI
- 🎮 Provide smooth click-to-move gameplay

**Try This**: Experiment with diagonal movement, weighted terrain costs, or multiple units pathfinding simultaneously. You've mastered the foundation - now the sky's the limit!

Next up: Best-first search and A* pathfinding for even smarter AI behavior!

