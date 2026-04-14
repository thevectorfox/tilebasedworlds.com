+++
title = "Going Further"
date = 2026-03-13T09:00:00+11:00
weight = 6
draft = false
slug = "going-further"
tags = ["advanced", "pathfinding", "tutorial"]
prev = "/tutorial/a-thinking-world/bringing-it-together/"
+++

A* will take you a long way. Most shipped tile-based games use it and never need anything else. But pathfinding is a rich field, and knowing what's beyond the horizon helps you recognise when you've outgrown your tools. {{< icon name="compass" >}}

This chapter is a map of that territory — less code, more concepts, with enough implementation detail to get you started if you want to explore.

## Flow Fields — When Everyone Needs to Go the Same Place

Imagine a tower defence game with 200 enemies all heading toward the same target. Running A* for each one is 200 separate pathfinding calculations per replan cycle. Flow fields turn this inside out: **calculate the path once, for everyone**.

A flow field is a grid where every tile stores a direction vector pointing toward the goal. Instead of calculating a path, each unit just looks up its current tile and moves in the stored direction.

{{< pixidemo title="Flow Field" >}}
const app = new PIXI.Application();
await app.init({ width: 320, height: 260, backgroundColor: 0x1a1a2e });
document.body.appendChild(app.canvas);

const TILE = 20, COLS = 16, ROWS = 12;
const map = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0],
    [0,1,0,0,0,1,1,0,1,0,0,0,0,0,1,0],
    [0,1,0,1,0,1,1,1,1,1,1,0,1,0,1,0],
    [0,1,0,1,0,0,0,0,0,0,1,0,1,0,1,0],
    [0,1,1,1,1,1,0,1,0,1,1,0,1,0,1,0],
    [0,0,0,0,0,1,0,1,0,1,0,0,1,0,1,0],
    [0,1,1,1,0,1,0,1,0,1,0,1,1,0,1,0],
    [0,1,0,1,0,1,0,0,0,1,0,1,0,0,1,0],
    [0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,0],
    [0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];
const TARGET = { x: 14, y: 10 };

function isWalkable(x, y) { return x>=0&&COLS>x&&y>=0&&ROWS>y&&map[y][x]!==0; }
const DIRS = [{x:0,y:-1},{x:1,y:0},{x:0,y:1},{x:-1,y:0}];
const ARROW = ['↑','→','↓','←'];

// BFS outward from target to build cost field
function buildFlowField() {
    const dist = Array.from({length:ROWS}, () => new Array(COLS).fill(Infinity));
    const flow = Array.from({length:ROWS}, () => new Array(COLS).fill(null));
    const q = [TARGET];
    dist[TARGET.y][TARGET.x] = 0;

    while (q.length > 0) {
        const cur = q.shift();
        for (let di = 0; DIRS.length > di; di++) {
            const d = DIRS[di];
            const nx = cur.x + d.x, ny = cur.y + d.y;
            if (!isWalkable(nx, ny) || dist[ny][nx] !== Infinity) continue;
            dist[ny][nx] = dist[cur.y][cur.x] + 1;
            // Flow direction: point BACK toward lower cost (i.e., toward target)
            flow[ny][nx] = { dx: -d.x, dy: -d.y, arrow: ARROW[(di + 2) % 4] };
            q.push({ x: nx, y: ny });
        }
    }
    return { dist, flow };
}

const { dist, flow } = buildFlowField();

// Draw tiles and arrows
for (let row = 0; ROWS > row; row++) {
    for (let col = 0; COLS > col; col++) {
        const g = new PIXI.Graphics();
        const isWall = map[row][col] === 0;
        g.rect(1,1,TILE-2,TILE-2).fill(isWall ? 0x2c3e50 : 0x2d333b);
        g.x = col*TILE; g.y = row*TILE;
        app.stage.addChild(g);

        if (!isWall && flow[row][col]) {
            const d = dist[row][col];
            const maxD = Math.max(...dist.flat().filter(v => v !== Infinity));
            const heat = 1 - d / maxD;
            const r = Math.floor(heat * 80);
            const b = Math.floor((1 - heat) * 120 + 40);
            g.clear().rect(1,1,TILE-2,TILE-2).fill((r << 16) | b);

            const lbl = new PIXI.Text({ text: flow[row][col].arrow, style: { fontSize: 9, fill: 0xffffff } });
            lbl.x = col*TILE + 5; lbl.y = row*TILE + 4;
            app.stage.addChild(lbl);
        }
    }
}

// Target marker
const tg = new PIXI.Graphics();
tg.circle(TILE/2, TILE/2, 6).fill(0x56d364);
tg.x = TARGET.x*TILE; tg.y = TARGET.y*TILE;
app.stage.addChild(tg);

// Spawn agents and let them follow the field
const agents = [];
for (let i = 0; i < 12; i++) {
    let ax, ay;
    do { ax = Math.floor(Math.random()*COLS); ay = Math.floor(Math.random()*ROWS); }
    while (!isWalkable(ax, ay) || (ax===TARGET.x && ay===TARGET.y));

    const s = new PIXI.Graphics();
    s.circle(TILE/2, TILE/2, 4).fill(0x79c0ff);
    s.x = ax*TILE; s.y = ay*TILE;
    app.stage.addChild(s);
    agents.push({ x: ax, y: ay, px: ax*TILE, py: ay*TILE, done: false, sprite: s });
}

let arrived = 0;
app.ticker.add(() => {
    agents.forEach(a => {
        if (a.done) return;
        if (a.x === TARGET.x && a.y === TARGET.y) { a.done = true; arrived++; a.sprite.clear().circle(TILE/2,TILE/2,4).fill(0x56d364); return; }
        const dir = flow[a.y][a.x];
        if (!dir) return;
        const nx = a.x + dir.dx, ny = a.y + dir.dy;
        if (isWalkable(nx, ny)) { a.x = nx; a.y = ny; }
        a.px += (a.x*TILE - a.px) * 0.15;
        a.py += (a.y*TILE - a.py) * 0.15;
        a.sprite.x = a.px; a.sprite.y = a.py;
    });
    if (arrived === agents.length) {
        window.parent.postMessage({type:'status',text:'All agents arrived! The flow field calculated the path once for all 12.'}, '*');
    }
});

window.parent.postMessage({type:'status',text:'Flow field: one BFS from target, infinite agents for free'}, '*');
{{< /pixidemo >}}

The colours show distance from the target (warmer = closer). Each blue agent follows the arrows without running a single A* search. When the target moves, you rebuild the field once and all 200 enemies automatically reroute.

```javascript
// Build a flow field from a target position
function buildFlowField(targetX, targetY, map) {
    const COLS = map[0].length, ROWS = map.length;
    const dist = Array.from({ length: ROWS }, () => new Array(COLS).fill(Infinity));
    const flow = Array.from({ length: ROWS }, () => new Array(COLS).fill(null));

    // Flood-fill outward from the target using BFS
    const queue = [{ x: targetX, y: targetY }];
    dist[targetY][targetX] = 0;

    while (queue.length > 0) {
        const { x, y } = queue.shift();

        for (const dir of DIRECTIONS) {
            const nx = x + dir.x, ny = y + dir.y;
            if (!isWalkable(nx, ny, map) || dist[ny][nx] !== Infinity) continue;

            dist[ny][nx] = dist[y][x] + 1;
            // This tile's flow direction points back toward lower cost
            flow[ny][nx] = { dx: -dir.x, dy: -dir.y };
            queue.push({ x: nx, y: ny });
        }
    }

    return flow;
}

// An agent just looks up its tile's direction — O(1) per frame, per agent
function moveAgent(agent, flow) {
    const dir = flow[agent.y][agent.x];
    if (dir) {
        agent.x += dir.dx;
        agent.y += dir.dy;
    }
}
```

**When to use flow fields:** Any situation where many agents share the same destination — tower defence, crowd simulation, horde-mode enemies. The upfront BFS cost is paid once; agents are essentially free after that.

**When A\* is still better:** When agents have different destinations, or when destinations change so frequently that rebuilding the field is expensive.

## Jump Point Search — A\* on a Diet

A\* on a large open grid wastes time expanding symmetrical paths. If you're heading northeast, there are many equivalent-length routes. Jump Point Search (JPS) prunes this symmetry by skipping over uninteresting tiles and jumping directly to "forced neighbours" — tiles where a change of direction is required.

The result is A\* that can be 10–40× faster on open grids with few obstacles, with identical optimal paths.

```javascript
// The core JPS idea: instead of expanding every neighbour,
// jump in the current direction until you hit a wall or forced neighbour

function jump(x, y, dx, dy, targetX, targetY, map) {
    // Move in direction (dx, dy) from (x, y)
    let nx = x + dx, ny = y + dy;

    if (!isWalkable(nx, ny, map)) return null; // hit a wall

    if (nx === targetX && ny === targetY) return { x: nx, y: ny }; // found goal!

    // Check for forced neighbours (simplified horizontal case)
    if (dx !== 0 && dy === 0) {
        // Moving horizontally — forced if there's a wall above/below
        // with a walkable tile diagonally ahead
        if ((!isWalkable(nx, ny - 1, map) && isWalkable(nx + dx, ny - 1, map)) ||
            (!isWalkable(nx, ny + 1, map) && isWalkable(nx + dx, ny + 1, map))) {
            return { x: nx, y: ny }; // forced neighbour — this is a jump point
        }
    }

    // Continue jumping in the same direction
    return jump(nx, ny, dx, dy, targetX, targetY, map);
}
```

JPS is significantly more complex to implement fully than A*, especially with diagonal movement and variable terrain costs. Use a well-tested library (`@pixi/pathfinding`, `pathfinding.js`) rather than rolling your own from scratch unless you need the learning experience.

**When to reach for JPS:** Large open maps (100×100+) where A\* is noticeably slow. Urban grids with corridors — JPS shines there.

## Hierarchical Pathfinding (HPA\*)

*The Witcher 3* map is enormous. Running A\* at tile resolution across the full world would take seconds per query. The solution is to work at multiple scales simultaneously.

HPA\* divides the map into chunks and pre-computes paths between chunks. A long-distance query finds the sequence of chunks (cheap, coarse), then uses A\* only within the start and end chunks (fast, local).

```javascript
class HierarchicalPathfinder {
    constructor(map, chunkSize = 10) {
        this.map = map;
        this.chunkSize = chunkSize;
        this.abstract = this.buildAbstractGraph();
    }

    buildAbstractGraph() {
        // 1. Divide map into chunks
        // 2. Find "entrances" — walkable tiles on chunk borders
        // 3. Pre-compute intra-chunk paths between all entrance pairs
        // Returns a high-level graph of entrances and inter-entrance costs
    }

    findPath(startX, startY, targetX, targetY) {
        // 1. Connect start/target to nearest chunk entrances
        // 2. A* on the abstract graph (small, fast)
        // 3. Stitch together concrete paths at chunk boundaries
        // Result: optimal or near-optimal, orders of magnitude faster
    }
}
```

This is the approach used in large open-world RPGs and RTS games. It's complex to implement but well-documented — search for "HPA* pathfinding" for detailed papers and implementations.

## Bidirectional A\*

Standard A\* searches from start toward goal. Bidirectional A\* runs two simultaneous searches — one from the start, one from the goal — and stops when the two frontiers meet. In theory this halves the search space.

```javascript
function findPathBidirectional(startX, startY, targetX, targetY, map) {
    const forwardOpen  = [new Node(startX, startY, null, 0, h(startX, startY, targetX, targetY))];
    const backwardOpen = [new Node(targetX, targetY, null, 0, h(targetX, targetY, startX, startY))];
    const forwardClosed  = new Map();
    const backwardClosed = new Map();

    while (forwardOpen.length > 0 && backwardOpen.length > 0) {
        expandBest(forwardOpen, forwardClosed, backwardClosed);
        expandBest(backwardOpen, backwardClosed, forwardClosed);

        // Check if the two searches have met
        const meeting = findMeetingPoint(forwardClosed, backwardClosed);
        if (meeting) return reconstructBidirectionalPath(meeting, forwardClosed, backwardClosed);
    }
    return null;
}
```

In practice, bidirectional search is tricky to implement correctly (the meeting point detection is subtle) and the gains are less dramatic than the theory suggests on tile maps. Worth knowing about, but probably not your first optimisation to reach for.

## Navigation Meshes

Everything so far has assumed a grid. Navigation meshes (navmeshes) throw out that assumption entirely.

Instead of a grid of tiles, a navmesh is a polygon mesh — the walkable surface divided into convex polygons. A* runs on the polygon graph (far fewer nodes than a tile grid), then paths are further smoothed with a funnel algorithm that pulls the path taut like a string through the polygons.

This is standard in 3D games (Unity, Unreal both have navmesh built in) and increasingly used in 2D games with irregular geometry — think physics-based platformers or games with destructible terrain.

For tile-based games on a regular grid, navmeshes aren't usually worth the implementation complexity. But if you ever move toward irregular geometry, this is the tool.

## Pathfinding as a Service

For multiplayer games, you may want to run pathfinding server-side to prevent clients from cheating (submitting paths that walk through walls). A path request/response model works well:

```javascript
// Client sends intent:
socket.emit('move_request', { targetX: 10, targetY: 5 });

// Server validates, pathfinds, and authorises:
socket.on('move_request', ({ targetX, targetY }) => {
    const path = findPath(player.x, player.y, targetX, targetY, serverMap);
    if (path) {
        socket.emit('move_approved', { path });
        applyPath(player, path); // authoritative state update
    } else {
        socket.emit('move_denied', { reason: 'unreachable' });
    }
});
```

The client plays animations immediately (for responsiveness) and reconciles with the server's authoritative position when the response arrives.

## What to Read Next

If you want to go deep on pathfinding theory and cutting-edge techniques:

**Amit Patel's pathfinding guide** (redblobgames.com) is the canonical web resource — interactive, beautifully illustrated, and covers everything from BFS through A*, flow fields, and beyond. Required reading.

**"Artificial Intelligence for Games" by Millington & Funge** is the textbook for game AI. Chapter 4 covers pathfinding exhaustively. Worth having on the shelf.

**The A\* paper** — Hart, Nilsson & Raphael (1968) — is surprisingly readable. Understanding the original proof of optimality clarifies exactly what "admissible heuristic" means and why it matters.

## Where This Series Goes Next

You've built a thinking world. Characters can navigate, avoid terrain, hunt the player, and patrol dynamically. That's the foundation for almost every game AI system.

The next series tackle what those thinking characters actually *do* when they arrive at their destination — decision-making, behaviour trees, and emergent simulation. But first:

{{< icon name="arrow-right" >}} **[A Smarter World](/tutorial/a-smarter-world/)** — behaviour trees, steering behaviours, and making characters that don't just pathfind but *act*.

{{< icon name="arrow-right" >}} **[A Random World](/tutorial/a-random-world/)** — procedural generation. The maps your A\* navigates don't have to be hand-designed.

{{< icon name="arrow-right" >}} **[A Living World](/tutorial/a-living-world/)** — ecosystems, resource simulation, and giving your NPCs things to actually care about.

You've given your world the ability to think. Now give it something worth thinking about.
