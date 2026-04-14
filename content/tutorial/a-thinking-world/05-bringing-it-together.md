+++
title = "Bringing it Together"
date = 2026-03-12T09:00:00+11:00
weight = 5
draft = false
slug = "bringing-it-together"
tags = ["advanced", "pathfinding", "tutorial"]
prev = "/tutorial/a-thinking-world/astar/"
next = "/tutorial/a-thinking-world/going-further/"
+++

Four algorithms. One demo. {{< icon name="detective" >}} Time to put everything together into something that actually feels like a game.

You're the intruder. You have a 5-second head start before the guard wakes up. The guard uses A* to track your last known position — not your current position, because fair is fair and omniscient guards aren't fun. Break line of sight, hide in the shadows, and get to the exit before you get caught.

Below the game you can switch the guard's brain between all four algorithms you've learned, and watch how radically their behaviour changes. Greedy Best-First will beeline toward you but get confused by corners. Breadth-First will methodically comb every tile. Dijkstra's will plot around the slower floors. A* will hunt you down with cold precision.

**What This Chapter Covers:**
- Wiring pathfinding into a real game loop
- Line-of-sight detection with raycasting
- Guard state machines (patrol → alert → chase)
- Dynamic replanning (the guard re-routes as you move)
- How algorithm choice shapes the player experience

{{< pixidemo title="Stealth — Guard AI Showdown" >}}
const app = new PIXI.Application();
await app.init({ width: 480, height: 340, backgroundColor: 0x0d1117 });
document.body.appendChild(app.canvas);

const TILE = 20;
const COLS = 24;
const ROWS = 15;

// 0=wall, 1=floor, 2=shadow (half dark tile, still walkable)
const map = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,0],
    [0,1,0,0,1,1,0,1,0,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0],
    [0,1,0,0,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,0,0,0,1,0],
    [0,1,1,1,1,1,0,0,0,1,1,0,0,0,1,0,1,0,0,0,1,0,1,0],
    [0,0,0,1,0,1,1,1,0,1,1,1,1,0,1,0,1,1,1,1,1,0,1,0],
    [0,1,1,1,0,0,0,1,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0],
    [0,1,0,1,1,1,0,1,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,0],
    [0,1,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,1,0,0,0,1,0],
    [0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1,1,1,0,1,0],
    [0,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,1,0,1,0],
    [0,1,0,1,1,1,0,1,0,0,0,1,0,1,1,1,1,1,1,0,1,0,1,0],
    [0,1,0,0,0,1,0,1,1,1,1,1,0,1,0,0,0,0,1,0,0,0,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

const PLAYER_START = { x: 1, y: 1 };
const GUARD_START  = { x: 22, y: 13 };
const EXIT         = { x: 22, y: 1 };

// --- Colours ---
const C = {
    wall:     0x1c2128,
    floor:    0x2d333b,
    floorLit: 0x373e47,
    exit:     0x56d364,
    player:   0x79c0ff,
    guard:    0xff7b72,
    sight:    0xffa657,
    path:     0x6e7681
};

// --- Scene graph ---
const tileLayer   = new PIXI.Container(); app.stage.addChild(tileLayer);
const overlayLayer = new PIXI.Container(); app.stage.addChild(overlayLayer);
const entityLayer = new PIXI.Container(); app.stage.addChild(entityLayer);
const uiLayer     = new PIXI.Container(); app.stage.addChild(uiLayer);

// Draw base tiles
const tiles = [];
for (let row = 0; row < ROWS; row++) {
    tiles[row] = [];
    for (let col = 0; col < COLS; col++) {
        const g = new PIXI.Graphics();
        const isWall = map[row][col] === 0;
        g.rect(1, 1, TILE - 2, TILE - 2).fill(isWall ? C.wall : C.floor);
        g.x = col * TILE; g.y = row * TILE;
        tiles[row][col] = g;
        tileLayer.addChild(g);
    }
}

// Exit marker
tiles[EXIT.y][EXIT.x].clear().rect(1, 1, TILE - 2, TILE - 2).fill(C.exit);
const exitLabel = new PIXI.Text({ text: 'EXIT', style: { fontSize: 7, fill: 0x0d1117, fontWeight: 'bold' } });
exitLabel.x = EXIT.x * TILE + 2; exitLabel.y = EXIT.y * TILE + 6;
tileLayer.addChild(exitLabel);

// Player sprite
const playerSprite = new PIXI.Graphics();
playerSprite.circle(TILE / 2, TILE / 2, 6).fill(C.player);
entityLayer.addChild(playerSprite);

// Guard sprite
const guardSprite = new PIXI.Graphics();
guardSprite.circle(TILE / 2, TILE / 2, 7).fill(C.guard);
entityLayer.addChild(guardSprite);

// Guard sight cone overlay (redrawn each frame)
const sightOverlay = new PIXI.Graphics();
overlayLayer.addChild(sightOverlay);

// Path preview dots
const pathDots = [];

// UI
const statusText = new PIXI.Text({ text: '', style: { fontSize: 10, fill: 0xffffff } });
statusText.x = 4; statusText.y = ROWS * TILE + 2;
uiLayer.addChild(statusText);

// Algorithm selector buttons
const algorithms = ['A*', 'Greedy', 'Dijkstra', 'BFS'];
let selectedAlgo = 'A*';
const algoButtons = [];

algorithms.forEach((name, i) => {
    const btn = new PIXI.Graphics();
    const w = 62, h = 16;
    btn.rect(0, 0, w, h).fill(0x2d333b).stroke({ color: 0x6e7681, width: 1 });
    btn.x = 4 + i * (w + 4);
    btn.y = ROWS * TILE + 16;
    btn.interactive = true;
    btn.cursor = 'pointer';
    uiLayer.addChild(btn);

    const label = new PIXI.Text({ text: name, style: { fontSize: 9, fill: 0xadbac7 } });
    label.x = btn.x + w / 2 - label.width / 2;
    label.y = btn.y + 3;
    uiLayer.addChild(label);

    btn.on('pointerdown', () => {
        selectedAlgo = name;
        updateAlgoUI();
        guardState.path = null; // force replan
    });

    algoButtons.push({ btn, label, name });
});

function updateAlgoUI() {
    algoButtons.forEach(({ btn, label, name }) => {
        const active = name === selectedAlgo;
        btn.clear().rect(0, 0, 62, 16).fill(active ? 0x388bfd : 0x2d333b).stroke({ color: active ? 0x79c0ff : 0x6e7681, width: 1 });
        label.style.fill = active ? 0xffffff : 0xadbac7;
    });
}
updateAlgoUI();

// Resize app to include UI
app.renderer.resize(COLS * TILE, ROWS * TILE + 36);

// --- Pathfinding ---
function isWalkable(x, y) {
    return x >= 0 && x < COLS && y >= 0 && y < ROWS && map[y][x] !== 0;
}

const DIRS4 = [{ x:0, y:-1 }, { x:1, y:0 }, { x:0, y:1 }, { x:-1, y:0 }];

function manhattan(x1, y1, x2, y2) { return Math.abs(x1 - x2) + Math.abs(y1 - y2); }

class PNode {
    constructor(x, y, parent, g, h) {
        this.x = x; this.y = y; this.parent = parent;
        this.g = g !== undefined ? g : 0; this.h = h !== undefined ? h : 0; this.f = this.g + this.h;
    }
    key() { return `${this.x},${this.y}`; }
}

function findPath(algo, sx, sy, tx, ty) {
    if (!isWalkable(tx, ty)) return null;

    const open = [];
    const closed = new Set();
    const bestG = {};

    const start = new PNode(sx, sy, null, 0, manhattan(sx, sy, tx, ty));
    open.push(start);
    bestG[start.key()] = 0;

    while (open.length > 0) {
        // Sort strategy depends on algorithm
        if (algo === 'A*')      open.sort((a, b) => a.f - b.f);
        else if (algo === 'Greedy')   open.sort((a, b) => a.h - b.h);
        else if (algo === 'Dijkstra') open.sort((a, b) => a.g - b.g);
        else /* BFS */          {}  // no sort needed, already FIFO via push

        const cur = open.shift();
        if (closed.has(cur.key())) continue;
        closed.add(cur.key());

        if (cur.x === tx && cur.y === ty) {
            const path = [];
            let c = cur;
            while (c.parent) { path.unshift({ x: c.x, y: c.y }); c = c.parent; }
            return path;
        }

        for (const d of DIRS4) {
            const nx = cur.x + d.x, ny = cur.y + d.y;
            if (!isWalkable(nx, ny) || closed.has(`${nx},${ny}`)) continue;
            const ng = cur.g + 1;
            const key = `${nx},${ny}`;
            if (bestG[key] !== undefined && ng >= bestG[key]) continue;
            bestG[key] = ng;
            open.push(new PNode(nx, ny, cur, ng, manhattan(nx, ny, tx, ty)));
        }
    }
    return null;
}

// --- Line of sight (DDA raycasting) ---
function hasLineOfSight(ax, ay, bx, by) {
    let dx = bx - ax, dy = by - ay;
    const steps = Math.max(Math.abs(dx), Math.abs(dy)) * 2;
    if (steps === 0) return true;
    dx /= steps; dy /= steps;
    let cx = ax + 0.5, cy = ay + 0.5;
    for (let i = 0; i < steps; i++) {
        const tx = Math.floor(cx), ty = Math.floor(cy);
        if (tx !== bx || ty !== by) {
            if (!isWalkable(tx, ty)) return false;
        }
        cx += dx; cy += dy;
    }
    return true;
}

// --- Game state ---
const player = {
    x: PLAYER_START.x, y: PLAYER_START.y,
    px: PLAYER_START.x * TILE, py: PLAYER_START.y * TILE,
    moving: false,
    dead: false, won: false
};

const guardState = {
    x: GUARD_START.x, y: GUARD_START.y,
    px: GUARD_START.x * TILE, py: GUARD_START.y * TILE,
    path: null,
    pathStep: 0,
    replanTimer: 0,
    lastKnownPlayer: null,
    state: 'sleeping', // sleeping → patrol → alert → chase
    sleepTimer: 180,   // 3s at 60fps
    alertFlash: 0
};

// Guard patrol waypoints
const patrol = [
    { x: 22, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 13 }, { x: 22, y: 13 }
];
let patrolIndex = 0;

// Input
const keys = {};
window.addEventListener('keydown', e => { keys[e.key] = true; });
window.addEventListener('keyup',   e => { keys[e.key] = false; });

let moveTimer = 0;
let gameOver = false;
let gameOverTimer = 0;

function resetGame() {
    player.x = PLAYER_START.x; player.y = PLAYER_START.y;
    player.px = player.x * TILE; player.py = player.y * TILE;
    player.moving = false; player.dead = false; player.won = false;
    guardState.x = GUARD_START.x; guardState.y = GUARD_START.y;
    guardState.px = guardState.x * TILE; guardState.py = guardState.y * TILE;
    guardState.path = null; guardState.pathStep = 0;
    guardState.lastKnownPlayer = null;
    guardState.state = 'sleeping'; guardState.sleepTimer = 180;
    patrolIndex = 0; moveTimer = 0; gameOver = false; gameOverTimer = 0;
}

// --- Draw sight cone ---
function drawSight() {
    sightOverlay.clear();
    if (guardState.state === 'sleeping') return;

    const SIGHT_RADIUS = 5;
    const gx = guardState.x, gy = guardState.y;

    for (let dy = -SIGHT_RADIUS; dy <= SIGHT_RADIUS; dy++) {
        for (let dx = -SIGHT_RADIUS; dx <= SIGHT_RADIUS; dx++) {
            const tx = gx + dx, ty = gy + dy;
            if (!isWalkable(tx, ty)) continue;
            if (Math.abs(dx) + Math.abs(dy) > SIGHT_RADIUS * 1.4) continue;
            if (hasLineOfSight(gx, gy, tx, ty)) {
                const alpha = guardState.state === 'chase' ? 0.3 : 0.15;
                sightOverlay.rect(tx * TILE, ty * TILE, TILE, TILE)
                    .fill({ color: C.sight, alpha });
            }
        }
    }
}

// --- Path preview dots ---
function showPath(path) {
    pathDots.forEach(d => overlayLayer.removeChild(d));
    pathDots.length = 0;
    if (!path) return;
    path.forEach((step, i) => {
        if (i % 2 !== 0) return;
        const dot = new PIXI.Graphics();
        dot.circle(TILE / 2, TILE / 2, 2).fill({ color: C.path, alpha: 0.6 });
        dot.x = step.x * TILE; dot.y = step.y * TILE;
        overlayLayer.addChild(dot);
        pathDots.push(dot);
    });
}

// --- Main loop ---
app.ticker.add((ticker) => {
    if (gameOver) {
        gameOverTimer++;
        if (gameOverTimer > 120) resetGame();
        return;
    }

    // --- Player movement ---
    moveTimer++;
    if (moveTimer >= 8 && !player.dead && !player.won) {
        let mx = 0, my = 0;
        if (keys['ArrowLeft']  || keys['a']) mx = -1;
        if (keys['ArrowRight'] || keys['d']) mx =  1;
        if (keys['ArrowUp']    || keys['w']) my = -1;
        if (keys['ArrowDown']  || keys['s']) my =  1;

        if (mx !== 0 || my !== 0) {
            const nx = player.x + mx, ny = player.y + my;
            if (isWalkable(nx, ny)) { player.x = nx; player.y = ny; }
            moveTimer = 0;
        }
    }

    // Smooth player position
    player.px += (player.x * TILE - player.px) * 0.25;
    player.py += (player.y * TILE - player.py) * 0.25;
    playerSprite.x = player.px; playerSprite.y = player.py;

    // --- Guard logic ---
    if (guardState.state === 'sleeping') {
        guardState.sleepTimer--;
        if (guardState.sleepTimer <= 0) {
            guardState.state = 'patrol';
            guardState.path = findPath(selectedAlgo, guardState.x, guardState.y, patrol[patrolIndex].x, patrol[patrolIndex].y);
        }
        statusText.text = `Guard sleeping... ${Math.ceil(guardState.sleepTimer / 60)}s  |  WASD to move  |  Reach EXIT`;
    }

    // Can guard see player?
    const canSee = guardState.state !== 'sleeping' &&
        manhattan(guardState.x, guardState.y, player.x, player.y) <= 5 &&
        hasLineOfSight(guardState.x, guardState.y, player.x, player.y);

    if (canSee) {
        guardState.lastKnownPlayer = { x: player.x, y: player.y };
        if (guardState.state !== 'chase') {
            guardState.state = 'chase';
            guardState.alertFlash = 30;
            guardState.path = findPath(selectedAlgo, guardState.x, guardState.y, player.x, player.y);
        }
    } else if (guardState.state === 'chase') {
        // Lost sight — move to last known position then patrol
        guardState.state = 'alert';
        guardState.path = findPath(selectedAlgo, guardState.x, guardState.y,
            guardState.lastKnownPlayer.x, guardState.lastKnownPlayer.y);
    }

    // Replan during chase
    if (guardState.state === 'chase') {
        guardState.replanTimer++;
        if (guardState.replanTimer >= 30) {
            guardState.replanTimer = 0;
            guardState.path = findPath(selectedAlgo, guardState.x, guardState.y, player.x, player.y);
            guardState.pathStep = 0;
        }
    }

    // Move guard along path
    if (guardState.path && guardState.pathStep < guardState.path.length) {
        const speed = guardState.state === 'chase' ? 0.12 : 0.07;
        const target = guardState.path[guardState.pathStep];
        guardState.px += (target.x * TILE - guardState.px) * speed;
        guardState.py += (target.y * TILE - guardState.py) * speed;

        if (Math.abs(guardState.px - target.x * TILE) < 1 && Math.abs(guardState.py - target.y * TILE) < 1) {
            guardState.x = target.x; guardState.y = target.y;
            guardState.pathStep++;

            if (guardState.pathStep >= guardState.path.length) {
                guardState.path = null; guardState.pathStep = 0;

                if (guardState.state === 'patrol') {
                    patrolIndex = (patrolIndex + 1) % patrol.length;
                    guardState.path = findPath(selectedAlgo, guardState.x, guardState.y, patrol[patrolIndex].x, patrol[patrolIndex].y);
                } else if (guardState.state === 'alert') {
                    guardState.state = 'patrol';
                    guardState.path = findPath(selectedAlgo, guardState.x, guardState.y, patrol[patrolIndex].x, patrol[patrolIndex].y);
                }
            }
        }
    }

    guardSprite.x = guardState.px; guardSprite.y = guardState.py;

    // Show guard path in debug
    if (guardState.state === 'chase') showPath(guardState.path);
    else showPath(null);

    // Sight cone
    drawSight();

    // Guard colour by state
    const guardColors = { sleeping: 0x444444, patrol: C.guard, alert: 0xffab00, chase: 0xff0000 };
    guardSprite.clear().circle(TILE / 2, TILE / 2, 7).fill(guardColors[guardState.state] || C.guard);
    if (guardState.alertFlash > 0) {
        guardState.alertFlash--;
        guardSprite.clear().circle(TILE / 2, TILE / 2, 7 + Math.sin(guardState.alertFlash * 0.5) * 3).fill(0xffab00);
    }

    // Player caught?
    if (manhattan(guardState.x, guardState.y, player.x, player.y) <= 1 &&
        Math.abs(guardState.px - player.px) < TILE * 0.8) {
        player.dead = true; gameOver = true; gameOverTimer = 0;
        statusText.text = '❌ Caught! Resetting...';
        window.parent.postMessage({ type: 'status', text: `Caught by the guard (${selectedAlgo})! Try a different route.` }, '*');
        return;
    }

    // Reached exit?
    if (player.x === EXIT.x && player.y === EXIT.y) {
        player.won = true; gameOver = true; gameOverTimer = 0;
        statusText.text = '✅ Escaped! Resetting...';
        window.parent.postMessage({ type: 'status', text: `Escaped! Guard was using ${selectedAlgo}.` }, '*');
        return;
    }

    // Status
    if (guardState.state !== 'sleeping' && !gameOver) {
        const stateLabels = { patrol: 'Patrolling', alert: '⚠ Searching!', chase: '🔴 CHASING!' };
        statusText.text = `Guard: ${stateLabels[guardState.state] || ''} [${selectedAlgo}]  |  WASD to move`;
        window.parent.postMessage({ type: 'status', text:
            `Guard [${selectedAlgo}]: ${guardState.state}  |  Use WASD to sneak to the exit` }, '*');
    }
});

window.parent.postMessage({ type: 'status', text: 'Use WASD to move. Reach EXIT. Guard wakes in 3s...' }, '*');
{{< /pixidemo >}}

## What the Algorithm Switch Actually Changes

Try each algorithm and feel the difference:

**BFS** — The guard explores tiles like water spreading outward. It always finds the shortest route but doesn't "look" toward you. On a large map with the guard across the building, it'll scan a lot of irrelevant tiles before picking up your trail. Predictable but methodical.

**Dijkstra's** — Nearly identical to BFS on a uniform-cost map (all tiles cost 1). The distinction shows up in the next chapter when you add terrain costs. On this map the guard behaves almost the same as BFS — a good baseline.

**Greedy Best-First** — The guard feels almost psychic in open corridors, lunging straight toward you. But watch what happens when a wall forces a detour — it can get stuck briefly, circling back before finding the way around. Great tension: fast but imperfect.

**A\*** — The most dangerous guard. Finds you efficiently even through the maze, and re-routes instantly when you break line of sight. This is what shipping games use for good reason.

## Wiring Pathfinding into a Game Loop

The key architectural decisions in the demo above:

### 1. Don't Pathfind Every Frame

Pathfinding is expensive. The guard in this demo only replans every 30 frames (half a second). For a player moving at normal speed, this feels completely responsive — they don't notice the lag.

```javascript
guard.replanTimer++;
if (guard.replanTimer >= REPLAN_INTERVAL) {
    guard.replanTimer = 0;
    guard.path = findPath(algo, guard.x, guard.y, target.x, target.y);
    guard.pathStep = 0;
}
```

For more complex games, stagger replans across multiple units so they don't all recalculate on the same frame.

### 2. Smooth Movement Along a Tile Path

Pathfinding returns tile coordinates. Moving the sprite smoothly between them is a separate concern — lerping the pixel position toward the target tile:

```javascript
// Each frame: nudge position toward the next waypoint
const speed = 0.1;
guard.px += (nextTile.x * TILE_SIZE - guard.px) * speed;
guard.py += (nextTile.y * TILE_SIZE - guard.py) * speed;

// When close enough, snap and advance to next waypoint
if (Math.abs(guard.px - nextTile.x * TILE_SIZE) < 1) {
    guard.x = nextTile.x;
    guard.pathStep++;
}
```

The lerp factor (0.1 above) controls how "snappy" movement feels. Lower values feel sluggish; higher feel robotic. Tune it per character type.

### 3. The Guard State Machine

Three states drive the guard's behaviour:

```javascript
// patrol: following waypoints around the map
// alert:  moving to last known player position
// chase:  actively tracking and replanning toward player

function updateGuardState(guard, player, canSee) {
    if (canSee) {
        guard.lastKnown = { x: player.x, y: player.y };
        if (guard.state !== 'chase') {
            guard.state = 'chase';
            guard.replanTimer = REPLAN_INTERVAL; // replan immediately
        }
    } else if (guard.state === 'chase') {
        // Lost sight: investigate last known position
        guard.state = 'alert';
        guard.path = findPath(algo, guard.x, guard.y,
            guard.lastKnown.x, guard.lastKnown.y);
    } else if (guard.state === 'alert' && guard.reachedDestination) {
        // Searched last known position, back to patrol
        guard.state = 'patrol';
    }
}
```

State machines are the backbone of game AI. Even complex behaviours break down into a small number of states with clear transitions between them.

### 4. Line-of-Sight Detection

The guard shouldn't know where you are unless it can see you. DDA raycasting checks whether a clear line exists between two tiles:

```javascript
function hasLineOfSight(ax, ay, bx, by, map) {
    const dx = bx - ax, dy = by - ay;
    const steps = Math.max(Math.abs(dx), Math.abs(dy)) * 2;
    if (steps === 0) return true;

    let cx = ax + 0.5, cy = ay + 0.5;
    const stepX = dx / steps, stepY = dy / steps;

    for (let i = 0; i < steps; i++) {
        const tx = Math.floor(cx), ty = Math.floor(cy);
        if ((tx !== bx || ty !== by) && map[ty][tx] === WALL) return false;
        cx += stepX; cy += stepY;
    }
    return true;
}
```

Combine this with a maximum sight radius (Manhattan distance check first, cheapest possible early exit) and you have a believable field of view.

## Extending the System

Some directions to take this further on your own:

**Multiple guards** — Each guard runs the same pathfinding code independently. The interesting design problem is making them feel like they *coordinate* even when they don't: staggered patrol waypoints naturally create overlapping coverage.

**Alert propagation** — When one guard spots the player, other guards in range transition to alert state immediately. One function call with a radius check.

**Noise mechanics** — Give certain tiles a noise rating (creaky floor, ventilation grate). Instead of binary line-of-sight, the guard can "hear" tiles above a threshold even without visual contact.

**Pathfinding weights for risk** — Guards will avoid certain tiles too. A guard under heavy suppression in a combat game might treat "exposed" tiles as high-cost, seeking cover just as your player does.

{{< icon name="arrow-right" >}} **Next up:** [Going Further](/tutorial/a-thinking-world/going-further/) — Flow fields, Jump Point Search, and where pathfinding research is headed.
