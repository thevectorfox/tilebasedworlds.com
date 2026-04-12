+++
title = "Dijkstra's — Terrain Costs"
date = 2026-03-10T09:00:00+11:00
weight = 2
draft = false
slug = "dijkstras"
tags = ["advanced", "pathfinding", "tutorial"]
prev = "/tutorial/a-thinking-world/bfs/"
next = "/tutorial/a-thinking-world/greedy-best-first/"
+++

What if your hero doesn't just want the shortest path — they want the *cheapest* one? {{< icon name="coins" >}} A battlefield isn't all flat floors. There's mud that slows you down, roads that speed you up, rivers you'd rather not wade through. Breadth-First Search treats every tile the same. **Dijkstra's algorithm** knows better.

Edsger Dijkstra published this algorithm in 1959 — originally to find the shortest driving route between two Dutch cities. Six decades later, it's still powering pathfinding in games from *Civilization* to *Dwarf Fortress* to your next project.

**What You'll Master:**
- Weighted terrain — mud, roads, and everything in between
- The priority queue: processing cheapest tiles first
- Why "shortest" and "cheapest" aren't always the same thing
- The upgrade path to A* (spoiler: it's one extra line)

**Prerequisites:**
- Completed the BFS tutorial
- Comfortable with the node/queue pattern from last time

{{< pixidemo title="Dijkstra's — Weighted Terrain" >}}
const app = new PIXI.Application();

await app.init({
    width: 320,
    height: 280,
    backgroundColor: 0x1a1a2e
});
document.body.appendChild(app.canvas);

const TILE_SIZE = 20;
const COLS = 16;
const ROWS = 13;

// Terrain types: 0=wall, 1=floor, 2=mud, 3=road
const TERRAIN = {
    WALL:  0,
    FLOOR: 1,
    MUD:   2,
    ROAD:  3
};

const TERRAIN_COST = {
    [TERRAIN.FLOOR]: 1,
    [TERRAIN.MUD]:   4,
    [TERRAIN.ROAD]:  0.5
};

const TERRAIN_COLOR = {
    [TERRAIN.WALL]:  0x2c3e50,
    [TERRAIN.FLOOR]: 0xe8e8e8,
    [TERRAIN.MUD]:   0x8B6914,
    [TERRAIN.ROAD]:  0xadd8e6
};

// Map: 0=wall, 1=floor, 2=mud, 3=road
const map = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,0,1,3,3,3,3,1,1,0],
    [0,1,2,2,2,1,1,0,1,3,0,0,3,1,1,0],
    [0,1,2,0,2,1,1,1,1,3,0,0,3,1,1,0],
    [0,1,2,2,2,1,1,1,1,3,3,3,3,1,1,0],
    [0,1,1,1,1,1,0,0,0,1,1,1,1,1,1,0],
    [0,3,3,3,1,1,1,1,1,1,2,2,1,1,1,0],
    [0,3,0,3,1,1,1,1,1,1,2,2,1,1,1,0],
    [0,3,3,3,1,1,0,0,0,0,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,2,2,1,1,1,1,1,1,0],
    [0,1,1,0,1,1,1,2,2,1,0,1,1,0,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

// Draw tiles
const tileGraphics = [];
for (let row = 0; row < ROWS; row++) {
    tileGraphics[row] = [];
    for (let col = 0; col < COLS; col++) {
        const g = new PIXI.Graphics();
        const t = map[row][col];
        g.rect(0, 0, TILE_SIZE, TILE_SIZE).fill(TERRAIN_COLOR[t] ?? TERRAIN_COLOR[TERRAIN.WALL]);
        if (t !== TERRAIN.WALL) g.stroke({ color: 0xcccccc, width: 0.5 });
        g.x = col * TILE_SIZE;
        g.y = row * TILE_SIZE;
        tileGraphics[row][col] = g;
        app.stage.addChild(g);
    }
}

// Legend
const legendData = [
    { color: 0xe8e8e8, label: 'Floor  (cost 1)' },
    { color: 0xadd8e6, label: 'Road   (cost 0.5)' },
    { color: 0x8B6914, label: 'Mud    (cost 4)' }
];
legendData.forEach((item, i) => {
    const swatch = new PIXI.Graphics();
    swatch.rect(0, 0, 10, 10).fill(item.color).stroke({ color: 0x888, width: 0.5 });
    swatch.x = 4; swatch.y = ROWS * TILE_SIZE + 4 + i * 14;
    app.stage.addChild(swatch);
    const label = new PIXI.Text({ text: item.label, style: { fontSize: 9, fill: 0xdddddd } });
    label.x = 18; label.y = ROWS * TILE_SIZE + 4 + i * 14;
    app.stage.addChild(label);
});

// --- Dijkstra's ---
class DNode {
    constructor(x, y, parent = null, cost = 0) {
        this.x = x; this.y = y;
        this.parent = parent;
        this.cost = cost;
    }
    key() { return `${this.x},${this.y}`; }
}

function isWalkable(x, y) {
    return x >= 0 && x < COLS && y >= 0 && y < ROWS && map[y][x] !== TERRAIN.WALL;
}

const DIRS = [{x:0,y:-1},{x:1,y:0},{x:0,y:1},{x:-1,y:0}];

let animRunning = false;
let startPos = { x: 1, y: 1 };

function resetMap() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const t = map[row][col];
            tileGraphics[row][col].clear()
                .rect(0, 0, TILE_SIZE, TILE_SIZE)
                .fill(TERRAIN_COLOR[t] ?? TERRAIN_COLOR[TERRAIN.WALL]);
            if (t !== TERRAIN.WALL) tileGraphics[row][col].stroke({ color: 0xcccccc, width: 0.5 });
        }
    }
}

function buildPath(endNode) {
    const path = [];
    let cur = endNode;
    while (cur.parent) { path.unshift(cur); cur = cur.parent; }
    let i = 0;
    function step() {
        if (i >= path.length) { animRunning = false; window.parent.postMessage({ type:'status', text:`✅ Total cost: ${endNode.cost.toFixed(1)} — try clicking somewhere else!` }, '*'); return; }
        const n = path[i++];
        tileGraphics[n.y][n.x].clear().rect(0,0,TILE_SIZE,TILE_SIZE).fill(0x00b894).stroke({color:0x00b894,width:0.5});
        setTimeout(step, 60);
    }
    step();
}

function runDijkstra(tx, ty) {
    resetMap();
    animRunning = true;
    window.parent.postMessage({ type:'status', text:'Calculating cheapest path...' }, '*');

    // Mark start + target
    tileGraphics[startPos.y][startPos.x].clear().rect(0,0,TILE_SIZE,TILE_SIZE).fill(0xfdcb6e);
    tileGraphics[ty][tx].clear().rect(0,0,TILE_SIZE,TILE_SIZE).fill(0xff6b6b);

    const dist = {};
    const queue = [new DNode(startPos.x, startPos.y)];
    dist[`${startPos.x},${startPos.y}`] = 0;

    function tick() {
        if (queue.length === 0) { animRunning = false; window.parent.postMessage({type:'status',text:'No path found!'}, '*'); return; }

        // Pull cheapest node (poor-man's priority queue — sort each step)
        queue.sort((a, b) => a.cost - b.cost);
        const cur = queue.shift();

        if (cur.x === tx && cur.y === ty) { buildPath(cur); return; }

        // Colour visited tiles
        const t = map[cur.y][cur.x];
        if (!(cur.x === startPos.x && cur.y === startPos.y)) {
            tileGraphics[cur.y][cur.x].clear()
                .rect(0,0,TILE_SIZE,TILE_SIZE)
                .fill(0x74b9ff)
                .stroke({color:0xcccccc,width:0.5});
        }

        for (const d of DIRS) {
            const nx = cur.x + d.x, ny = cur.y + d.y;
            if (!isWalkable(nx, ny)) continue;
            const tileCost = TERRAIN_COST[map[ny][nx]] ?? 1;
            const newCost = cur.cost + tileCost;
            const key = `${nx},${ny}`;
            if (dist[key] === undefined || newCost < dist[key]) {
                dist[key] = newCost;
                queue.push(new DNode(nx, ny, cur, newCost));
                if (!(nx === tx && ny === ty)) {
                    tileGraphics[ny][nx].clear()
                        .rect(0,0,TILE_SIZE,TILE_SIZE)
                        .fill(0xdfe6e9)
                        .stroke({color:0xcccccc,width:0.5});
                }
            }
        }

        setTimeout(tick, 30);
    }
    tick();
}

app.stage.interactive = true;
app.stage.on('pointerdown', (e) => {
    if (animRunning) return;
    const tx = Math.floor(e.global.x / TILE_SIZE);
    const ty = Math.floor(e.global.y / TILE_SIZE);
    if (ty < ROWS && isWalkable(tx, ty) && !(tx === startPos.x && ty === startPos.y)) {
        runDijkstra(tx, ty);
    }
});

window.parent.postMessage({ type:'status', text:'Click any tile — watch the path avoid mud and prefer roads!' }, '*');
{{< /pixidemo >}}

## What Just Happened?

Notice how the path snakes toward the **blue road tiles** even when a more direct route through the mud would use fewer steps? That's Dijkstra's algorithm at work — it found the route with the lowest *total cost*, not the fewest tiles.

Click somewhere reachable only via the mud patches and watch what happens. The algorithm will begrudgingly wade through when there's no better option, but it'll always find you the cheapest route.

This changes everything for world-building:

- **Roads** feel faster because they genuinely are — your AI will use them
- **Swamps and mud** become natural obstacles that influence routing without being walls
- **Terrain variety** has real mechanical consequences, not just visual flavour

## From Breadth-First to Dijkstra's: One Key Change

BFS uses a simple queue — tiles are processed in the order they're added. Dijkstra's replaces that with a **priority queue** — tiles are always processed in order of cheapest accumulated cost.

```javascript
// BFS: tiles queued in discovery order
const queue = [];
queue.push(startNode);
const current = queue.shift(); // always the oldest

// Dijkstra's: tiles queued by cost (cheapest first)
const openList = [];
openList.push(startNode);
openList.sort((a, b) => a.cost - b.cost); // sort every step
const current = openList.shift(); // always the cheapest
```

That single conceptual change — from "oldest first" to "cheapest first" — is the entire difference between the two algorithms. The rest of the code is almost identical.

## The Full Implementation

Here's Dijkstra's with proper terrain cost support:

```javascript
// Terrain movement costs
const TERRAIN_COST = {
    floor:  1,
    road:   0.5,   // faster — AI will prefer these
    mud:    4,     // slower — AI will avoid when possible
    water:  8      // very slow — AI only uses if necessary
};

class DijkstraNode {
    constructor(x, y, parent = null, cost = 0) {
        this.x = x;
        this.y = y;
        this.parent = parent;
        this.cost = cost; // total cost from start to this tile
    }
    key() { return `${this.x},${this.y}`; }
}

function findPathDijkstra(startX, startY, targetX, targetY, map) {
    const startNode = new DijkstraNode(startX, startY);
    const openList = [startNode];
    const bestCost = {};            // cheapest known cost to each tile
    bestCost[startNode.key()] = 0;

    while (openList.length > 0) {
        // Always process the cheapest node next
        openList.sort((a, b) => a.cost - b.cost);
        const current = openList.shift();

        // Reached the target!
        if (current.x === targetX && current.y === targetY) {
            return buildPath(current);
        }

        for (const dir of DIRECTIONS) {
            const nx = current.x + dir.x;
            const ny = current.y + dir.y;

            if (!isWalkable(nx, ny, map)) continue;

            // Cost to enter this neighbour
            const terrain = map[ny][nx];
            const stepCost = TERRAIN_COST[terrain] ?? 1;
            const newCost = current.cost + stepCost;

            const key = `${nx},${ny}`;
            if (bestCost[key] === undefined || newCost < bestCost[key]) {
                // This is a better route — record it and queue the node
                bestCost[key] = newCost;
                openList.push(new DijkstraNode(nx, ny, current, newCost));
            }
        }
    }

    return null; // no path exists
}
```

**The `bestCost` map is crucial.** Unlike BFS — where you only visit each tile once — Dijkstra's might revisit a tile if a cheaper route to it is discovered later. The `bestCost` check ensures we only ever follow the cheaper option.

## Terrain Costs in Practice

How you assign costs shapes how your world *feels* to play. Some examples:

```javascript
// An RPG overworld
const OVERWORLD_COSTS = {
    grass:    1,
    forest:   2,    // slows movement slightly
    mountain: 5,    // significant obstacle
    swamp:    8,    // almost impassable
    road:     0.5   // AI will always prefer these
};

// A factory floor stealth game
const FACTORY_COSTS = {
    floor:      1,
    catwalk:    1,
    grating:    2,   // noisy — guards avoid, player beware
    oil_spill:  6,   // hazard
    conveyor:   0.5  // free movement if going with the belt
};

// A naval strategy game
const NAVAL_COSTS = {
    open_sea:   1,
    shallows:   3,   // slow for big ships
    reefs:      10,  // dangerous
    harbour:    0.5  // fast passage
};
```

The same algorithm, wildly different game feel.

## Why Not Just Use BFS With More Walls?

You could fake terrain cost by duplicating tiles — turn every "mud" tile into a 4-tile-wide detour that forces longer paths. But that:

- Makes your map data enormous
- Breaks down with fractional costs (0.5 for roads)
- Is a maintenance nightmare when you want to tweak costs

Dijkstra's handles it natively and elegantly.

## Performance: The Priority Queue Problem

The `sort()` call above is fine for small maps, but it's `O(n log n)` every step. On a large map with thousands of open nodes, that adds up. The proper solution is a **min-heap** (binary heap priority queue):

```javascript
class MinHeap {
    constructor() { this.heap = []; }

    push(node) {
        this.heap.push(node);
        this._bubbleUp(this.heap.length - 1);
    }

    pop() {
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this._sinkDown(0);
        }
        return top;
    }

    get size() { return this.heap.length; }

    _bubbleUp(i) {
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.heap[parent].cost <= this.heap[i].cost) break;
            [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
            i = parent;
        }
    }

    _sinkDown(i) {
        while (true) {
            let smallest = i;
            const left = 2 * i + 1, right = 2 * i + 2;
            if (left < this.heap.length && this.heap[left].cost < this.heap[smallest].cost) smallest = left;
            if (right < this.heap.length && this.heap[right].cost < this.heap[smallest].cost) smallest = right;
            if (smallest === i) break;
            [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
            i = smallest;
        }
    }
}

// Usage: replace openList.sort() + shift() with heap.push() + pop()
const openHeap = new MinHeap();
openHeap.push(startNode);
// ...
const current = openHeap.pop(); // O(log n) instead of O(n log n)
```

For tutorial-scale maps (under 50×50), the sort version is perfectly readable and fast enough. Graduate to a proper heap when you start seeing frame-rate hiccups.

## What Dijkstra's Can't Do (Yet)

Dijkstra's is optimal — it will always find the cheapest path. But it's not *fast*. It explores tiles in all directions, including ones completely away from the target, because it doesn't know where the target is relative to the current search frontier.

Watch the demo again. See how the search ripples outward in every direction, even away from where you clicked? On a large open map this wastes a lot of work.

The fix is to give the algorithm a sense of *direction* — a heuristic estimate of how far each tile is from the target. That's exactly what A* does.

Dijkstra's + heuristic = **A\***. You're one tutorial away from the gold standard.

{{< icon name="arrow-right" >}} **Next up:** [Greedy Best-First](/tutorial/a-thinking-world/greedy-best-first/) — lightning-fast but occasionally wrong. Understanding its trade-offs is the final piece before A*.
