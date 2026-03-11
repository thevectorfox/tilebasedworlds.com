+++
title = "Shoot Him"
date = 2026-03-09T10:00:00+11:00
weight = 14
draft = false
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/15-getting-items/"
prev = "/tutorial/13-enemy-on-platform/"
+++

Time to fight back! 🔫 There's nothing quite like the satisfaction of blasting enemies that have been chasing you around! Whether you're firing arrows like Link, blasting with a mega buster like Mega Man, or launching fireballs like Mario - giving players offensive weapons transforms passive avoidance into active, strategic combat!

<div id="shootingDemo" style="text-align: center; margin: 20px 0;">
    <canvas id="shootingCanvas" width="300" height="240" style="border: 2px solid #333; background: #87CEEB;"></canvas>
    <div style="margin-top: 10px;">
        <strong>Controls:</strong> Arrow Keys to move, Shift to shoot<br>
        <strong>Mission:</strong> Destroy all the enemies! Watch them explode! 💥
    </div>
</div>

<script type="module">
import { Application, Sprite, Container, Graphics, Ticker } from 'https://unpkg.com/pixi.js@8.0.0/dist/pixi.min.mjs';

const canvas = document.getElementById('shootingCanvas');
const app = new Application();

await app.init({
    canvas: canvas,
    width: 300,
    height: 240,
    backgroundColor: 0x87CEEB
});

// Game constants
const TILE_SIZE = 30;

// Create a combat arena
const map = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,0,0,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,1,1,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,0,0,0,1,0,1],
    [1,1,1,1,1,1,1,1,1,1]
];

// Create map display
const mapContainer = new Container();
app.stage.addChild(mapContainer);

for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
        if (map[row][col] === 1) {
            const tile = new Graphics()
                .rect(0, 0, TILE_SIZE, TILE_SIZE)
                .fill(0x8B4513);
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            mapContainer.addChild(tile);
        }
    }
}

// Create hero
const hero = new Graphics()
    .rect(0, 0, 12, 12)
    .fill(0xff4444);
hero.x = 60;
hero.y = 180;
app.stage.addChild(hero);

// Hero object
const player = {
    sprite: hero,
    x: 60,
    y: 180,
    width: 12,
    height: 12,
    speed: 2,
    lastDirection: { x: 0, y: -1 }, // Default shoot up
    lastShot: 0,
    shootCooldown: 300 // 300ms between shots
};

// Bullet system
const bullets = [];
const bulletPool = []; // Reuse bullet objects for performance

function createBullet(x, y, dirX, dirY) {
    let bullet;
    
    // Reuse from pool or create new
    if (bulletPool.length > 0) {
        bullet = bulletPool.pop();
        bullet.active = true;
    } else {
        bullet = {
            sprite: new Graphics().rect(0, 0, 4, 4).fill(0xFFFF00),
            active: true,
            width: 4,
            height: 4
        };
        app.stage.addChild(bullet.sprite);
    }
    
    // Set bullet properties
    bullet.x = x;
    bullet.y = y;
    bullet.velocityX = dirX * 4; // Bullet speed
    bullet.velocityY = dirY * 4;
    bullet.sprite.x = x;
    bullet.sprite.y = y;
    bullet.sprite.visible = true;
    
    bullets.push(bullet);
    return bullet;
}

function destroyBullet(index) {
    const bullet = bullets[index];
    bullet.active = false;
    bullet.sprite.visible = false;
    bulletPool.push(bullet); // Return to pool
    bullets.splice(index, 1);
}

// Enemy system
const enemies = [];

function spawnEnemies() {
    const spawns = [
        { x: 180, y: 60 },
        { x: 240, y: 120 },
        { x: 120, y: 150 },
        { x: 210, y: 180 },
        { x: 90, y: 90 }
    ];
    
    spawns.forEach((spawn, index) => {
        const enemySprite = new Graphics()
            .rect(0, 0, 10, 10)
            .fill(0x8A2BE2)
            .stroke({width: 1, color: 0x000000});
        
        const enemy = {
            sprite: enemySprite,
            x: spawn.x,
            y: spawn.y,
            width: 10,
            height: 10,
            health: 1,
            active: true
        };
        
        enemy.sprite.x = enemy.x;
        enemy.sprite.y = enemy.y;
        app.stage.addChild(enemy.sprite);
        enemies.push(enemy);
    });
}

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

// Collision detection
function isSolid(x, y) {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) {
        return true;
    }
    
    return map[row][col] === 1;
}

function wouldHitWall(x, y, width, height) {
    return isSolid(x, y) || isSolid(x + width, y) ||
           isSolid(x, y + height) || isSolid(x + width, y + height);
}

function distance(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Particle effects for explosions
function createExplosion(x, y) {
    for (let i = 0; i < 6; i++) {
        const particle = new Graphics()
            .rect(0, 0, 3, 3)
            .fill(0xFF4500);
        
        particle.x = x + Math.random() * 10 - 5;
        particle.y = y + Math.random() * 10 - 5;
        app.stage.addChild(particle);
        
        // Animate explosion
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        const animateParticle = () => {
            particle.x += vx;
            particle.y += vy;
            particle.alpha -= 0.05;
            
            if (particle.alpha <= 0) {
                app.stage.removeChild(particle);
            } else {
                requestAnimationFrame(animateParticle);
            }
        };
        
        animateParticle();
    }
}

// Update player
function updatePlayer() {
    let moved = false;
    let newX = player.x;
    let newY = player.y;
    
    // Movement
    if (keys['ArrowLeft']) {
        newX -= player.speed;
        player.lastDirection = { x: -1, y: 0 };
        moved = true;
    }
    if (keys['ArrowRight']) {
        newX += player.speed;
        player.lastDirection = { x: 1, y: 0 };
        moved = true;
    }
    if (keys['ArrowUp']) {
        newY -= player.speed;
        player.lastDirection = { x: 0, y: -1 };
        moved = true;
    }
    if (keys['ArrowDown']) {
        newY += player.speed;
        player.lastDirection = { x: 0, y: 1 };
        moved = true;
    }
    
    // Check wall collisions for movement
    if (!wouldHitWall(newX, player.y, player.width, player.height)) {
        player.x = newX;
    }
    if (!wouldHitWall(player.x, newY, player.width, player.height)) {
        player.y = newY;
    }
    
    // Shooting
    if (keys['ShiftLeft'] || keys['ShiftRight']) {
        const now = Date.now();
        if (now - player.lastShot > player.shootCooldown) {
            shoot();
            player.lastShot = now;
        }
    }
    
    // Keep in bounds
    player.x = Math.max(0, Math.min(player.x, 300 - player.width));
    player.y = Math.max(0, Math.min(player.y, 240 - player.height));
    
    player.sprite.x = player.x;
    player.sprite.y = player.y;
}

function shoot() {
    // Create bullet slightly in front of player
    const offsetX = player.lastDirection.x * (player.width / 2 + 2);
    const offsetY = player.lastDirection.y * (player.height / 2 + 2);
    
    const bulletX = player.x + player.width/2 + offsetX;
    const bulletY = player.y + player.height/2 + offsetY;
    
    createBullet(bulletX, bulletY, player.lastDirection.x, player.lastDirection.y);
    
    // Visual feedback
    player.sprite.tint = 0xFFFFAA;
    setTimeout(() => {
        player.sprite.tint = 0xFFFFFF;
    }, 100);
}

// Update bullets
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        
        // Move bullet
        bullet.x += bullet.velocityX;
        bullet.y += bullet.velocityY;
        bullet.sprite.x = bullet.x;
        bullet.sprite.y = bullet.y;
        
        // Check wall collision
        if (wouldHitWall(bullet.x, bullet.y, bullet.width, bullet.height)) {
            destroyBullet(i);
            continue;
        }
        
        // Check enemy collision
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (!enemy.active) continue;
            
            if (distance(bullet, enemy) < (bullet.width + enemy.width) / 2 + 2) {
                // Hit enemy!
                createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                
                // Destroy enemy
                app.stage.removeChild(enemy.sprite);
                enemy.active = false;
                enemies.splice(j, 1);
                
                // Destroy bullet
                destroyBullet(i);
                
                // Check if all enemies defeated
                if (enemies.length === 0) {
                    setTimeout(() => {
                        spawnEnemies(); // Respawn for continuous play
                    }, 2000);
                }
                
                break;
            }
        }
        
        // Remove bullets that go off screen
        if (bullet.x < -10 || bullet.x > 310 || bullet.y < -10 || bullet.y > 250) {
            destroyBullet(i);
        }
    }
}

// Game loop
function gameLoop() {
    updatePlayer();
    updateBullets();
}

// Initialize
spawnEnemies();
app.ticker.add(gameLoop);
</script>


## Bullet System Architecture: Modern Projectile Design 🚀

**When I say "bullet", I mean any projectile** - arrows, fireballs, energy blasts, magic missiles, or even flying penguins! The core mechanics remain the same.

### Key Design Decisions

**🎯 Bullet Behavior Rules:**
1. **SHIFT key** triggers shooting in the direction hero last moved
2. **Bullets move faster** than the hero (4 pixels/frame vs 2 pixels/frame)
3. **Wall collision** destroys bullets instantly
4. **Enemy collision** destroys both bullet AND enemy (with explosion!)
5. **Rate limiting** prevents bullet spam (300ms cooldown)

### Modern Bullet System Implementation

```javascript
// Bullet configuration
const BULLET_CONFIG = {
    speed: 4,           // Pixels per frame (faster than hero)
    damage: 1,          // Damage dealt to enemies
    width: 4,           // Collision size
    height: 4,
    color: 0xFFFF00,    // Bright yellow for visibility
    cooldown: 300       // Milliseconds between shots
};

// Modern bullet object structure
class Bullet {
    constructor(x, y, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.width = BULLET_CONFIG.width;
        this.height = BULLET_CONFIG.height;
        this.active = true;
        
        // Create visual representation
        this.sprite = new Graphics()
            .rect(0, 0, this.width, this.height)
            .fill(BULLET_CONFIG.color);
    }
    
    update() {
        // Move bullet
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }
    
    checkCollisions() {
        // Wall collision
        if (this.hitsWall()) {
            this.destroy();
            return true;
        }
        
        // Enemy collision
        const hitEnemy = this.checkEnemyHits();
        if (hitEnemy) {
            this.destroy();
            return true;
        }
        
        return false;
    }
    
    destroy() {
        this.active = false;
        this.sprite.visible = false;
        // Return to pool for reuse
        BulletPool.returnBullet(this);
    }
}
```

**Why this design rocks:**
- 🎯 **Clear separation**: Each bullet manages its own behavior
- ⚡ **Performance optimized**: Object pooling prevents garbage collection lag
- 🔧 **Configurable**: Easy to tweak speeds, damage, cooldowns
- 🎨 **Visual feedback**: Bullets are bright and easy to track


## Shooting Controls: Responsive Combat Input 🎮

Let's implement smooth, responsive shooting that feels great:

```javascript
// Player shooting state
const player = {
    // ... other properties ...
    lastDirection: { x: 0, y: -1 }, // Default shoot up
    lastShot: 0,                    // Timestamp of last shot
    shootCooldown: 300,             // Milliseconds between shots
    maxBullets: 5                   // Limit active bullets
};

// Input handling with shooting
function handleInput() {
    let moved = false;
    
    // Movement (also sets shooting direction)
    if (keys['ArrowLeft']) {
        player.x -= player.speed;
        player.lastDirection = { x: -1, y: 0 };
        moved = true;
    }
    if (keys['ArrowRight']) {
        player.x += player.speed;
        player.lastDirection = { x: 1, y: 0 };
        moved = true;
    }
    if (keys['ArrowUp']) {
        player.y -= player.speed;
        player.lastDirection = { x: 0, y: -1 };
        moved = true;
    }
    if (keys['ArrowDown']) {
        player.y += player.speed;
        player.lastDirection = { x: 0, y: 1 };
        moved = true;
    }
    
    // Shooting
    if (keys['ShiftLeft'] || keys['ShiftRight']) {
        tryShoot();
    }
}

// Smart shooting function
function tryShoot() {
    const now = Date.now();
    
    // Check cooldown
    if (now - player.lastShot < player.shootCooldown) {
        return; // Too soon!
    }
    
    // Check bullet limit (prevents spam)
    if (activeBullets.length >= player.maxBullets) {
        return; // Too many bullets already!
    }
    
    // Create bullet
    fireBullet(player.lastDirection.x, player.lastDirection.y);
    player.lastShot = now;
    
    // Visual feedback
    showShootingEffect();
}

function fireBullet(dirX, dirY) {
    // Calculate spawn position (slightly in front of player)
    const offsetX = dirX * (player.width / 2 + 3);
    const offsetY = dirY * (player.height / 2 + 3);
    
    const bulletX = player.x + player.width/2 + offsetX;
    const bulletY = player.y + player.height/2 + offsetY;
    
    // Create the bullet
    const bullet = new Bullet(bulletX, bulletY, dirX * 4, dirY * 4);
    activeBullets.push(bullet);
    stage.addChild(bullet.sprite);
}

function showShootingEffect() {
    // Flash player briefly
    player.sprite.tint = 0xFFFFAA;
    setTimeout(() => {
        player.sprite.tint = 0xFFFFFF;
    }, 100);
    
    // Optional: Add muzzle flash or sound effect here
}
```

**Smart features:**
- 🎯 **Direction memory**: Bullets fire in the direction you last moved
- ⏱️ **Rate limiting**: Prevents button mashing bullet spam
- 🔢 **Bullet limit**: Maximum 5 active bullets at once
- ✨ **Visual feedback**: Player flashes when shooting
- 📍 **Smart positioning**: Bullets spawn slightly in front of player


## Collision Detection & Destruction: Satisfying Combat! 💥

Time for the most satisfying part - making things explode when bullets hit them!

```javascript
// Bullet update system
function updateBullets() {
    for (let i = activeBullets.length - 1; i >= 0; i--) {
        const bullet = activeBullets[i];
        
        // Move bullet
        bullet.x += bullet.velocityX;
        bullet.y += bullet.velocityY;
        bullet.sprite.x = bullet.x;
        bullet.sprite.y = bullet.y;
        
        // Check wall collision
        if (bulletHitsWall(bullet)) {
            destroyBullet(i);
            continue;
        }
        
        // Check enemy collisions
        const hitEnemyIndex = checkBulletEnemyCollision(bullet);
        if (hitEnemyIndex !== -1) {
            // BOOM! Explosion effect
            createExplosion(enemies[hitEnemyIndex]);
            
            // Destroy enemy
            destroyEnemy(hitEnemyIndex);
            
            // Destroy bullet
            destroyBullet(i);
            
            continue;
        }
        
        // Remove bullets that go off screen
        if (bullet.x < -10 || bullet.x > 310 || bullet.y < -10 || bullet.y > 250) {
            destroyBullet(i);
        }
    }
}

// Wall collision detection
function bulletHitsWall(bullet) {
    return isSolid(bullet.x, bullet.y) || 
           isSolid(bullet.x + bullet.width, bullet.y) ||
           isSolid(bullet.x, bullet.y + bullet.height) ||
           isSolid(bullet.x + bullet.width, bullet.y + bullet.height);
}

// Enemy collision detection
function checkBulletEnemyCollision(bullet) {
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (!enemy.active) continue;
        
        const distance = Math.sqrt(
            Math.pow(bullet.x - enemy.x, 2) + 
            Math.pow(bullet.y - enemy.y, 2)
        );
        
        const collisionDistance = (bullet.width + enemy.width) / 2 + 2;
        
        if (distance < collisionDistance) {
            return i; // Return enemy index
        }
    }
    return -1; // No collision
}

// Epic explosion effect!
function createExplosion(enemy) {
    const centerX = enemy.x + enemy.width / 2;
    const centerY = enemy.y + enemy.height / 2;
    
    // Create multiple explosion particles
    for (let i = 0; i < 8; i++) {
        const particle = new Graphics()
            .rect(0, 0, 4, 4)
            .fill(0xFF4500 + Math.random() * 0x00FF00); // Random orange to yellow
        
        const angle = (i / 8) * Math.PI * 2;
        const speed = Math.random() * 3 + 2;
        
        particle.x = centerX;
        particle.y = centerY;
        app.stage.addChild(particle);
        
        // Animate explosion particle
        const animateParticle = () => {
            particle.x += Math.cos(angle) * speed;
            particle.y += Math.sin(angle) * speed;
            particle.alpha -= 0.06;
            particle.rotation += 0.1;
            
            if (particle.alpha <= 0) {
                app.stage.removeChild(particle);
            } else {
                requestAnimationFrame(animateParticle);
            }
        };
        
        animateParticle();
    }
}

// Clean object destruction
function destroyBullet(index) {
    const bullet = activeBullets[index];
    app.stage.removeChild(bullet.sprite);
    bulletPool.push(bullet); // Return to pool for reuse
    activeBullets.splice(index, 1);
}

function destroyEnemy(index) {
    const enemy = enemies[index];
    app.stage.removeChild(enemy.sprite);
    enemy.active = false;
    enemies.splice(index, 1);
    
    // Victory check
    if (enemies.length === 0) {
        console.log('🎉 All enemies destroyed! Victory!');
        // Respawn enemies for continuous play
        setTimeout(spawnNewWave, 2000);
    }
}
```

**Destruction system features:**
- 💥 **Epic explosions**: Multi-particle effects with physics
- 🎯 **Precise collision**: Circle-based detection for fairness
- ♻️ **Memory efficient**: Object pooling prevents garbage collection lag
- 🎊 **Visual satisfaction**: Particles, rotation, and fade effects
- 🏆 **Victory detection**: Checks when all enemies are eliminated

## Advanced Shooting Features: Level Up Your Combat! 🎮

**Ready for more awesome shooting mechanics?** Here are pro-level features to make your combat even more engaging:

### 🔥 Enhanced Weapon Systems

```javascript
// Multiple weapon types
const WEAPONS = {
    PISTOL: {
        damage: 1,
        speed: 4,
        cooldown: 300,
        color: 0xFFFF00,
        maxBullets: 5
    },
    MACHINE_GUN: {
        damage: 1,
        speed: 5,
        cooldown: 100,    // Rapid fire!
        color: 0xFF8800,
        maxBullets: 10
    },
    LASER: {
        damage: 2,
        speed: 8,
        cooldown: 500,
        color: 0x00FF00,
        maxBullets: 3
    }
};

// Weapon switching
function switchWeapon(weaponType) {
    player.currentWeapon = weaponType;
    const weapon = WEAPONS[weaponType];
    player.shootCooldown = weapon.cooldown;
    player.maxBullets = weapon.maxBullets;
}
```

### 🎯 Smart Combat Features

**Ammo limitation system:**
```javascript
const player = {
    // ... other props ...
    ammo: 20,
    maxAmmo: 50
};

function tryShoot() {
    if (player.ammo <= 0) {
        console.log('💥 Out of ammo! Find more!');
        return; // No pew pew for you!
    }
    
    // ... shooting logic ...
    player.ammo--;
}
```

**Enemy return fire:**
```javascript
function updateEnemies() {
    enemies.forEach(enemy => {
        // Random shooting chance
        if (Math.random() < 0.002 && enemy.canShoot) {
            enemyShoot(enemy);
        }
    });
}
```

**Bullet hell mode:**
```javascript
// One bullet limit for precision gameplay
function tryShoot() {
    if (activeBullets.length > 0) {
        return; // Must wait for current bullet
    }
    // ... create single bullet ...
}
```

### 📈 Performance Optimizations

**Object pooling** (already implemented in our demo!):
- Reuse bullet objects instead of creating/destroying
- Prevents garbage collection stutters
- Smooth performance even with lots of bullets

**Collision optimization:**
- Use distance squared for collision checks (faster than sqrt)
- Spatial partitioning for many enemies
- Early exit collision loops

## Side-Scrolling Shooting: Complete Platform Combat! 🏃‍♂️

<div id="platformShootingDemo" style="text-align: center; margin: 20px 0;">
    <canvas id="platformCanvas" width="300" height="240" style="border: 2px solid #333; background: #87CEEB;"></canvas>
    <div style="margin-top: 10px;">
        <strong>Controls:</strong> Arrow Keys + Spacebar to jump, Shift to shoot<br>
        <strong>Try:</strong> Jump and shoot in mid-air! Full platform combat!
    </div>
</div>

<script type="module">
// Platform shooter demo
import { Application, Graphics } from 'https://unpkg.com/pixi.js@8.0.0/dist/pixi.min.mjs';

const canvas2 = document.getElementById('platformCanvas');
const app2 = new Application();

await app2.init({
    canvas: canvas2,
    width: 300,
    height: 240,
    backgroundColor: 0x87CEEB
});

// Platform map
const platformMap = [
    [1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,0,0,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [1,1,0,0,1,1,0,0,1,1],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1,1]
];

// Draw platform map
for (let row = 0; row < platformMap.length; row++) {
    for (let col = 0; col < platformMap[row].length; col++) {
        if (platformMap[row][col] === 1) {
            const tile = new Graphics()
                .rect(0, 0, 30, 30)
                .fill(0x8B4513);
            tile.x = col * 30;
            tile.y = row * 30;
            app2.stage.addChild(tile);
        }
    }
}

// Platform hero with jumping and shooting
const platformHero = new Graphics().rect(0, 0, 12, 12).fill(0xff4444);
platformHero.x = 60;
platformHero.y = 180;
app2.stage.addChild(platformHero);

const platformPlayer = {
    sprite: platformHero,
    x: 60, y: 180, width: 12, height: 12,
    velocityX: 0, velocityY: 0,
    speed: 2, jumpPower: -12,
    onGround: false,
    lastDirection: {x: 1, y: 0},
    lastShot: 0,
    shootCooldown: 400
};

const platformBullets = [];
const platformEnemies = [];

// Spawn platform enemies
for (let i = 0; i < 3; i++) {
    const enemy = new Graphics().rect(0, 0, 10, 10).fill(0x8A2BE2);
    enemy.x = 150 + i * 60;
    enemy.y = 60 + i * 40;
    app2.stage.addChild(enemy);
    
    platformEnemies.push({
        sprite: enemy,
        x: enemy.x,
        y: enemy.y,
        width: 10,
        height: 10,
        active: true
    });
}

const platformKeys = {};
window.addEventListener('keydown', (e) => { platformKeys[e.code] = true; });
window.addEventListener('keyup', (e) => { platformKeys[e.code] = false; });

function isSolid2(x, y) {
    const col = Math.floor(x / 30);
    const row = Math.floor(y / 30);
    return row >= 0 && row < platformMap.length && col >= 0 && col < platformMap[0].length && platformMap[row][col] === 1;
}

function updatePlatformGame() {
    // Player movement
    if (platformKeys['ArrowLeft']) {
        platformPlayer.velocityX = -platformPlayer.speed;
        platformPlayer.lastDirection = {x: -1, y: 0};
    } else if (platformKeys['ArrowRight']) {
        platformPlayer.velocityX = platformPlayer.speed;
        platformPlayer.lastDirection = {x: 1, y: 0};
    } else {
        platformPlayer.velocityX = 0;
    }
    
    // Jumping
    if (platformKeys['Space'] && platformPlayer.onGround) {
        platformPlayer.velocityY = platformPlayer.jumpPower;
        platformPlayer.onGround = false;
    }
    
    // Shooting
    if (platformKeys['ShiftLeft'] && Date.now() - platformPlayer.lastShot > platformPlayer.shootCooldown) {
        const bullet = new Graphics().rect(0, 0, 4, 4).fill(0xFFFF00);
        bullet.x = platformPlayer.x + platformPlayer.width/2;
        bullet.y = platformPlayer.y + platformPlayer.height/2;
        app2.stage.addChild(bullet);
        
        platformBullets.push({
            sprite: bullet,
            x: bullet.x, y: bullet.y,
            velocityX: platformPlayer.lastDirection.x * 4,
            velocityY: platformPlayer.lastDirection.y * 4,
            width: 4, height: 4
        });
        
        platformPlayer.lastShot = Date.now();
    }
    
    // Apply gravity
    platformPlayer.velocityY += 0.8;
    
    // Update position
    platformPlayer.x += platformPlayer.velocityX;
    platformPlayer.y += platformPlayer.velocityY;
    
    // Ground collision
    if (isSolid2(platformPlayer.x + platformPlayer.width/2, platformPlayer.y + platformPlayer.height + 1) && platformPlayer.velocityY > 0) {
        platformPlayer.y = Math.floor((platformPlayer.y + platformPlayer.height) / 30) * 30 - platformPlayer.height;
        platformPlayer.velocityY = 0;
        platformPlayer.onGround = true;
    } else {
        platformPlayer.onGround = false;
    }
    
    // Bounds
    platformPlayer.x = Math.max(0, Math.min(platformPlayer.x, 288));
    platformPlayer.y = Math.max(0, platformPlayer.y);
    
    platformPlayer.sprite.x = platformPlayer.x;
    platformPlayer.sprite.y = platformPlayer.y;
    
    // Update bullets
    for (let i = platformBullets.length - 1; i >= 0; i--) {
        const bullet = platformBullets[i];
        bullet.x += bullet.velocityX;
        bullet.y += bullet.velocityY;
        bullet.sprite.x = bullet.x;
        bullet.sprite.y = bullet.y;
        
        // Remove bullets that hit walls or go off screen
        if (isSolid2(bullet.x, bullet.y) || bullet.x < 0 || bullet.x > 300 || bullet.y < 0 || bullet.y > 240) {
            app2.stage.removeChild(bullet.sprite);
            platformBullets.splice(i, 1);
            continue;
        }
        
        // Check enemy hits
        for (let j = platformEnemies.length - 1; j >= 0; j--) {
            const enemy = platformEnemies[j];
            if (!enemy.active) continue;
            
            const dx = bullet.x - enemy.x;
            const dy = bullet.y - enemy.y;
            if (Math.sqrt(dx*dx + dy*dy) < 8) {
                // Hit!
                app2.stage.removeChild(enemy.sprite);
                app2.stage.removeChild(bullet.sprite);
                platformEnemies.splice(j, 1);
                platformBullets.splice(i, 1);
                break;
            }
        }
    }
}

app2.ticker.add(updatePlatformGame);
</script>

**🎉 Congratulations!** You've just implemented a complete combat system! Your game now has:
- ✅ **Responsive shooting** with visual feedback
- ✅ **Smart collision detection** for bullets and enemies
- ✅ **Epic explosion effects** for satisfying enemy destruction  
- ✅ **Performance-optimized** object pooling
- ✅ **Multiple weapon types** and advanced features
- ✅ **Platform shooter mechanics** combining jumping and shooting

**What you've learned:** Combat systems aren't just about dealing damage - they're about creating satisfying feedback loops that make players feel powerful and engaged. The visual effects, sound cues, and responsive controls are just as important as the underlying mechanics!

**Next up**: Time to add collectible items that make exploration rewarding! [Next: Getting Items](/tutorial/15-getting-items/)