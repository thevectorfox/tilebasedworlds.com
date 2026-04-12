+++
title = "Pathfinding Best-First"
date = 2026-03-09T23:00:00+11:00
weight = 15
draft = true
slug = "pathfinding-best-first"
tags = ["advanced", "optimization", "tutorial"]
next = ""
prev = "/tutorial/world-one/pathfinding-breadth-first/"
+++

Ready to supercharge your AI? {{< icon name="rocket-launch" >}} While breadth-first search guarantees the shortest path, it can be painfully slow on large maps - exploring EVERYWHERE before finding the target. What if your AI could be smarter and **guess** which direction to search first?

Enter **Best-First Search** - the algorithm that adds intuition to pathfinding! Instead of blindly searching in all directions, your AI will make educated guesses about where the target might be, dramatically speeding up path discovery.

**What You'll Master:**
- Heuristic-guided pathfinding (AI with intuition!)
- Trading perfect paths for blazing speed
- Manhattan distance calculations
- Priority queue magic for smarter searching
- Performance optimization for real-time games

**Prerequisites:**
- Completed the breadth-first pathfinding tutorial
- Ready to see your AI get seriously smart!

Time to give your pathfinding algorithm a brain upgrade that'll make it 5-10x faster! {{< icon name="lightning" >}}

{{< pixidemo title="Pathfinding Best-First" >}}
const app = new PIXI.Application();

await app.init({
    width: 600,
    height: 240,
    backgroundColor: 0xf8f9fa
});
document.body.appendChild(app.canvas);

// Game constants
const TILE_SIZE = 16;
const COLS = 18;
const ROWS = 15;
const DEMO_WIDTH = 300;

// Create a challenging maze
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1],
    [1,1,1,1,1,0,1,1,1,0,1,0,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,1,1,1,0,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,1,0,1,0,0,1],
    [1,1,1,1,1,0,1,0,1,1,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
    [1,0,1,1,1,1,1,1,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,1],
    [1,1,1,0,1,1,1,1,1,0,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Create two demo areas
const leftDemo = createDemoArea(0, "Breadth-First");
const rightDemo = createDemoArea(DEMO_WIDTH, "Best-First");

function createDemoArea(offsetX, title) {
    const container = new PIXI.Container();
    container.x = offsetX;
    app.stage.addChild(container);
    
    // Title
    const titleText = new PIXI.Text({
        text: title,
        style: {
            fontSize: 14,
            fill: 0x2c3e50,
            fontWeight: 'bold'
        }
    });
    titleText.x = DEMO_WIDTH / 2 - titleText.width / 2;
    titleText.y = 5;
    container.addChild(titleText);
    
    // Create tiles
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
            tile.y = row * TILE_SIZE + 25;
            tiles[row][col] = tile;
            container.addChild(tile);
        }
    }
    
    return { container, tiles, title };
}

// Pathfinding classes
class PathNode {
    constructor(x, y, parent = null, cost = 0, heuristic = 0) {
        this.x = x;
        this.y = y;
        this.parent = parent;
        this.cost = cost;
        this.heuristic = heuristic;
        this.priority = cost + heuristic; // f-score for A*-like behavior
    }
    
    getKey() {
        return `${this.x},${this.y}`;
    }
}

function isValidPosition(x, y) {
    return x >= 0 && x < COLS && y >= 0 && y < ROWS && map[y][x] === 0;
}

function manhattanDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function getNeighbors(node, targetX, targetY, isBestFirst = false) {
    const directions = [
        { x: 0, y: -1 }, // Up
        { x: 1, y: 0 },  // Right
        { x: 0, y: 1 },  // Down
        { x: -1, y: 0 }  // Left
    ];
    
    return directions
        .map(dir => {
            const newX = node.x + dir.x;
            const newY = node.y + dir.y;
            const heuristic = isBestFirst ? manhattanDistance(newX, newY, targetX, targetY) : 0;
            return new PathNode(newX, newY, node, node.cost + 1, heuristic);
        })
        .filter(neighbor => isValidPosition(neighbor.x, neighbor.y));
}

// Animation state
let animationRunning = false;

// Status display
function updateStatus(message) {
    window.parent.postMessage({ type: 'status', text: message }, '*');
}

// Breadth-First Search (from previous tutorial)
function animateBreadthFirst(startX, startY, targetX, targetY) {
    const queue = [new PathNode(startX, startY)];
    const visited = new Set();
    const tiles = leftDemo.tiles;
    let step = 0;
    
    visited.add(`${startX},${startY}`);
    tiles[targetY][targetX].clear().rect(0, 0, TILE_SIZE, TILE_SIZE).fill(0xe74c3c); // Target
    
    function searchStep() {
        if (queue.length === 0) {
            updateStatus('Breadth-First: No path found! | Best-First: Waiting...');
            return;
        }
        
        const current = queue.shift();
        step++;
        
        if (current.x === targetX && current.y === targetY) {
            updateStatus(`✅ Breadth-First: Found in ${step} steps! | Best-First: Running...`);
            buildPath(leftDemo.tiles, current, 0x27ae60);
            // Start best-first after breadth-first completes
            setTimeout(() => animateBestFirst(startX, startY, targetX, targetY), 1000);
            return;
        }
        
        // Visualize search
        if (!(current.x === startX && current.y === startY)) {
            tiles[current.y][current.x].clear()
                .rect(0, 0, TILE_SIZE, TILE_SIZE)
                .fill(0x74b9ff)
                .stroke({ color: 0xe0e0e0, width: 0.5 });
        }
        
        // Add neighbors
        const neighbors = getNeighbors(current, targetX, targetY, false);
        for (const neighbor of neighbors) {
            const key = neighbor.getKey();
            if (!visited.has(key)) {
                visited.add(key);
                queue.push(neighbor);
            }
        }
        
        updateStatus(`🔵 Breadth-First: Step ${step}, Queue: ${queue.length} | Best-First: Waiting...`);
        setTimeout(searchStep, 50);
    }
    
    searchStep();
}

// Best-First Search with heuristic
function animateBestFirst(startX, startY, targetX, targetY) {
    const startNode = new PathNode(startX, startY, null, 0, manhattanDistance(startX, startY, targetX, targetY));
    const queue = [startNode];
    const visited = new Set();
    const tiles = rightDemo.tiles;
    let step = 0;
    
    visited.add(startNode.getKey());
    tiles[targetY][targetX].clear().rect(0, 0, TILE_SIZE, TILE_SIZE).fill(0xe74c3c); // Target
    
    function searchStep() {
        if (queue.length === 0) {
            updateStatus('Breadth-First: Complete | Best-First: No path found!');
            return;
        }
        
        // Sort queue by heuristic (best-first!)
        queue.sort((a, b) => a.heuristic - b.heuristic);
        const current = queue.shift();
        step++;
        
        if (current.x === targetX && current.y === targetY) {
            updateStatus(`✅ Breadth-First: Found! | Best-First: Found in ${step} steps! 🔥`);
            buildPath(rightDemo.tiles, current, 0xe67e22);
            animationRunning = false;
            return;
        }
        
        // Visualize search (different color for best-first)
        if (!(current.x === startX && current.y === startY)) {
            tiles[current.y][current.x].clear()
                .rect(0, 0, TILE_SIZE, TILE_SIZE)
                .fill(0xff7675)
                .stroke({ color: 0xe0e0e0, width: 0.5 });
        }
        
        // Add neighbors with heuristic
        const neighbors = getNeighbors(current, targetX, targetY, true);
        for (const neighbor of neighbors) {
            const key = neighbor.getKey();
            if (!visited.has(key)) {
                visited.add(key);
                queue.push(neighbor);
            }
        }
        
        updateStatus(`✅ Breadth-First: Complete | 🔴 Best-First: Step ${step}, Queue: ${queue.length}`);
        setTimeout(searchStep, 50);
    }
    
    searchStep();
}

function buildPath(tiles, endNode, color) {
    const path = [];
    let current = endNode;
    
    while (current.parent !== null) {
        path.unshift(current);
        current = current.parent;
    }
    
    // Animate path
    let index = 0;
    function animatePathStep() {
        if (index >= path.length) return;
        
        const node = path[index];
        tiles[node.y][node.x].clear()
            .rect(0, 0, TILE_SIZE, TILE_SIZE)
            .fill(color)
            .stroke({ color: 0xe0e0e0, width: 0.5 });
        
        index++;
        setTimeout(animatePathStep, 30);
    }
    
    animatePathStep();
}

function clearDemos() {
    [leftDemo, rightDemo].forEach(demo => {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (map[row][col] === 0) {
                    demo.tiles[row][col].clear()
                        .rect(0, 0, TILE_SIZE, TILE_SIZE)
                        .fill(0xffffff)
                        .stroke({ color: 0xe0e0e0, width: 0.5 });
                }
            }
        }
    });
}

// Click handling for demo
app.stage.interactive = true;
app.stage.on('pointerdown', (event) => {
    if (animationRunning) return;
    
    const pos = event.global;
    let tileX, tileY;
    
    if (pos.x < DEMO_WIDTH) {
        // Left demo clicked
        tileX = Math.floor(pos.x / TILE_SIZE);
        tileY = Math.floor((pos.y - 25) / TILE_SIZE);
    } else {
        // Right demo clicked  
        tileX = Math.floor((pos.x - DEMO_WIDTH) / TILE_SIZE);
        tileY = Math.floor((pos.y - 25) / TILE_SIZE);
    }
    
    if (isValidPosition(tileX, tileY)) {
        clearDemos();
        animationRunning = true;
        
        // Fixed start position
        const startX = 1, startY = 1;
        
        // Add hero markers
        leftDemo.tiles[startY][startX].clear().rect(0, 0, TILE_SIZE, TILE_SIZE).fill(0xffff00);
        rightDemo.tiles[startY][startX].clear().rect(0, 0, TILE_SIZE, TILE_SIZE).fill(0xffff00);
        
        updateStatus('{{< icon name="rocket-launch" >}} Starting algorithm race!');
        animateBreadthFirst(startX, startY, tileX, tileY);
    }
});

// Initialize
updateStatus('{{< icon name="target" >}} Click anywhere on the maze to start the pathfinding race!');
{{< /pixidemo >}}


## The Speed Revolution: Why Best-First Wins

**Did You See That?! 🤯** Best-First Search just demolished Breadth-First in that race! While Breadth-First methodically searched EVERYWHERE like a thorough but slow detective, Best-First made smart guesses and bee-lined toward the target like a heat-seeking missile.

**The Secret Sauce: Heuristics**

Best-First doesn't search blindly - it uses a **heuristic function** (fancy term for "educated guess") to estimate how far each tile is from the target:

```javascript
// Manhattan Distance: "Taxi cab" distance 
function manhattanDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

// This tells us: "tile (5,3) is probably 7 steps from target (10,8)"
const estimate = manhattanDistance(5, 3, 10, 8); // = 5 + 5 = 10
```

**Why "Manhattan"?** 🏙️ Imagine you're driving in Manhattan - you can't drive diagonally through buildings! You have to go block by block, just like our tile-based movement.

**The Trade-off:**
- ✅ **Best-First**: 5-10x faster, finds "good enough" paths
- ✅ **Breadth-First**: Always finds the shortest possible path, but slower

For real-time games, speed usually wins! Players won't notice if the AI takes 10 steps instead of 9, but they WILL notice if the game freezes for half a second.


## Implementing Smart Pathfinding

Let's upgrade our pathfinding system with intelligence! The key changes from breadth-first are:

1. **Add heuristic calculation** to each node
2. **Sort the search queue** by estimated distance to target
3. **Always explore the most promising tiles first**

```javascript
class SmartPathNode {
    constructor(x, y, parent = null, actualCost = 0, targetX = 0, targetY = 0) {
        this.x = x;
        this.y = y;
        this.parent = parent;
        this.actualCost = actualCost;  // Steps taken to reach this tile
        this.heuristic = this.calculateHeuristic(targetX, targetY);
        this.estimatedTotal = actualCost + this.heuristic; // Best guess of total path cost
    }
    
    calculateHeuristic(targetX, targetY) {
        // Manhattan distance - our "smart guess"
        return Math.abs(this.x - targetX) + Math.abs(this.y - targetY);
    }
    
    getKey() {
        return `${this.x},${this.y}`;
    }
}

// The magic: Best-First Search with heuristic guidance
function findPathBestFirst(startX, startY, targetX, targetY, map) {
    const startNode = new SmartPathNode(startX, startY, null, 0, targetX, targetY);
    const openList = [startNode];     // Tiles to explore (priority queue)
    const closedSet = new Set();      // Tiles already fully explored
    
    while (openList.length > 0) {
        // 🔥 THE MAGIC: Sort by heuristic (best guess first!)
        openList.sort((a, b) => a.heuristic - b.heuristic);
        const current = openList.shift();
        
        // Found the target!
        if (current.x === targetX && current.y === targetY) {
            return buildPathArray(current);
        }
        
        // Mark as fully explored
        closedSet.add(current.getKey());
        
        // Explore neighbors
        const neighbors = getValidNeighbors(current, targetX, targetY, map);
        for (const neighbor of neighbors) {
            const key = neighbor.getKey();
            
            // Skip if already fully explored
            if (closedSet.has(key)) continue;
            
            // Add to exploration queue
            const existingIndex = openList.findIndex(node => node.getKey() === key);
            if (existingIndex === -1) {
                openList.push(neighbor);
            } else if (neighbor.actualCost < openList[existingIndex].actualCost) {
                // Found a better path to this tile!
                openList[existingIndex] = neighbor;
            }
        }
    }
    
    return null; // No path found
}

function getValidNeighbors(node, targetX, targetY, map) {
    const directions = [
        { x: 0, y: -1 }, // Up
        { x: 1, y: 0 },  // Right
        { x: 0, y: 1 },  // Down
        { x: -1, y: 0 }  // Left
    ];
    
    return directions
        .map(dir => {
            const newX = node.x + dir.x;
            const newY = node.y + dir.y;
            return new SmartPathNode(newX, newY, node, node.actualCost + 1, targetX, targetY);
        })
        .filter(neighbor => isValidTile(neighbor.x, neighbor.y, map));
}
```

**💡 The Breakthrough**: By sorting the queue with `openList.sort((a, b) => a.heuristic - b.heuristic)`, we always explore the most promising tiles first. It's like having a GPS that says "this route LOOKS shorter" instead of trying every possible street!

## Game Integration: Click-to-Move 2.0

Now let's integrate our speed-demon pathfinding into a real game system:

```javascript
const gameWorld = {
    player: {
        x: 5,
        y: 5,
        isMoving: false,
        pathQueue: [],
        moveSpeed: 3
    },
    
    // Enhanced click handling with fast pathfinding
    handleClick(mouseX, mouseY) {
        const tileX = Math.floor(mouseX / TILE_SIZE);
        const tileY = Math.floor(mouseY / TILE_SIZE);
        
        if (!this.isValidTile(tileX, tileY)) return;
        
        // Use our smart pathfinding!
        const path = findPathBestFirst(
            this.player.x, 
            this.player.y, 
            tileX, 
            tileY, 
            gameMap
        );
        
        if (path) {
            this.player.pathQueue = path;
            this.player.isMoving = true;
            
            // Visual feedback
            this.showPathPreview(path);
            console.log(`🎯 Smart path found: ${path.length} steps!`);
        } else {
            console.log('❌ No path to target!');
            this.showErrorFeedback(tileX, tileY);
        }
    },
    
    // Smooth movement along the calculated path
    update() {
        if (!this.player.isMoving || this.player.pathQueue.length === 0) {
            return;
        }
        
        const nextWaypoint = this.player.pathQueue[0];
        const targetPixelX = nextWaypoint.x * TILE_SIZE + TILE_SIZE / 2;
        const targetPixelY = nextWaypoint.y * TILE_SIZE + TILE_SIZE / 2;
        
        // Move toward waypoint
        const dx = targetPixelX - this.player.sprite.x;
        const dy = targetPixelY - this.player.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.player.moveSpeed) {
            // Reached waypoint - move to next!
            this.player.x = nextWaypoint.x;
            this.player.y = nextWaypoint.y;
            this.player.sprite.x = targetPixelX;
            this.player.sprite.y = targetPixelY;
            
            this.player.pathQueue.shift();
            
            if (this.player.pathQueue.length === 0) {
                this.player.isMoving = false;
                console.log('🏁 Destination reached!');
            }
        } else {
            // Smooth movement
            this.player.sprite.x += (dx / distance) * this.player.moveSpeed;
            this.player.sprite.y += (dy / distance) * this.player.moveSpeed;
        }
    }
};
```

**Performance Boost**: Best-first search typically runs 5-10x faster than breadth-first, making real-time pathfinding viable for:
- **RTS games** with dozens of units
- **RPG companions** following the player
- **Tower defense** enemies navigating mazes
- **Puzzle games** with dynamic obstacles

## Advanced Optimizations: Enterprise-Level Performance

**{{< icon name="rocket-launch" >}} Pro-Level Techniques** for handling massive game worlds:

### 1. Hierarchical Pathfinding
For huge maps, don't search tile-by-tile - use waypoints!

```javascript
class HierarchicalPathfinder {
    constructor(map) {
        this.map = map;
        this.waypoints = this.generateWaypoints(); // Key navigation points
        this.waypointPaths = this.precalculatePaths(); // Pre-computed routes
    }
    
    findLongDistancePath(startX, startY, targetX, targetY) {
        // Step 1: Find nearest waypoints
        const startWaypoint = this.findNearestWaypoint(startX, startY);
        const targetWaypoint = this.findNearestWaypoint(targetX, targetY);
        
        // Step 2: Use pre-calculated waypoint-to-waypoint path
        const waypointPath = this.waypointPaths[startWaypoint][targetWaypoint];
        
        // Step 3: Add local paths (start → first waypoint, last waypoint → target)
        const fullPath = [
            ...findPathBestFirst(startX, startY, waypointPath[0].x, waypointPath[0].y, this.map),
            ...waypointPath,
            ...findPathBestFirst(waypointPath[waypointPath.length-1].x, waypointPath[waypointPath.length-1].y, targetX, targetY, this.map)
        ];
        
        return fullPath;
    }
}
```

### 2. Asynchronous Pathfinding
Prevent game freezes on complex searches:

```javascript
async function findPathAsync(startX, startY, targetX, targetY, map, maxStepsPerFrame = 50) {
    return new Promise((resolve) => {
        const startNode = new SmartPathNode(startX, startY, null, 0, targetX, targetY);
        const openList = [startNode];
        const closedSet = new Set();
        let stepCount = 0;
        
        function processChunk() {
            for (let i = 0; i < maxStepsPerFrame && openList.length > 0; i++) {
                openList.sort((a, b) => a.heuristic - b.heuristic);
                const current = openList.shift();
                stepCount++;
                
                if (current.x === targetX && current.y === targetY) {
                    resolve(buildPathArray(current));
                    return;
                }
                
                closedSet.add(current.getKey());
                
                // Add neighbors...
                const neighbors = getValidNeighbors(current, targetX, targetY, map);
                // ... processing logic
            }
            
            if (openList.length > 0) {
                requestAnimationFrame(processChunk); // Continue next frame
            } else {
                resolve(null); // No path found
            }
        }
        
        processChunk();
    });
}

// Usage: Non-blocking pathfinding
findPathAsync(startX, startY, targetX, targetY, gameMap).then(path => {
    if (path) {
        player.followPath(path);
    }
});
```

### 3. Smart Caching
```javascript
class PathfindingCache {
    constructor(maxSize = 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }
    
    getPath(startX, startY, targetX, targetY) {
        const key = `${startX},${startY}->${targetX},${targetY}`;
        return this.cache.get(key);
    }
    
    storePath(startX, startY, targetX, targetY, path) {
        if (this.cache.size >= this.maxSize) {
            // Remove oldest entry
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        const key = `${startX},${startY}->${targetX},${targetY}`;
        this.cache.set(key, path);
    }
}
```

**{{< icon name="confetti" >}} Incredible Achievement!** You've mastered intelligent pathfinding that's ready for professional game development! Your AI can now:

- {{< icon name="lightning" >}} **Find paths 5-10x faster** than basic breadth-first
- {{< icon name="brain" >}} **Make smart decisions** using heuristics
- 🏗️ **Scale to massive worlds** with hierarchical techniques  
- ⏱️ **Never freeze the game** with async processing
- {{< icon name="target" >}} **Handle real-time scenarios** like RTS games

**Next Level**: Ready to learn A* pathfinding? It combines the best of both worlds - the optimality of breadth-first with the speed of best-first. Your journey into advanced game AI is just beginning! {{< icon name="rocket-launch" >}}
        this.y = y;
        this.parent = parent;
        this.actualCost = actualCost;  // Steps taken to reach this tile
        this.heuristic = this.calculateHeuristic(targetX, targetY);
        this.estimatedTotal = actualCost + this.heuristic; // Best guess of total path cost
    }
    
    calculateHeuristic(targetX, targetY) {
        // Manhattan distance - our "smart guess"
        return Math.abs(this.x - targetX) + Math.abs(this.y - targetY);
    }
    
    getKey() {
        return `${this.x},${this.y}`;
    }
}

// The magic: Best-First Search with heuristic guidance
function findPathBestFirst(startX, startY, targetX, targetY, map) {
    const startNode = new SmartPathNode(startX, startY, null, 0, targetX, targetY);
    const openList = [startNode];     // Tiles to explore (priority queue)
    const closedSet = new Set();      // Tiles already fully explored
    
    while (openList.length > 0) {
        // {{< icon name="fire" >}} THE MAGIC: Sort by heuristic (best guess first!)
        openList.sort((a, b) => a.heuristic - b.heuristic);
        const current = openList.shift();
        
        // Found the target!
        if (current.x === targetX && current.y === targetY) {
            return buildPathArray(current);
        }
        
        // Mark as fully explored
        closedSet.add(current.getKey());
        
        // Explore neighbors
        const neighbors = getValidNeighbors(current, targetX, targetY, map);
        for (const neighbor of neighbors) {
            const key = neighbor.getKey();
            
            // Skip if already fully explored
            if (closedSet.has(key)) continue;
            
            // Add to exploration queue
            const existingIndex = openList.findIndex(node => node.getKey() === key);
            if (existingIndex === -1) {
                openList.push(neighbor);
            } else if (neighbor.actualCost < openList[existingIndex].actualCost) {
                // Found a better path to this tile!
                openList[existingIndex] = neighbor;
            }
        }
    }
    
    return null; // No path found
}

function getValidNeighbors(node, targetX, targetY, map) {
    const directions = [
        { x: 0, y: -1 }, // Up
        { x: 1, y: 0 },  // Right
        { x: 0, y: 1 },  // Down
        { x: -1, y: 0 }  // Left
    ];
    
    return directions
        .map(dir => {
            const newX = node.x + dir.x;
            const newY = node.y + dir.y;
            return new SmartPathNode(newX, newY, node, node.actualCost + 1, targetX, targetY);
        })
        .filter(neighbor => isValidTile(neighbor.x, neighbor.y, map));
}
```

**💡 The Breakthrough**: By sorting the queue with `openList.sort((a, b) => a.heuristic - b.heuristic)`, we always explore the most promising tiles first. It's like having a GPS that says "this route LOOKS shorter" instead of trying every possible street!


## Game Integration: Click-to-Move 2.0

Now let's integrate our speed-demon pathfinding into a real game system:

```javascript
const gameWorld = {
    player: {
        x: 5,
        y: 5,
        isMoving: false,
        pathQueue: [],
        moveSpeed: 3
    },
    
    // Enhanced click handling with fast pathfinding
    handleClick(mouseX, mouseY) {
        const tileX = Math.floor(mouseX / TILE_SIZE);
        const tileY = Math.floor(mouseY / TILE_SIZE);
        
        if (!this.isValidTile(tileX, tileY)) return;
        
        // Use our smart pathfinding!
        const path = findPathBestFirst(
            this.player.x, 
            this.player.y, 
            tileX, 
            tileY, 
            gameMap
        );
        
        if (path) {
            this.player.pathQueue = path;
            this.player.isMoving = true;
            
            // Visual feedback
            this.showPathPreview(path);
            console.log(`🎯 Smart path found: ${path.length} steps!`);
        } else {
            console.log('❌ No path to target!');
            this.showErrorFeedback(tileX, tileY);
        }
    },
    
    // Smooth movement along the calculated path
    update() {
        if (!this.player.isMoving || this.player.pathQueue.length === 0) {
            return;
        }
        
        const nextWaypoint = this.player.pathQueue[0];
        const targetPixelX = nextWaypoint.x * TILE_SIZE + TILE_SIZE / 2;
        const targetPixelY = nextWaypoint.y * TILE_SIZE + TILE_SIZE / 2;
        
        // Move toward waypoint
        const dx = targetPixelX - this.player.sprite.x;
        const dy = targetPixelY - this.player.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.player.moveSpeed) {
            // Reached waypoint - move to next!
            this.player.x = nextWaypoint.x;
            this.player.y = nextWaypoint.y;
            this.player.sprite.x = targetPixelX;
            this.player.sprite.y = targetPixelY;
            
            this.player.pathQueue.shift();
            
            if (this.player.pathQueue.length === 0) {
                this.player.isMoving = false;
                console.log('🏁 Destination reached!');
            }
        } else {
            // Smooth movement
            this.player.sprite.x += (dx / distance) * this.player.moveSpeed;
            this.player.sprite.y += (dy / distance) * this.player.moveSpeed;
        }
    }
};
```

**Performance Boost**: Best-first search typically runs 5-10x faster than breadth-first, making real-time pathfinding viable for:
- **RTS games** with dozens of units
- **RPG companions** following the player
- **Tower defense** enemies navigating mazes
- **Puzzle games** with dynamic obstacles