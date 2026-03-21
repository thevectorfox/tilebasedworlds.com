+++
title = "Pushing Tiles"
date = 2026-03-20T00:00:00+11:00
weight = 10
draft = false
slug = "pushing-tiles"
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/world-one/scrolling/"
prev = "/tutorial/world-one/getting-items/"
+++

{{< pixidemo title="Pushing Tiles" >}}
const app = new PIXI.Application();
await app.init({
    width: 300,
    height: 300,
    backgroundColor: 0x1a1a2e,
    antialias: true
});

document.body.appendChild(app.canvas);

const TILE_SIZE = 30;

// 0 = floor, 1 = wall, 3 = pushable block
const gameMap = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 3, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 3, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 3, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const tileLayer = new PIXI.Container();
app.stage.addChild(tileLayer);

function drawTile(type, col, row) {
    const g = new PIXI.Graphics();
    g.x = col * TILE_SIZE;
    g.y = row * TILE_SIZE;

    if (type === 1) {
        g.beginFill(0x00ff41);
        g.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
        g.endFill();
    } else if (type === 3) {
        g.beginFill(0x0a1a0a);
        g.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
        g.endFill();
        g.beginFill(0xe07820);
        g.drawRect(4, 4, TILE_SIZE - 8, TILE_SIZE - 8);
        g.endFill();
        g.lineStyle(1, 0xf0a040);
        g.drawRect(4, 4, TILE_SIZE - 8, TILE_SIZE - 8);
    } else {
        g.beginFill(0x0a1a0a);
        g.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
        g.lineStyle(1, 0x1a3a1a);
        g.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
        g.endFill();
    }

    return g;
}

function renderMap() {
    tileLayer.removeChildren();
    for (let row = 0; row < gameMap.length; row++) {
        for (let col = 0; col < gameMap[row].length; col++) {
            tileLayer.addChild(drawTile(gameMap[row][col], col, row));
        }
    }
}

renderMap();

// Hero
const heroSprite = new PIXI.Graphics();
heroSprite.beginFill(0xff4444);
heroSprite.drawRect(-7, -7, 14, 14);
heroSprite.endFill();
heroSprite.lineStyle(2, 0xffffff);
heroSprite.drawRect(-7, -7, 14, 14);
app.stage.addChild(heroSprite);

const hero = { tileX: 5, tileY: 7 };

function updateHeroSprite() {
    heroSprite.x = hero.tileX * TILE_SIZE + TILE_SIZE / 2;
    heroSprite.y = hero.tileY * TILE_SIZE + TILE_SIZE / 2;
}
updateHeroSprite();

function moveHero(dx, dy) {
    const nx = hero.tileX + dx;
    const ny = hero.tileY + dy;

    if (nx < 0 || ny < 0 || ny >= gameMap.length || nx >= gameMap[0].length) return;

    const tile = gameMap[ny][nx];

    if (tile === 0) {
        hero.tileX = nx;
        hero.tileY = ny;
        updateHeroSprite();
    } else if (tile === 3) {
        const bx = nx + dx;
        const by = ny + dy;
        const inBounds = bx >= 0 && by >= 0 && by < gameMap.length && bx < gameMap[0].length;
        if (inBounds && gameMap[by][bx] === 0) {
            gameMap[ny][nx] = 0;
            gameMap[by][bx] = 3;
            hero.tileX = nx;
            hero.tileY = ny;
            renderMap();
            updateHeroSprite();
        }
    }
}

window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    switch (e.code) {
        case 'ArrowUp':    moveHero(0, -1);  e.preventDefault(); break;
        case 'ArrowDown':  moveHero(0, 1);   e.preventDefault(); break;
        case 'ArrowLeft':  moveHero(-1, 0);  e.preventDefault(); break;
        case 'ArrowRight': moveHero(1, 0);   e.preventDefault(); break;
    }
});
{{< /pixidemo >}}
