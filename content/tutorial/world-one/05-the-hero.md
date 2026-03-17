+++
title = "The Hero"
date = 2026-03-09T01:00:00+11:00
weight = 5
draft = false
tags = ["beginner", "tiles", "tutorial"]
next = "/tutorial/world-one/06-keys-to-move/"
prev = "/tutorial/world-one/04-rendering-a-map/"
+++

Time to create your HERO! 🦸 Every legendary game needs a protagonist - someone the player connects with, controls, and cheers for. Whether it's Mario jumping through pipes, Link exploring Hyrule, or Celeste climbing mountains, the hero makes the game come alive. You're about to bring your first character into your tile-based world!

<div id="hero-demo" style="border: 2px solid #00ff41; border-radius: 8px; margin: 20px 0; background: #000;"></div>

<script>
window.addEventListener('load', async function() {
    // Create PixiJS application for hero demo
    const app = new PIXI.Application();
    await app.init({
        width: 240,
        height: 180,
        backgroundColor: 0x2c3e50,
        antialias: true
    });
    
    document.getElementById('hero-demo').appendChild(app.canvas);
    
    // Our trusty map
    const myMap = [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1]
    ];
    
    const TILE_SIZE = 30;
    
    // First, render our map tiles
    function createTileGraphics(tileType) {
        const graphics = new PIXI.Graphics();
        if (tileType === 1) {
            graphics.beginFill(0x00ff41);
        } else {
            graphics.beginFill(0x003311);
        }
        graphics.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
        graphics.lineStyle(1, 0x00ff41, 0.5);
        graphics.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
        graphics.endFill();
        return graphics;
    }
    
    // Render the map
    for (let row = 0; row < myMap.length; row++) {
        for (let col = 0; col < myMap[row].length; col++) {
            const tile = createTileGraphics(myMap[row][col]);
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            app.stage.addChild(tile);
        }
    }
    
    // NOW FOR THE HERO! 🦸
    const hero = new PIXI.Graphics();
    hero.beginFill(0xff4444);  // Bright red hero
    hero.drawRect(-10, -10, 20, 20);  // 20x20 square, centered
    hero.endFill();
    
    // Position hero at tile (2, 1) - that's column 2, row 1
    const heroTileX = 2;
    const heroTileY = 1;
    
    // Convert tile position to pixel position (center of tile)
    hero.x = (heroTileX * TILE_SIZE) + (TILE_SIZE / 2);
    hero.y = (heroTileY * TILE_SIZE) + (TILE_SIZE / 2);
    
    // Add hero to stage (it appears on top of tiles!)
    app.stage.addChild(hero);
    
    // Add a subtle pulse animation to make it feel alive
    let pulseDirection = 1;
    app.ticker.add(() => {
        hero.scale.x += pulseDirection * 0.002;
        hero.scale.y += pulseDirection * 0.002;
        
        if (hero.scale.x > 1.1 || hero.scale.x < 0.9) {
            pulseDirection *= -1;
        }
    });
});
</script>

Look at that! Your hero (the red square) is standing proudly in your game world! 🔥

## CREATING YOUR HERO OBJECT

What doesn't look mighty? That red square is your HERO! 💪 Sure, they might not look like Link or Mario yet, but every legendary character started as simple shapes. The beauty of game development is that you can make this hero uniquely yours!

**Modern Hero Setup:**
Let's create a hero object that holds all our character's data:

```js
// Hero object - the star of your game!
const hero = {
    // Tile-based position (which tile are we standing on?)
    tileX: 2,
    tileY: 1,
    
    // Pixel position (exact screen coordinates)
    x: 0,
    y: 0,
    
    // Size (for collision detection)
    width: 20,
    height: 20,
    
    // PixiJS sprite (we'll create this next)
    sprite: null,
    
    // Game properties
    speed: 2,
    health: 100,
    
    // We'll add more awesome properties later!
};
```

**Why tile AND pixel positions?** Great question! 
- **tileX/tileY**: Which game tile are we standing on? Super useful for collision detection and game logic
- **x/y**: Exact pixel coordinates for smooth movement and precise positioning

Think of it like this: tile position is your "address" ("I'm at tile 2,1"), pixel position is your exact location ("I'm at pixel 75,45")!

## BRINGING YOUR HERO TO LIFE! 🚀

Time to make your hero appear in the world! Add this amazing function to your game:

```js
function createHero(heroData, tileSize) {
    // Create the visual representation
    const heroSprite = new PIXI.Graphics();
    
    // Draw a simple but mighty hero (you can customize this!)
    heroSprite.beginFill(0xff4444);  // Epic red color
    heroSprite.drawRect(-heroData.width/2, -heroData.height/2, heroData.width, heroData.height);
    heroSprite.endFill();
    
    // Add a cool border
    heroSprite.lineStyle(2, 0xffffff, 0.8);
    heroSprite.drawRect(-heroData.width/2, -heroData.height/2, heroData.width, heroData.height);
    
    // Save reference to the sprite
    heroData.sprite = heroSprite;
    
    // Calculate pixel position from tile position
    updateHeroPosition(heroData, tileSize);
    
    return heroSprite;
}

function updateHeroPosition(heroData, tileSize) {
    // Convert tile coordinates to pixel coordinates
    heroData.x = (heroData.tileX * tileSize) + (tileSize / 2);
    heroData.y = (heroData.tileY * tileSize) + (tileSize / 2);
    
    // Update the sprite position
    if (heroData.sprite) {
        heroData.sprite.x = heroData.x;
        heroData.sprite.y = heroData.y;
    }
}
```

**The magic formula:** `(tileX * tileSize) + (tileSize / 2)`

**Why this works:**
- `tileX * tileSize` = Gets us to the left edge of the tile
- `+ (tileSize / 2)` = Moves us to the center of the tile
- **Result**: Hero appears perfectly centered in their tile! ⭐

**Adding to your buildMap function:**
```js
// After rendering all your tiles, add this:
const heroSprite = createHero(hero, game.tileW);
app.stage.addChild(heroSprite);
```

## LEVEL UP YOUR HERO! 🎨

Want to make your hero look more epic? Here are some ideas to try:

**Custom Colors:**
```js
// Try these hero colors!
heroSprite.beginFill(0x00ff00);  // Green hero
heroSprite.beginFill(0x0066ff);  // Blue hero  
heroSprite.beginFill(0xff6600);  // Orange hero
heroSprite.beginFill(0x9932cc);  // Purple hero
```

**Different Shapes:**
```js
// Circle hero
heroSprite.drawCircle(0, 0, 10);

// Diamond hero
heroSprite.drawPolygon([-10, 0, 0, -10, 10, 0, 0, 10]);
```

**Loading Custom Sprites:**
```js
// Advanced: Load your own hero image
const heroTexture = await PIXI.Assets.load('hero.png');
const heroSprite = new PIXI.Sprite(heroTexture);
// Set anchor to center
heroSprite.anchor.set(0.5);
```

🏆 **ACHIEVEMENT UNLOCKED: First Hero Created!**

You've just accomplished something amazing - you created your first interactive game character! Your hero now exists in your tile-based world, perfectly positioned and ready for adventure.

**What you've mastered:**
- ✅ Character object design
- ✅ Tile-to-pixel coordinate conversion
- ✅ PixiJS sprite creation and positioning
- ✅ The foundation for ALL character movement!

Ready to make your hero MOVE? Next up: keyboard controls that'll bring your character to life! [Next: Keys to Move](/tutorial/world-one/06-keys-to-move/)