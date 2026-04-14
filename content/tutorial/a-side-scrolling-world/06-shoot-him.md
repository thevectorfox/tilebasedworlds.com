+++
title = "Shoot Him"
date = 2026-03-09T10:00:00+11:00
weight = 6
draft = false
slug = "shoot-him"
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/a-side-scrolling-world/depth/"
prev = "/tutorial/a-side-scrolling-world/enemy-on-platform/"
+++

Projectiles are a common interaction mechanic — the player fires in the direction they last moved, and bullets that reach an enemy remove it from the level. This tutorial adds a bullet system to the side-scrolling platformer from previous tutorials.

{{< pixidemo title="Platform Shooting" >}}
const app = new PIXI.Application();

await app.init({
    width: 300,
    height: 240,
    backgroundColor: 0x87CEEB
});

document.body.appendChild(app.canvas);

const TILE_SIZE = 30;
const GRAVITY = 0.8;

const map = [
    [1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,0,0,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [1,1,0,0,1,1,0,0,1,1],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1,1]
];

for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
        if (map[row][col] === 1) {
            const tile = new PIXI.Graphics()
                .rect(0, 0, TILE_SIZE, TILE_SIZE)
                .fill(0x8B4513);
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            app.stage.addChild(tile);
        }
    }
}

const heroSprite = new PIXI.Graphics().rect(0, 0, 12, 12).fill(0xff4444);
heroSprite.x = 60;
heroSprite.y = 180;
app.stage.addChild(heroSprite);

const player = {
    sprite: heroSprite,
    x: 60, y: 180, width: 12, height: 12,
    velocityX: 0, velocityY: 0,
    speed: 2, jumpPower: -12,
    onGround: false,
    lastDirection: {x: 1, y: 0},  // direction of last horizontal move
    lastShot: 0,
    shootCooldown: 400             // ms between shots
};

const bullets = [];
const enemies = [];

// Spawn enemies
for (let i = 0; i < 3; i++) {
    const enemySprite = new PIXI.Graphics().rect(0, 0, 10, 10).fill(0x8A2BE2);
    const ex = 150 + i * 60;
    const ey = 60 + i * 40;
    enemySprite.x = ex;
    enemySprite.y = ey;
    app.stage.addChild(enemySprite);
    enemies.push({ sprite: enemySprite, x: ex, y: ey, width: 10, height: 10, active: true });
}

const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
        e.preventDefault();
    }
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

function isSolid(x, y) {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) return true;
    return map[row][col] === 1;
}

function gameLoop() {
    // --- Player input ---
    if (keys['ArrowLeft']) {
        player.velocityX = -player.speed;
        player.lastDirection = {x: -1, y: 0};
    } else if (keys['ArrowRight']) {
        player.velocityX = player.speed;
        player.lastDirection = {x: 1, y: 0};
    } else {
        player.velocityX = 0;
    }

    if (keys['Space'] && player.onGround) {
        player.velocityY = player.jumpPower;
        player.onGround = false;
    }

    if ((keys['ShiftLeft'] || keys['ShiftRight']) &&
        Date.now() - player.lastShot > player.shootCooldown) {
        // Spawn bullet at player centre, offset in fire direction
        const bx = player.x + player.width / 2 + player.lastDirection.x * 8;
        const by = player.y + player.height / 2;
        const bulletSprite = new PIXI.Graphics().rect(0, 0, 4, 4).fill(0xFFFF00);
        bulletSprite.x = bx;
        bulletSprite.y = by;
        app.stage.addChild(bulletSprite);
        bullets.push({ sprite: bulletSprite, x: bx, y: by,
                       vx: player.lastDirection.x * 5, vy: 0,
                       width: 4, height: 4 });
        player.lastShot = Date.now();
    }

    // --- Player physics ---
    player.velocityY += GRAVITY;

    const newX = player.x + player.velocityX;
    if (!isSolid(newX, player.y + 2) && !isSolid(newX, player.y + player.height - 2) &&
        !isSolid(newX + player.width, player.y + 2) && !isSolid(newX + player.width, player.y + player.height - 2)) {
        player.x = newX;
    }

    if (player.velocityY > 0) {
        const newBottom = player.y + player.height + player.velocityY;
        if (isSolid(player.x + 2, newBottom) || isSolid(player.x + player.width - 2, newBottom)) {
            player.y = Math.floor(newBottom / TILE_SIZE) * TILE_SIZE - player.height;
            player.velocityY = 0;
            player.onGround = true;
        } else {
            player.y += player.velocityY;
            player.onGround = false;
        }
    } else if (player.velocityY < 0) {
        const newTop = player.y + player.velocityY;
        if (isSolid(player.x + 2, newTop) || isSolid(player.x + player.width - 2, newTop)) {
            player.y = Math.ceil(newTop / TILE_SIZE) * TILE_SIZE;
            player.velocityY = 0;
        } else {
            player.y += player.velocityY;
        }
    }

    player.x = Math.max(0, Math.min(player.x, 300 - player.width));
    player.sprite.x = player.x;
    player.sprite.y = player.y;

    // --- Bullets ---
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        b.sprite.x = b.x;
        b.sprite.y = b.y;

        // Remove on wall hit or out of bounds
        if (isSolid(b.x, b.y) || isSolid(b.x + b.width, b.y + b.height) ||
            b.x < 0 || b.x > 300 || b.y < 0 || b.y > 240) {
            app.stage.removeChild(b.sprite);
            bullets.splice(i, 1);
            continue;
        }

        // AABB check against each enemy
        for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            if (!e.active) continue;
            if (b.x < e.x + e.width && b.x + b.width > e.x &&
                b.y < e.y + e.height && b.y + b.height > e.y) {
                app.stage.removeChild(e.sprite);
                e.active = false;
                enemies.splice(j, 1);
                app.stage.removeChild(b.sprite);
                bullets.splice(i, 1);
                break;
            }
        }
    }
}

app.ticker.add(gameLoop);
{{< /pixidemo >}}

## Bullet Data Structure

A bullet is a plain object with a position, a velocity, a size, and a sprite. The size matters because collision is AABB (axis-aligned bounding box), not circular distance — two rectangles overlap when neither axis is separated:

```javascript
// A bullet object
const bullet = {
    sprite: new PIXI.Graphics().rect(0, 0, 4, 4).fill(0xFFFF00),
    x: startX,
    y: startY,
    vx: direction.x * BULLET_SPEED,
    vy: direction.y * BULLET_SPEED,
    width: 4,
    height: 4
};
app.stage.addChild(bullet.sprite);
bullets.push(bullet);
```

## Object Pooling {{< icon name="arrows-clockwise" >}}

Creating and destroying sprites every shot causes garbage collection pauses. Object pooling keeps a fixed set of bullet objects and recycles them:

```javascript
const bulletPool = [];

function getBullet() {
    // Reuse a pooled bullet, or create a new one
    const bullet = bulletPool.length > 0 ? bulletPool.pop() : {
        sprite: new PIXI.Graphics().rect(0, 0, 4, 4).fill(0xFFFF00),
        width: 4, height: 4
    };
    bullet.sprite.visible = true;
    app.stage.addChild(bullet.sprite);
    return bullet;
}

function returnBullet(bullet) {
    bullet.sprite.visible = false;
    bulletPool.push(bullet);
}
```

## Shoot Cooldown

A `lastShot` timestamp enforces minimum time between shots. Check `Date.now() - player.lastShot > player.shootCooldown` before creating a bullet, then update `player.lastShot = Date.now()` when firing.

## Bullet–Enemy AABB Collision

The demo uses rectangle overlap rather than circular distance, which is more accurate for rectangular sprites:

```javascript
// Returns true when rect A overlaps rect B
function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx &&
           ay < by + bh && ay + ah > by;
}
```

Iterate bullets and enemies in reverse order (`length - 1` to `0`) when splicing, so earlier indices stay valid after each removal.

## Particle Effects

Spawn short-lived graphics objects on enemy death and animate them through the PIXI ticker — not `requestAnimationFrame`, which runs outside PixiJS's render loop:

```javascript
function spawnParticles(cx, cy) {
    for (let i = 0; i < 6; i++) {
        const p = new PIXI.Graphics().rect(0, 0, 3, 3).fill(0xFF6600);
        p.x = cx; p.y = cy;
        const angle = (i / 6) * Math.PI * 2;
        const speed = 2 + Math.random() * 2;
        const pvx = Math.cos(angle) * speed;
        const pvy = Math.sin(angle) * speed;
        app.stage.addChild(p);

        // Animate via ticker, remove when faded
        const tick = () => {
            p.x += pvx; p.y += pvy; p.alpha -= 0.06;
            if (p.alpha <= 0) { app.stage.removeChild(p); app.ticker.remove(tick); }
        };
        app.ticker.add(tick);
    }
}
```

Next: [Depth](/tutorial/a-side-scrolling-world/depth/)