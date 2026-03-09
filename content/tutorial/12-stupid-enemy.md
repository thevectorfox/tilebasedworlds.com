+++
title = "Stupid Enemy"
date = 2026-03-09T08:00:00+11:00
weight = 12
draft = false
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/13-enemy-on-platform/"
prev = "/tutorial/11-ladders/"
+++

We have worked hard to get our hero moving, but he has no challenge. We need something more. No, we don't need food and drinks and pretty girls, what we need, is some enemies. Enemies are like salt in the soup, without it everything tastes lame. Good games have smart enemies, but we will start with simple dumb enemies. All they do, is walk back and forth and check if they have touched the hero:

```
EXAMPLE HERE
```

So far we have had two types of objects: hero and tiles. Hero is moved by the player, tiles wont move. The enemies will be like hero, only player cant move them, we will give them brains for moving. We will make two different enemies, first will walk up and down, second will walk left and right. They both will turn around when they hit the wall.

Before you start to think your game needs very-very complex enemies, think again. Many games don't actually use smart enemies, or if they do, not all of them are too bright. You don't have unlimited resources with Flash, so your 100 smart enemies using complex A* pathfinding will slow down your game too much. If you can, make some enemies dumb and some smarter, in the end player might not even notice the difference. Beside, we all know how we like to be smarter than others, so let the player feel that joy too. :)


## PREPARE THE ENEMY

Create enemy movie clips same way you made hero (look at the tutorial "The Hero" if you forgot). They should have 4 keyframes with left/up/down/right animations. They should also be set exported as "enemy1" and "enemy2". Now let's add enemies array:

```
myEnemies = [
[0],
[[1, 6, 1]],
[[2, 1, 3]]
];
```

So, for the map1 we have declared 1 array representing 1 enemy. The numbers give us the type of enemy (woohooo! we have more than one type of dumb enemies) and its starting position. When map is built, the enemy is placed on the tile x=6, y=1. Same way we have 1 enemy in map2, but that's different type. You can add more enemies into one map, but you have to place them into walkable tiles, not inside the walls.

Let's declare some templates for enemies:

```
game.Enemyp1 = function () {};
game.Enemyp1.prototype.xMove = 0;
game.Enemyp1.prototype.yMove = 1;
game.Enemyp1.prototype.speed = 2;

game.Enemyp2 = function () {};
game.Enemyp2.prototype.xMove = 1;
game.Enemyp2.prototype.yMove = 0;
game.Enemyp2.prototype.speed = 2;
```

They look similar, but they behave different way. Enemyp1 will walk vertically because its property yMove is 1, but Enemyp2 will walk left and right. You can set enemies xMove/yMove properties into 1 or -1 or 0. Those are same values we pass to the moveChar function from detect keys function. Please avoid setting both xMove/yMove to non-zero unless you want your enemies to move diagonally.

If you make both xMove and yMove equal to 0, you will have non-moving enemy. That's not much fun, but you never know what you might need.

The speed property determines how fast enemy will move. Different enemies can have different speeds too.


## PLACE THE ENEMY

In the buildMap function add after doors and before char following piece of code:

```
var enemies = myEnemies[game.currentMap];
game.currentEnemies = enemies.length;
for (var i = 0; i < game.currentEnemies; ++i)
{
	var name = "enemy" + i;
	game[name]= new game["Enemyp" + enemies[i][0]];
	game.clip.attachMovie("enemy" + enemies[i][0], name, 10001 + i);
	game[name].clip = game.clip[name];
	game[name].xtile = enemies[i][1];
	game[name].ytile = enemies[i][2];
	game[name].width = game.clip[name]._width / 2;
	game[name].height = game.clip[name]._height / 2;
	game[name].x = (game[name].xtile * game.tileW) + game.tileW / 2;
	game[name].y = (game[name].ytile * game.tileH) + game.tileH / 2;
	game[name].clip._x = game[name].x;
	game[name].clip._y = game[name].y;
}
```

What's happening here? First we get enemies array for current map. Next we will set variable currentEnemies to the length of enemies array so we can always know how many enemies we have created. Then we loop through the enemies array (remember, we currently used only 1 enemy in each map, but there can be more).

Variable name will have the name of our new enemy, so they are named "enemy0", "enemy1", "enemy2"... Then we make new enemy object from the templates we declared earlier:

```
game[name]= new game["Enemy" + enemies[i][0]];
```

from the enemies array we get the number in first position of first enemy. In our example there is number 1, so, new enemy is created using Enemy1 template. In map2 the enemy is made using Enemy2 template because in myEnemies array there is number 2.

Next lines will add starting coordinates, width and height to the enemy object. Then its position is calculated and enemy is placed into correct position.

But, you may cry out loud, but he doesn't move! No worry, we will make him move.


## MOVE THE ENEMY

Like most people, most enemies need brains. And so, let's write enemyBrain function:

```
function enemyBrain ()
{
	for (var i = 0; i < game.currentEnemies; ++i)
	{
		var name = "enemy" + i;
		var ob = game[name];
		getMyCorners (ob.x + ob.speed * ob.xMove, ob.y + ob.speed * ob.yMove, ob);
		if (ob.downleft and ob.upleft and ob.downright and ob.upright)
		{
			moveChar(ob, ob.xMove, ob.yMove);
		}
		else
		{
			ob.xMove = -ob.xMove;
			ob.yMove = -ob.yMove;
		}
		var xdist = ob.x - char.x;
		var ydist = ob.y - char.y;
		if (Math.sqrt(xdist * xdist + ydist * ydist) < ob.width + char.width)
		{
			removeMovieClip(_root.tiles);
			_root.gotoAndPlay(1);
		}
	}
}
```

As you can see, we again loop through all the enemies using variable game.currentEnemies. ob refers in every step to the current enemy object. When i=0, ob=enemy0 and so on.

We then call getMyCorners function to check if enemy will step into wall. If he won't go into wall, all the variables upleft, downleft, upright and downright will be true saying those tiles are walkable. It's safe to call moveChar function using xMove and yMove properties (which are -1, 0 or 1) same way we called moveChar from key detection to move char, but since we pass enemy object to moveChar, the enemy will be moved. Told you we can reuse same function to move many objects :)

In case enemy would hit the wall tile, we reverse the xMove and yMove so enemy will start to move into opposite direction. If yMove was 1, it will become -1, but if it was 0, it will remain 0.

Last part of brains checks if enemy is close enough to the hero and if they are too close, game ends. Of course, game doesn't usually end so easily, you would reduce hero's life or do other tricks, but that's up to you. We use simple equation called "Pythagoras theorem" to calculate the distance between enemy and hero. If you really-really want pixel perfect collision, you could create complex hitTest here, but I don't see reason for it. Don't get too close or you die!

To call this function in every step, add line in the end of detectKeys function:

```
_root.enemyBrain();
```

That's it, you can add simple enemies to be avoided. Next chapter we make our enemies behave more like human being, that is, run around until hitting the wall, then change the direction and run more.

You can download the source fla with all the code and movie set up here.

 

Big thanks to kuRTko for spotting annoying bug in the enemies code. I have updated the tutorials and flas, but if you happen to see code somewhere where enemies are declared as:
game.Enemy1 = function ()
instead of game.Enemyp1 = function (), please fix them. Note, the bug was that enemy prototypes used same name "enemy+number" as actual enemy objects. The prototypes should be named as "enemyp+number". Don't forget to check the line in the buildMap function too, it should be after update:
game[name]= new game["Enemyp"+enemies[i][0]];