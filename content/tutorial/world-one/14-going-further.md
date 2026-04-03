+++
title = "Going further"
date = 2026-03-09T08:00:00+11:00
weight = 13
draft = false
slug = "going-further"
tags = ["intermediate", "gameplay", "tutorial"]
next = ""
prev = "/tutorial/world-one/bringing-it-together/"
+++

Four rooms. One key. Everything from this series working together as a designed sequence.

{{< pixidemo title="A Living World" >}}
const app = new PIXI.Application();
await app.init({ width: 300, height: 240, backgroundColor: 0x1a1a2e });
document.body.appendChild(app.canvas);

const TILE_SIZE = 30;

// Tile IDs: 0=floor, 1=wall, 3=pushable block
// Doors: 4=locked goal(r2→win), 5=r2→r1, 6=r1→r2, 7=r2→r3,
//        8=r3→r2, 9=r3→r4(puzzle-locked), 10=r4→r3
const baseMaps = {
    1: [
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,6],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1]
    ],
    2: [
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,0,1,1,0,1],
        [5,0,0,0,0,0,0,0,0,7],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,0,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,4],
        [1,1,1,1,1,1,1,1,1,1]
    ],
    3: [
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,3,0,0,0,1,1],
        [1,0,0,0,0,0,0,0,0,1],
        [8,0,0,0,0,0,0,0,0,9],
        [1,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1]
    ],
    4: [
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,0,1,0,1],
        [10,0,0,0,0,1,0,0,0,1],
        [1,1,1,0,1,0,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,1,0,0,1],
        [1,1,1,1,1,1,1,1,1,1]
    ]
};

function cloneMaps() {
    const m = {};
    for (const k in baseMaps) m[k] = baseMaps[k].map(r => [...r]);
    return m;
}
let maps = cloneMaps();

const doors = {
    4:  { toRoom: 'win', locked: true },
    5:  { toRoom: 1, tileX: 8, tileY: 3, locked: false },
    6:  { toRoom: 2, tileX: 1, tileY: 3, locked: false },
    7:  { toRoom: 3, tileX: 1, tileY: 5, locked: false },
    8:  { toRoom: 2, tileX: 8, tileY: 3, locked: false },
    9:  { toRoom: 4, tileX: 1, tileY: 3, locked: 'puzzle' },
    10: { toRoom: 3, tileX: 8, tileY: 5, locked: false }
};

// Puzzle: push block in room3 row3 from col4 to col7 (wall at col8 stops it)
const PUZZLE_TARGET = { room: 3, tileX: 7, tileY: 3 };
const KEY_POS = { tileX: 8, tileY: 1, room: 4 };
const ROOM_SPAWN = { 1:{x:1,y:3}, 2:{x:1,y:3}, 3:{x:1,y:5}, 4:{x:1,y:3} };

const game = { currentRoom: 1, hasKey: false };
let puzzleSolved = false;
let keyCollected = false;
let playerAlive = true;
let gameWon = false;

const hero = { tileX: 1, tileY: 3 };
const heroSprite = new PIXI.Graphics().rect(-9, -9, 18, 18).fill(0xff4444);

// Two enemies patrol room 4: one guards row 5, one guards row 1 near the key
const enemies = [
    { room: 4, x: 30,  y: 150, width: 10, height: 10, moveX: 1.5,  moveY: 0 },
    { room: 4, x: 240, y: 30,  width: 10, height: 10, moveX: -1.5, moveY: 0 }
];
const enemySprites = enemies.map(() => new PIXI.Graphics().rect(0, 0, 10, 10).fill(0x8A2BE2));

const statusStyle = new PIXI.TextStyle({ fill: 0xFFFFFF, fontSize: 11, fontFamily: 'monospace' });
const statusText = new PIXI.Text({ text: '', style: statusStyle });
statusText.x = 8; statusText.y = 8;

function isSolidForEnemy(x, y) {
    const map = maps[game.currentRoom];
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) return true;
    return map[row][col] !== 0;
}

function buildScene() {
    app.stage.removeChildren();

    if (gameWon) {
        const ws = new PIXI.TextStyle({ fill: 0xFFD700, fontSize: 22, fontFamily: 'monospace', fontWeight: 'bold' });
        const wt = new PIXI.Text({ text: 'YOU WIN!', style: ws });
        wt.x = 80; wt.y = 95;
        app.stage.addChild(wt);
        const ss = new PIXI.TextStyle({ fill: 0xCCCCCC, fontSize: 10, fontFamily: 'monospace' });
        const st = new PIXI.Text({ text: 'All four rooms cleared.', style: ss });
        st.x = 72; st.y = 128;
        app.stage.addChild(st);
        return;
    }

    const map = maps[game.currentRoom];

    // Puzzle target marker — drawn first so block tile covers it when in place
    if (game.currentRoom === PUZZLE_TARGET.room && !puzzleSolved) {
        const marker = new PIXI.Graphics().rect(4, 4, 22, 22).fill(0x4466ff);
        marker.x = PUZZLE_TARGET.tileX * TILE_SIZE;
        marker.y = PUZZLE_TARGET.tileY * TILE_SIZE;
        app.stage.addChild(marker);
    }

    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
            const t = map[row][col];
            if (t === 0) continue;
            let color;
            if      (t === 1)  color = 0x4a3728;
            else if (t === 3)  color = 0xe07820;
            else if (t === 4)  color = game.hasKey ? 0x44bb44 : 0xcc4422;
            else if (t === 9)  color = puzzleSolved  ? 0x44bb44 : 0x886622;
            else               color = 0x44bb44; // doors 5,6,7,8,10
            const tile = new PIXI.Graphics().rect(0, 0, TILE_SIZE, TILE_SIZE).fill(color);
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            app.stage.addChild(tile);
        }
    }

    if (game.currentRoom === KEY_POS.room && !keyCollected) {
        const kSprite = new PIXI.Graphics().circle(0, 0, 6).fill(0xFFD700);
        kSprite.x = KEY_POS.tileX * TILE_SIZE + TILE_SIZE / 2;
        kSprite.y = KEY_POS.tileY * TILE_SIZE + TILE_SIZE / 2;
        app.stage.addChild(kSprite);
    }

    enemies.forEach((e, i) => {
        if (e.room !== game.currentRoom) return;
        enemySprites[i].x = e.x;
        enemySprites[i].y = e.y;
        app.stage.addChild(enemySprites[i]);
    });

    heroSprite.x = hero.tileX * TILE_SIZE + TILE_SIZE / 2;
    heroSprite.y = hero.tileY * TILE_SIZE + TILE_SIZE / 2;
    app.stage.addChild(heroSprite);

    const r = game.currentRoom;
    if      (r === 1) statusText.text = 'Find a way forward →';
    else if (r === 2) statusText.text = game.hasKey ? 'Key ✓  Use the locked door!' : (puzzleSolved ? 'Puzzle done. Get the key!' : 'Three doors. Which do you try?');
    else if (r === 3) statusText.text = puzzleSolved ? 'Block placed! Head right →' : 'Push the block to the blue square';
    else if (r === 4) statusText.text = keyCollected ? 'Key ✓  Head back to the hub!' : 'Dodge the enemies. Find the key!';
    app.stage.addChild(statusText);
}

function moveHero(dx, dy) {
    if (!playerAlive || gameWon) return;
    const map = maps[game.currentRoom];
    const nx = hero.tileX + dx;
    const ny = hero.tileY + dy;
    if (nx < 0 || ny < 0 || ny >= map.length || nx >= map[0].length) return;
    const t = map[ny][nx];

    if (doors[t]) {
        const d = doors[t];
        if (d.locked === true && !game.hasKey) return;
        if (d.locked === 'puzzle' && !puzzleSolved) return;
        if (d.toRoom === 'win') { gameWon = true; buildScene(); return; }
        game.currentRoom = d.toRoom;
        hero.tileX = d.tileX;
        hero.tileY = d.tileY;
        buildScene();
        return;
    }

    if (t === 3) {
        const bx = nx + dx, by = ny + dy;
        if (bx >= 0 && by >= 0 && by < map.length && bx < map[0].length && map[by][bx] === 0) {
            map[ny][nx] = 0;
            map[by][bx] = 3;
            hero.tileX = nx;
            hero.tileY = ny;
            if (game.currentRoom === PUZZLE_TARGET.room &&
                map[PUZZLE_TARGET.tileY][PUZZLE_TARGET.tileX] === 3) {
                puzzleSolved = true;
            }
            buildScene();
        }
        return;
    }

    if (t === 0) {
        hero.tileX = nx;
        hero.tileY = ny;
        heroSprite.x = hero.tileX * TILE_SIZE + TILE_SIZE / 2;
        heroSprite.y = hero.tileY * TILE_SIZE + TILE_SIZE / 2;
        if (!keyCollected && game.currentRoom === KEY_POS.room &&
            hero.tileX === KEY_POS.tileX && hero.tileY === KEY_POS.tileY) {
            keyCollected = true;
            game.hasKey = true;
            buildScene();
        }
    }
}

function updateEnemies() {
    if (gameWon || !playerAlive) return;
    enemies.forEach((e, i) => {
        if (e.room !== game.currentRoom) return;
        const nx = e.x + e.moveX;
        const ny = e.y + e.moveY;
        if (isSolidForEnemy(nx, ny) || isSolidForEnemy(nx + e.width, ny) ||
            isSolidForEnemy(nx, ny + e.height) || isSolidForEnemy(nx + e.width, ny + e.height)) {
            e.moveX = -e.moveX;
            e.moveY = -e.moveY;
        } else {
            e.x = nx; e.y = ny;
            enemySprites[i].x = e.x;
            enemySprites[i].y = e.y;
        }
        const hx = hero.tileX * TILE_SIZE + TILE_SIZE / 2;
        const hy = hero.tileY * TILE_SIZE + TILE_SIZE / 2;
        const ex = e.x + 5, ey = e.y + 5;
        if (Math.sqrt((ex-hx)*(ex-hx) + (ey-hy)*(ey-hy)) < 18) playerDie();
    });
}

function playerDie() {
    if (!playerAlive) return;
    playerAlive = false;
    heroSprite.tint = 0x666666;
    const s = ROOM_SPAWN[game.currentRoom];
    setTimeout(() => {
        playerAlive = true;
        heroSprite.tint = 0xFFFFFF;
        hero.tileX = s.x; hero.tileY = s.y;
        heroSprite.x = hero.tileX * TILE_SIZE + TILE_SIZE / 2;
        heroSprite.y = hero.tileY * TILE_SIZE + TILE_SIZE / 2;
    }, 1500);
}

window.addEventListener('keydown', e => {
    if (e.repeat) return;
    if (e.code === 'ArrowLeft')  { moveHero(-1, 0); e.preventDefault(); }
    if (e.code === 'ArrowRight') { moveHero(1, 0);  e.preventDefault(); }
    if (e.code === 'ArrowUp')    { moveHero(0, -1); e.preventDefault(); }
    if (e.code === 'ArrowDown')  { moveHero(0, 1);  e.preventDefault(); }
});

buildScene();
app.ticker.add(() => updateEnemies());
{{< /pixidemo >}}

Four rooms, each asking something different of you:

- **Room 1** — empty. Just a door to find.
- **Room 2** — a hub with three doors. One takes you back, one is open, one is locked. The locked one is the goal.
- **Room 3** — a push-block puzzle. Get the **orange block** onto the **blue square** to unlock the right-hand door. The block can only move along its row and a wall stops it from overshooting.
- **Room 4** — a maze with two **purple enemies** patrolling different corridors. Navigate to the **gold key** at the far end, then backtrack to the hub and use the locked door.

The sequence is designed, not just assembled. Room 2 shows you all three doors up front, so you understand the structure before you've solved anything. Room 3 teaches the puzzle mechanic in a constrained space where you can't get permanently stuck. Room 4 puts the key behind both a maze and enemy timing — you need to read the patrol pattern before committing.

That's the point of tile-based design: the same small set of rules, arranged deliberately, produces something that feels authored.

---

*This series covered the essentials. For side-scrolling mechanics — jumping, gravity, moving platforms, slopes — continue with [The Keep](/tutorial/the-keep/).*
