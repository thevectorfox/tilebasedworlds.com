+++
title = "Going Further"
date = 2026-04-12T00:00:00+11:00
weight = 12
draft = false
slug = "going-further"
tags = ["intermediate", "tutorial"]
prev = "/tutorial/a-side-scrolling-world/bringing-it-together/"
+++

The combined game from the previous tutorial is functional but raw. This page covers the extensions that separate a working prototype from a game that feels good to play. Each section is self-contained — add the ones that fit your design.

---

## Variable Jump Height

Fixed-height jumping feels mechanical. In most platformers, releasing the jump button early cuts the jump short. This gives players fine control over arc height and makes jumping feel responsive rather than automatic.

The technique is to reduce upward velocity when the jump key is released while the player is still rising:

```js
// In your game loop, after gravity is applied:
if (!keys['Space'] && player.velocityY < 0) {
    // Player released jump while rising — apply a multiplier to decelerate faster
    player.velocityY *= 0.75;
}
```

The multiplier (`0.75`) controls how abruptly the arc cuts. A value close to `1.0` produces a very slight difference; `0.5` makes short hops noticeably shorter than full jumps. Try values around `0.7–0.85`.

This works because gravity applies every frame regardless, so the velocity naturally approaches zero. The multiplier just gets it there faster.

---

## Coyote Time

When a player runs off a platform edge, they expect to be able to jump for a brief moment after leaving the ground. Without this, jumps that feel like they should work fail, which reads as unfair input lag.

Coyote time is a short timer that keeps `onGround` valid for a few frames after the player leaves a surface:

```js
const player = {
    // ...existing properties...
    coyoteFrames: 0,     // countdown frames of grace period
};

const COYOTE_LIMIT = 6; // ~100ms at 60fps

function updatePlayer() {
    // Track coyote time: count down when not on ground
    if (player.onGround) {
        player.coyoteFrames = COYOTE_LIMIT;
    } else if (player.coyoteFrames > 0) {
        player.coyoteFrames--;
    }

    // Jump is allowed during coyote window
    const canJump = player.onGround || player.coyoteFrames > 0;
    if (keys['Space'] && canJump && player.velocityY >= 0) {
        player.velocityY  = player.jumpPower;
        player.coyoteFrames = 0; // Consume the grace period immediately
    }

    // ...rest of physics...
}
```

The `player.velocityY >= 0` guard prevents activating a coyote jump while already rising (which would produce a double-jump with no visual cause).

---

## Jump Buffering

The inverse problem: the player presses jump a frame or two before landing. Without buffering, the input is ignored and the player has to press again. With buffering, the jump fires as soon as they touch ground.

```js
const player = {
    // ...existing properties...
    jumpBufferFrames: 0,
};

const JUMP_BUFFER_LIMIT = 8; // ~133ms at 60fps

function updatePlayer() {
    // Record jump intent even before landing
    if (keys['Space']) {
        player.jumpBufferFrames = JUMP_BUFFER_LIMIT;
    } else if (player.jumpBufferFrames > 0) {
        player.jumpBufferFrames--;
    }

    // Execute buffered jump as soon as ground is available
    if (player.jumpBufferFrames > 0 && player.onGround) {
        player.velocityY      = player.jumpPower;
        player.onGround       = false;
        player.jumpBufferFrames = 0;
    }

    // ...rest of physics...
}
```

Coyote time and jump buffering are independent and compose cleanly — add both.

---

## Double Jump

A double jump needs two pieces of state: a flag to track whether the first jump has been consumed, and a guard to prevent the second jump from triggering while grounded.

```js
const player = {
    // ...existing properties...
    jumpsRemaining: 2,
};

// Reset when landing:
if (landedOnGround) {
    player.jumpsRemaining = 2;
}

// In input handling:
if (keys['Space'] && player.jumpsRemaining > 0) {
    if (player.jumpsRemaining === 2 && !player.onGround) {
        // First jump not yet used, but player is airborne (walked off edge)
        // Only use one jump for this case
        player.jumpsRemaining = 1;
    }
    player.velocityY    = player.jumpPower;
    player.onGround     = false;
    player.jumpsRemaining--;
}
```

For a second jump that's weaker than the first, use a different jump power: `player.jumpsRemaining === 1 ? player.jumpPower * 0.75 : player.jumpPower`.

---

## Wall Jump

Wall jumping requires detecting contact with a wall (not just floors and ceilings) and allowing a jump to push the player away from it.

```js
const player = {
    // ...existing properties...
    touchingWall: 0,  // -1 = left wall, 0 = none, 1 = right wall
};

// In horizontal movement, record which wall was touched:
if (!canMoveRight) player.touchingWall =  1;
else if (!canMoveLeft) player.touchingWall = -1;
else player.touchingWall = 0;

// Wall jump:
if (keys['Space'] && !player.onGround && player.touchingWall !== 0) {
    player.velocityY  = player.jumpPower;
    player.velocityX  = -player.touchingWall * player.speed * 3; // kick away from wall
    player.touchingWall = 0;
}
```

The lateral kick (`velocityX`) is what makes wall jumps feel distinct from normal jumps. Without it, the player just rises straight up from the wall. The kick magnitude (`speed * 3`) controls how far the player travels horizontally before they can correct their movement.

---

## Room Transitions

The scrolling camera handles large single maps. For structured level design, you may want discrete rooms that the player transitions between — like entering a door and appearing at the other side.

The pattern: define a `rooms` array where each room has its own map data, a list of player spawn points, and a list of exit triggers.

```js
const rooms = [
    {
        map: [ /* room 0 map array */ ],
        spawns: { left: { x: 1 * TS, y: 6 * TS }, right: { x: 18 * TS, y: 6 * TS } },
        exits: [
            { x: 0,          side: 'left',  leadsTo: { room: 1, entry: 'right' } },
            { x: MAP_W - TS, side: 'right', leadsTo: { room: 1, entry: 'left'  } },
        ]
    },
    {
        map: [ /* room 1 map array */ ],
        spawns: { left: { x: 1 * TS, y: 6 * TS }, right: { x: 18 * TS, y: 6 * TS } },
        exits: [
            { x: 0,          side: 'left',  leadsTo: { room: 0, entry: 'right' } },
        ]
    }
];

function checkRoomTransition() {
    const currentRoom = rooms[game.currentRoom];
    for (const exit of currentRoom.exits) {
        if (player.x <= exit.x || player.x + player.width >= exit.x + TS) continue;
        // Player overlaps the exit tile — transition
        loadRoom(exit.leadsTo.room, exit.leadsTo.entry);
        return;
    }
}

function loadRoom(roomIndex, entryPoint) {
    game.currentRoom = roomIndex;
    const room = rooms[roomIndex];

    // Rebuild map, platforms, enemies from room data
    rebuildWorld(room.map);
    buildPlatforms(roomIndex);
    spawnEnemies(roomIndex);

    // Place player at the correct spawn
    const spawn = room.spawns[entryPoint];
    player.x = spawn.x;
    player.y = spawn.y;
    player.velocityX = 0;
    player.velocityY = 0;
    player.onGround  = false;

    // Reset camera
    camX = Math.max(0, Math.min(player.x + player.width / 2 - SW / 2, MAP_W - SW));
}
```

Call `checkRoomTransition()` at the end of `updatePlayer()`. Add a brief fade transition (alpha tween on a black overlay sprite) to soften the cut between rooms.

---

## Parallax Backgrounds

A parallax background scrolls slower than the world, creating a sense of depth. The mechanic is a division: if the world container moves by `camX` pixels, a background layer at half-speed moves by `camX * 0.5`.

```js
// Create background layers outside the world container (they sit on app.stage directly)
const bgFar  = new PIXI.Graphics().rect(0, 0, 600, 240).fill(0x87CEEB); // sky
const bgMid  = buildMountainSprite();  // a repeating mountain silhouette
app.stage.addChildAt(bgFar, 0);
app.stage.addChildAt(bgMid, 1);
app.stage.addChild(world); // world is on top

// In updateCamera(), after setting world.x:
bgMid.x = -Math.round(camX * 0.4);  // mid layer at 40% scroll speed
// bgFar doesn't scroll at all — it's the sky
```

For tiled backgrounds that need to wrap, modulo the offset by the background tile width:

```js
bgMid.x = -(Math.round(camX * 0.4) % bgMidWidth);
```

Each additional layer closer to the camera (higher parallax factor) adds perceived depth. Two or three layers is usually sufficient.

---

## Particle Effects

The explosion effect in "Shoot Him" used `requestAnimationFrame` directly. In a PixiJS game, it's cleaner to attach particles to the game ticker and clean them up there.

```js
const particles = [];

function createExplosion(worldX, worldY) {
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const speed = 1 + Math.random() * 2;
        const sprite = new PIXI.Graphics().rect(0, 0, 3, 3).fill(0xFF4500);
        sprite.x = worldX;
        sprite.y = worldY;
        world.addChild(sprite);
        particles.push({
            sprite,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
        });
    }
}

// In your game loop:
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.sprite.x += p.vx;
        p.sprite.y += p.vy;
        p.vy       += 0.1;      // gravity on particles
        p.life     -= 0.05;
        p.sprite.alpha = p.life;
        if (p.life <= 0) {
            world.removeChild(p.sprite);
            particles.splice(i, 1);
        }
    }
}
```

This version includes a small downward acceleration (`vy += 0.1`) so particles arc rather than fly in straight lines.

---

## What's in the Other Worlds

The mechanics above are all internal to the game loop. The other tutorial worlds in this series cover systems that complement what you've built here.

**A Smarter World** covers pathfinding — A\*, flow fields, and line-of-sight. With pathfinding, enemies don't just patrol their platform; they navigate toward the player across a connected map.

**A Darker World** covers raycasting and field-of-view. A side-scrolling game with line-of-sight checks can hide enemies in shadow, expose traps only when the player is close, or drive a torch-lit exploration mechanic.

**A Random World** covers procedural generation. The fixed maps in this series can be replaced with generated levels: rooms connected by corridors, noise-based terrain, or handcrafted chunks assembled randomly.

**A Living World** covers animation. The red rectangle used throughout this series is a stand-in. This world covers sprite sheets, frame sequencing, and state-driven animation — connecting a running animation to `velocityX`, a jumping animation to `velocityY < 0`, and so on.

Each of these builds on the same tile map and physics foundation you've been using throughout this series. The architecture doesn't change — just the systems layered on top of it.
