+++
title = "A*"
date = 2026-03-11T09:00:00+11:00
weight = 4
draft = false
slug = "astar"
tags = ["advanced", "pathfinding", "tutorial"]
prev = "/tutorial/a-thinking-world/greedy-best-first/"
next = "/tutorial/a-thinking-world/bringing-it-together/"
+++

This is the one. {{< icon name="star" >}} Every pathfinding tutorial builds toward this moment. A* (pronounced "A-star") is the algorithm used in more shipped games than any other — from *Age of Empires* to *Stardew Valley* to AAA blockbusters. It's optimal like Dijkstra's and fast like Greedy Best-First, because it's actually both of them fused together.

The insight is elegant: Dijkstra's tracks the real cost from start to each tile (`g`). Greedy Best-First estimates the remaining cost to the goal (`h`). A* simply **adds them together**: `f = g + h`. Prioritise by `f`, and you're guaranteed to find the shortest (or cheapest) path while exploring far fewer tiles than either algorithm alone.

**What You'll Master:**
- The `f = g + h` formula and what each term actually means
- Why A* beats Dijkstra's on speed without sacrificing correctness
- Where Best-First can fail and how A* fixes it
- Weighted terrain in an optimal algorithm
- The open/closed list pattern

**Prerequisites:**
- Dijkstra's (you understand `g` cost)
- Greedy Best-First (you understand heuristics)

{{< pixidemo title="A* vs Greedy Best-First" >}}
const app = new PIXI.Application();
await app.init({ width: 600, height: 260, backgroundColor: 0x1a1a2e });
document.body.appendChild(app.canvas);

const TILE_SIZE = 18;
const COLS = 16;
const ROWS = 13;
const PANEL = 300; // width of each half

// A maze where Greedy gets it wrong (long corridor trick)
const map = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
    [0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,0],
    [0,1,0,1,0,0,0,0,0,0,0,0,1,0,1,0],
    [0,1,0,1,0,1,1,1,1,1,1,0,1,0,1,0],
    [0,1,0,1,0,1,0,0,0,0,1,0,1,0,1,0],
    [0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0],
    [0,1,0,1,0,1,0,0,0,0,1,0,1,0,1,0],
    [0,1,0,1,0,0,0,0,0,0,0,0,1,0,1,0],
    [0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

const START = { x: 1, y: 1 };
const TARGET = { x: 14, y: 11 };

// --- Build two panel displays ---
function buildPanel(offsetX, label, labelColor) {
    const container = new PIXI.Container();
    container.x = offsetX;
    app.stage.addChild(container);

    const title = new PIXI.Text({ text: label, style: { fontSize: 11, fill: labelColor, fontWeight: 'bold' } });
    title.x = PANEL / 2 - title.width / 2;
    title.y = 3;
    container.addChild(title);

    const tiles = [];
    for (let row = 0; row < ROWS; row++) {
        tiles[row] = [];
        for (let col = 0; col < COLS; col++) {
            const g = new PIXI.Graphics();
            const isWall = map[row][col] === 0;
            g.rect(0, 0, TILE_SIZE, TILE_SIZE).fill(isWall ? 0x2c3e50 : 0xe8e8e8);
            if (!isWall) g.stroke({ color: 0xcccccc, width: 0.5 });
            g.x = col * TILE_SIZE;
            g.y = row * TILE_SIZE + 20;
            tiles[row][col] = g;
            container.addChild(g);
        }
    }
    return { tiles, container };
}

const greedyPanel = buildPanel(0,    'Greedy Best-First', 0xff7675);
const astarPanel  = buildPanel(PANEL, 'A*',               0x00b894);

// Divider
const div = new PIXI.Graphics();
div.rect(PANEL - 1, 0, 2, 260).fill(0x444466);
app.stage.addChild(div);

// Stat text
const statText = new PIXI.Text({ text: '', style: { fontSize: 9, fill: 0xffffff } });
statText.x = 4; statText.y = 244;
app.stage.addChild(statText);

// --- Pathfinding ---
function isWalkable(x, y) {
    return x >= 0 && x < COLS && y >= 0 && y < ROWS && map[y][x] === 1;
}

function manhattan(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

const DIRS = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];

class Node {
    constructor(x, y, parent = null, g = 0, h = 0) {
        this.x = x; this.y = y; this.parent = parent;
        this.g = g; // real cost from start
        this.h = h; // heuristic estimate to target
        this.f = g + h;
    }
    key() { return `${this.x},${this.y}`; }
}

function resetPanel(panel) {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const isWall = map[row][col] === 0;
            panel.tiles[row][col].clear()
                .rect(0, 0, TILE_SIZE, TILE_SIZE)
                .fill(isWall ? 0x2c3e50 : 0xe8e8e8);
            if (!isWall) panel.tiles[row][col].stroke({ color: 0xcccccc, width: 0.5 });
        }
    }
    panel.tiles[START.y][START.x].clear().rect(0, 0, TILE_SIZE, TILE_SIZE).fill(0xfdcb6e);
    panel.tiles[TARGET.y][TARGET.x].clear().rect(0, 0, TILE_SIZE, TILE_SIZE).fill(0xff6b6b);
}

function animatePath(tiles, endNode, color, onDone) {
    const path = [];
    let cur = endNode;
    while (cur.parent) { path.unshift(cur); cur = cur.parent; }
    let i = 0;
    function step() {
        if (i >= path.length) { if (onDone) onDone(path.length); return; }
        const n = path[i++];
        tiles[n.y][n.x].clear().rect(0, 0, TILE_SIZE, TILE_SIZE).fill(color).stroke({ color: 0x00b894, width: 0.5 });
        setTimeout(step, 50);
    }
    step();
    return path.length;
}

// Run both algorithms simultaneously, animated
function runBoth() {
    resetPanel(greedyPanel);
    resetPanel(astarPanel);
    statText.text = 'Running...';

    let greedyDone = false, astarDone = false;
    let greedySteps = 0, astarSteps = 0;
    let greedyPathLen = 0, astarPathLen = 0;

    function checkDone() {
        if (!greedyDone || !astarDone) return;
        statText.text =
            `Greedy: ${greedySteps} tiles explored, path ${greedyPathLen} steps   |   ` +
            `A*: ${astarSteps} tiles explored, path ${astarPathLen} steps`;
        window.parent.postMessage({ type: 'status', text:
            `Greedy explored ${greedySteps} tiles → path: ${greedyPathLen} steps | A* explored ${astarSteps} tiles → path: ${astarPathLen} steps`
        }, '*');
    }

    // --- Greedy (heuristic only, f = h) ---
    (function runGreedy() {
        const open = [new Node(START.x, START.y, null, 0, manhattan(START.x, START.y, TARGET.x, TARGET.y))];
        const closed = new Set();

        function tick() {
            if (open.length === 0) { greedyDone = true; checkDone(); return; }
            open.sort((a, b) => a.h - b.h); // sort by h only!
            const cur = open.shift();
            if (closed.has(cur.key())) { setTimeout(tick, 0); return; }
            closed.add(cur.key());
            greedySteps++;

            if (cur.x === TARGET.x && cur.y === TARGET.y) {
                animatePath(greedyPanel.tiles, cur, 0xff7675, (len) => {
                    greedyPathLen = len;
                    greedyDone = true;
                    checkDone();
                });
                return;
            }

            if (!(cur.x === START.x && cur.y === START.y)) {
                greedyPanel.tiles[cur.y][cur.x].clear()
                    .rect(0, 0, TILE_SIZE, TILE_SIZE).fill(0xfab1a0)
                    .stroke({ color: 0xcccccc, width: 0.5 });
            }

            for (const d of DIRS) {
                const nx = cur.x + d.x, ny = cur.y + d.y;
                if (!isWalkable(nx, ny) || closed.has(`${nx},${ny}`)) continue;
                open.push(new Node(nx, ny, cur, cur.g + 1, manhattan(nx, ny, TARGET.x, TARGET.y)));
                if (!(nx === TARGET.x && ny === TARGET.y)) {
                    greedyPanel.tiles[ny][nx].clear()
                        .rect(0, 0, TILE_SIZE, TILE_SIZE).fill(0xffe0dc)
                        .stroke({ color: 0xcccccc, width: 0.5 });
                }
            }
            setTimeout(tick, 20);
        }
        tick();
    })();

    // --- A* (f = g + h) ---
    (function runAStar() {
        const open = [new Node(START.x, START.y, null, 0, manhattan(START.x, START.y, TARGET.x, TARGET.y))];
        const closed = new Set();
        const bestG = {};
        bestG[`${START.x},${START.y}`] = 0;

        function tick() {
            if (open.length === 0) { astarDone = true; checkDone(); return; }
            open.sort((a, b) => a.f - b.f); // sort by f = g + h
            const cur = open.shift();
            if (closed.has(cur.key())) { setTimeout(tick, 0); return; }
            closed.add(cur.key());
            astarSteps++;

            if (cur.x === TARGET.x && cur.y === TARGET.y) {
                animatePath(astarPanel.tiles, cur, 0x00b894, (len) => {
                    astarPathLen = len;
                    astarDone = true;
                    checkDone();
                });
                return;
            }

            if (!(cur.x === START.x && cur.y === START.y)) {
                astarPanel.tiles[cur.y][cur.x].clear()
                    .rect(0, 0, TILE_SIZE, TILE_SIZE).fill(0x81ecec)
                    .stroke({ color: 0xcccccc, width: 0.5 });
            }

            for (const d of DIRS) {
                const nx = cur.x + d.x, ny = cur.y + d.y;
                if (!isWalkable(nx, ny) || closed.has(`${nx},${ny}`)) continue;
                const ng = cur.g + 1;
                const key = `${nx},${ny}`;
                if (bestG[key] !== undefined && ng >= bestG[key]) continue;
                bestG[key] = ng;
                open.push(new Node(nx, ny, cur, ng, manhattan(nx, ny, TARGET.x, TARGET.y)));
                if (!(nx === TARGET.x && ny === TARGET.y)) {
                    astarPanel.tiles[ny][nx].clear()
                        .rect(0, 0, TILE_SIZE, TILE_SIZE).fill(0xdfe6e9)
                        .stroke({ color: 0xcccccc, width: 0.5 });
                }
            }
            setTimeout(tick, 20);
        }
        tick();
    })();
}

// Auto-run on load, and re-run on click
runBoth();
app.stage.interactive = true;
app.stage.on('pointerdown', runBoth);
window.parent.postMessage({ type: 'status', text: 'Watch both algorithms race — click to replay!' }, '*');
{{< /pixidemo >}}

## The Formula That Changes Everything

Watch the tile counts in the status bar. A* almost always explores fewer tiles than Greedy Best-First while guaranteeing the optimal path — something Greedy can't promise.

On some maps Greedy will find the right answer anyway, but on others (especially with concave obstacles like the spiral above) it gets lured down dead ends and can't recover. A* doesn't have this problem because it balances the actual cost already paid against the estimated cost remaining.

The formula is three letters:

```
f = g + h
```

- **`g`** — the real, proven cost to reach this tile from the start (Dijkstra's part)
- **`h`** — the heuristic estimate of cost from here to the goal (Best-First's part)
- **`f`** — the best-guess total cost of a path through this tile

A* always expands the node with the lowest `f`. Tiles that are genuinely close to the start *and* close to the goal get processed first. Tiles far in the wrong direction have high `g` and high `h`, so they wait at the back of the queue — often never processed at all.

## The Implementation

A* is Dijkstra's with one extra field on each node:

```javascript
class AStarNode {
    constructor(x, y, parent = null, g = 0, targetX = 0, targetY = 0) {
        this.x = x;
        this.y = y;
        this.parent = parent;
        this.g = g;                                  // actual cost from start
        this.h = manhattan(x, y, targetX, targetY);  // heuristic estimate
        this.f = this.g + this.h;                    // total score
    }
    key() { return `${this.x},${this.y}`; }
}

function manhattan(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function findPathAStar(startX, startY, targetX, targetY, map) {
    const startNode = new AStarNode(startX, startY, null, 0, targetX, targetY);
    const openList = [startNode];
    const closedSet = new Set();
    const bestG = {};
    bestG[startNode.key()] = 0;

    while (openList.length > 0) {
        // Always process the node with the lowest f score
        openList.sort((a, b) => a.f - b.f);
        const current = openList.shift();

        // Skip if we already found a better route here
        if (closedSet.has(current.key())) continue;
        closedSet.add(current.key());

        // Arrived!
        if (current.x === targetX && current.y === targetY) {
            return buildPath(current);
        }

        for (const dir of DIRECTIONS) {
            const nx = current.x + dir.x;
            const ny = current.y + dir.y;
            if (!isWalkable(nx, ny, map)) continue;

            const newG = current.g + terrainCost(nx, ny, map);
            const key = `${nx},${ny}`;

            // Only queue this neighbour if we've found a new best route to it
            if (bestG[key] === undefined || newG < bestG[key]) {
                bestG[key] = newG;
                openList.push(new AStarNode(nx, ny, current, newG, targetX, targetY));
            }
        }
    }

    return null; // unreachable
}

function buildPath(endNode) {
    const path = [];
    let cur = endNode;
    while (cur.parent) { path.unshift({ x: cur.x, y: cur.y }); cur = cur.parent; }
    return path;
}
```

That's it. The only differences from Dijkstra's are the `h` and `f` fields and the fact that you sort by `f` instead of `g`.

## Choosing the Right Heuristic

The heuristic must never *overestimate* the real cost — if it does, A* loses its guarantee of finding the optimal path. A heuristic that never overestimates is called **admissible**.

**Manhattan distance** — the standard for 4-directional grid movement:

```javascript
function manhattan(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}
```

**Chebyshev distance** — for 8-directional movement (including diagonals):

```javascript
function chebyshev(x1, y1, x2, y2) {
    return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
}
```

**Euclidean distance** — also admissible, slightly better for open maps but slower to compute:

```javascript
function euclidean(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}
```

**Weighted heuristic** — trade optimality for speed by multiplying `h`:

```javascript
// w > 1 makes the search faster but potentially suboptimal
// w = 1 is standard A*
// w = 0 degenerates to Dijkstra's
const f = g + w * h; // where w is your weight factor
```

For most games, `w = 1.2` gives paths that are "good enough" and run noticeably faster on crowded maps.

## Combining A* with Terrain Costs

Add terrain costs to the `g` calculation and you get the best of all worlds — optimal paths that respect both terrain difficulty and heuristic direction:

```javascript
const TERRAIN_COST = { floor: 1, road: 0.5, mud: 4 };

function terrainCost(x, y, map) {
    return TERRAIN_COST[map[y][x]] ?? 1;
}

// In the main loop, just change the g calculation:
const newG = current.g + terrainCost(nx, ny, map);
```

A* with terrain costs will prefer roads to reach a distant target even if the direct tile-count path goes through mud. Dijkstra's does this too, but A* gets there faster.

## Tie-Breaking for Cleaner Paths

When many tiles share the same `f` score, the order they're processed can make paths look jagged. A small tie-breaking nudge produces neater results:

```javascript
// Add a tiny bias toward tiles closer to the target
// This breaks ties in favour of more "direct" routes
this.f = this.g + this.h + this.h * 0.001;
```

The `0.001` is small enough to never overestimate, but enough to guide A* toward cleaner diagonals when `f` values are equal.

## When to Use Each Algorithm

You now have the whole family:

| Algorithm | Optimal? | Speed | Terrain Costs? | Use When |
|---|---|---|---|---|
| BFS | Yes (uniform cost) | Slow | No | Simple mazes, small maps |
| Dijkstra's | Yes | Medium | Yes | Weighted terrain, no heuristic possible |
| Greedy Best-First | No | Fast | No | Real-time, approximate paths OK |
| **A\*** | **Yes** | **Fast** | **Yes** | **Almost everything** |

A* is the default choice for tile-based pathfinding. Reach for the others only when you have a specific reason.

{{< icon name="arrow-right" >}} **Next up:** [Bringing it Together](/tutorial/a-thinking-world/bringing-it-together/) — we'll build a full stealth game demo where a guard uses A* to hunt you down.
