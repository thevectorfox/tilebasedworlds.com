+++
title = "A Living World"
date = 2026-03-09T08:00:00+11:00
weight = 13
draft = false
slug = "bringing-it-together"
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/world-one/going-further/"
prev = "/tutorial/world-one/stupid-enemy/"
+++

Every piece from this series in one place. A tile world with movement, collision, a patrolling enemy, a key to find, a pushable block, and a locked door to earn your way through.

{{< pixidemo title="A Living World" >}}
const app = new PIXI.Application();
await app.init({ width: 300, height: 240, backgroundColor: 0x1a1a2e });
document.body.appendChild(app.canvas);

const TILE_SIZE = 30;

const maps = {
    1: [
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,1,0,0,0,0,0,0,1],
        [1,0,0,0,3,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,4],
        [1,1,1,1,1,1,1,1,1,1]
    ],
    2: [
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [5,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1]
    ]
};

// 4 = locked door, 5 = door back
const doors = {
    4: { toRoom: 2, tileX: 1, tileY: 3, locked: true },
    5: { toRoom: 1, tileX: 8, tileY: 6, locked: false }
};

const KEY_POS = { tileX: 7, tileY: 1, room: 1 };
const game = { currentRoom: 1, hasKey: false };
let keyCollected = false;
let playerAlive = true;

const hero = { tileX: 1, tileY: 6 };
const heroSprite = new PIXI.Graphics().rect(-9, -9, 18, 18).fill(0xff4444);

const enemy = { x: 100, y: 130, width: 10, height: 10, moveX: 1.5, moveY: 0 };
const enemySprite = new PIXI.Graphics().rect(0, 0, 10, 10).fill(0x8A2BE2);

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
    const map = maps[game.currentRoom];

    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
            const t = map[row][col];
            if (t === 0) continue;
            let color;
            if (t === 1) color = 0x4a3728;
            else if (t === 3) color = 0xe07820;
            else if (t === 4) color = game.hasKey ? 0x44bb44 : 0xcc4422;
            else if (t === 5) color = 0x44bb44;
            const tile = new PIXI.Graphics().rect(0, 0, TILE_SIZE, TILE_SIZE).fill(color);
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            app.stage.addChild(tile);
        }
    }

    if (game.currentRoom === KEY_POS.room && !keyCollected) {
        const keySprite = new PIXI.Graphics().circle(0, 0, 6).fill(0xFFD700);
        keySprite.x = KEY_POS.tileX * TILE_SIZE + TILE_SIZE / 2;
        keySprite.y = KEY_POS.tileY * TILE_SIZE + TILE_SIZE / 2;
        app.stage.addChild(keySprite);
    }

    if (game.currentRoom === 1) {
        enemySprite.x = enemy.x;
        enemySprite.y = enemy.y;
        app.stage.addChild(enemySprite);
    }

    heroSprite.x = hero.tileX * TILE_SIZE + TILE_SIZE / 2;
    heroSprite.y = hero.tileY * TILE_SIZE + TILE_SIZE / 2;
    app.stage.addChild(heroSprite);

    if (game.currentRoom === 2) statusText.text = 'You made it!';
    else if (game.hasKey) statusText.text = 'Key: ✓  Find the door!';
    else statusText.text = 'Find the key!';
    app.stage.addChild(statusText);
}

function moveHero(dx, dy) {
    if (!playerAlive) return;
    const map = maps[game.currentRoom];
    const nx = hero.tileX + dx;
    const ny = hero.tileY + dy;
    if (nx < 0 || ny < 0 || ny >= map.length || nx >= map[0].length) return;
    const t = map[ny][nx];

    if (doors[t]) {
        if (doors[t].locked && !game.hasKey) return;
        game.currentRoom = doors[t].toRoom;
        hero.tileX = doors[t].tileX;
        hero.tileY = doors[t].tileY;
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

function updateEnemy() {
    if (game.currentRoom !== 1 || !playerAlive) return;

    const nx = enemy.x + enemy.moveX;
    const ny = enemy.y + enemy.moveY;

    if (isSolidForEnemy(nx, ny) || isSolidForEnemy(nx + enemy.width, ny) ||
        isSolidForEnemy(nx, ny + enemy.height) || isSolidForEnemy(nx + enemy.width, ny + enemy.height)) {
        enemy.moveX = -enemy.moveX;
        enemy.moveY = -enemy.moveY;
    } else {
        enemy.x = nx;
        enemy.y = ny;
        enemySprite.x = enemy.x;
        enemySprite.y = enemy.y;
    }

    const hx = hero.tileX * TILE_SIZE + TILE_SIZE / 2;
    const hy = hero.tileY * TILE_SIZE + TILE_SIZE / 2;
    const ex = enemy.x + 5, ey = enemy.y + 5;
    if (Math.sqrt((ex - hx) * (ex - hx) + (ey - hy) * (ey - hy)) < 18) playerDie();
}

function playerDie() {
    playerAlive = false;
    heroSprite.tint = 0x666666;
    setTimeout(() => {
        playerAlive = true;
        heroSprite.tint = 0xFFFFFF;
        hero.tileX = 1; hero.tileY = 6;
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
app.ticker.add(() => updateEnemy());
{{< /pixidemo >}}

Everything from the series is here:

- **Gold circle** (top-right) — the key to collect
- **Orange block** (middle) — push it out of your way
- **Purple enemy** (middle row) — avoid it or wait for it to pass; touch it and you respawn
- **Red door** (right edge) — locked until you have the key, then turns green
- **Green door** (left edge, room 2) — takes you back

The mechanics you built across this series don't just stack — they interact. The enemy patrols the row between you and the key, so collecting it requires timing. The pushable block can be used to cut off the enemy's patrol path if you position it right. The locked door means you can't skip straight to the exit.

That's the point of tile-based design: simple rules combining into something that feels like a game.

---

*This series covered the essentials. For side-scrolling mechanics — jumping, gravity, moving platforms, slopes — continue with [The Keep](/tutorial/the-keep/).*
