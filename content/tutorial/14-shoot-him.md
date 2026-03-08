+++
title = "Shoot Him"
date = 2026-03-09T10:00:00+11:00
weight = 14
draft = false
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/15-getting-items/"
prev = "/tutorial/13-enemy-on-platform/"
+++

# SHOOT HIM

You can kill the enemies in many ways. You can use sword, gun or words (extremely powerful weapon that takes long time to master). Lets see how we can shoot the enemy (use SHIFT key to shoot):

```
EXAMPLE HERE
```

When I say "bullet", I mean any object that is flying from the hero looking to kill baddies. It can be cannon ball, arrow, ice cream, penguin etc.

First, we again should think of, what is shooting suppose to do and how will our bullets behave. When key is pressed (SHIFT key), bullet object and movie clip are created on the correct side of the hero. The bullet should start moving straight in the direction hero is facing. If bullet hits the wall or enemy, it is destroyed. If it hits enemy, then enemy is also destroyed.

The speed of bullet should be higher then speed of hero unless you wish to give hero some way to stop the moving bullets. Usually the dumb enemies dont see bullets coming, but you could create enemies that try to avoid bullets. You could also make enemies shooting at the hero.


## PREPARE TO SHOOT

Draw bullet movie clip and make sure its set to be exported as "bullet" so we can attach it to the stage. The graphics inside bullet mc should be aligned to the center.

Lets declare bullet object:

```
game.Bullet = function () {};
game.Bullet.prototype.speed = 5;
game.Bullet.prototype.dirx = 0;
game.Bullet.prototype.diry = -1;
game.Bullet.prototype.width = 2;
game.Bullet.prototype.height = 2;
```

Bullets will move with the speed of 5 pixels per tick. They have width/height of 2 pixels, thats enough damage to the enemy.

Now the properties dirx/diry will make bullet moving. They are same things we used in the moveChar function. If dirx=1, bullet will move right, diry=-1 makes it move up. We will actually take the values of dirx/diry from the char object, but at the start of the game, when char hasnt been moved yet, but player wants to shoot, we will use default values to make bullet move up.

Add two new propeties to game object:

```
game = {tileW:30, tileH:30, currentMap:1, bulletcounter:0};
game.bullets = new Array();
```

The bulletcounter will be counting the number of bullets we have used and helps to give each new bullet new name. First bullet we shoot in the game, will be named bullet0, then bullet1 and so all the way up to bullet100. Then we reset the bulletcounter. We could in theory let it raise forever, but who knows what kind of nasty things can happen then.

game.bullets in an array which will hold reference to all the bullets we have flying around. At the beginning its empty array.

For the char object add shootspeed property for making him stop between the shots:

```
char = {xtile:2, ytile:1, speed:4, shootspeed:1000};
```

Higher shootspeed value makes the char shoot slower and lower value faster. Value of 1000 is exactly 1 second between shots.

For the enemies to die, we have to remove them from the game. Change the enemies creation part in the buildMap function:

```
game.currentEnemies = [];
for (var i = 0; i < enemies.length; ++i)
{
	var name = "enemy" + i;
	game[name] = new game["Enemy" + enemies[i][0]];
	game[name].id = i;
	game.currentEnemies.push(game[name]);
	...
```

We will use currentEnemies to hold the names of all the enemies on the stage. When enemy is killed, we will remove him from the array. The new property "id" helps us to destroy the enemy object placed in the enemies array.

In the detectKeys function add code after checking for arrow keys:

```
if (Key.isDown(Key.SHIFT) and getTimer() > ob.lastshot + ob.shootspeed)
{
	_root.shoot(ob);
}
```

If SHIFT key is pressed and enough time has passed for hero to shoot again, we will call shoot function.

In the beginning of moveChar function add two lines to save the direction of current object:

```
ob.dirx = dirx;
ob.diry = diry;
```

We will use those to determine which way our bullets will move.


## SHOOT

For creating the bullets and giving bullets all the data they need for successful deadly flights, we will use new function called "shoot":

```
function shoot (ob)
{
	ob.lastshot = getTimer();
	game.bulletcounter++;
	if (game.bulletcounter > 100)
	{
		game.bulletcounter = 0;
	}
	var name = "bullet" + game.bulletcounter;
	game[name] = new game.Bullet;
	game[name].id = game.bulletcounter;
	game.bullets.push(game[name]);
	if (ob.dirx or ob.diry)
	{
		game[name].dirx = ob.dirx;
		game[name].diry = ob.diry;
	}
	game[name].xtile = ob.xtile;
	game[name].ytile = ob.ytile;
	game.clip.attachMovie("bullet", name, 10100 + game.bulletcounter);
	game[name].clip = game.clip[name];
	game[name].x = (ob.x + game[name].dirx * ob.width);
	game[name].y = (ob.y + game[name].diry * ob.height);
	game.clip[name]._x = game[name].x;
	game.clip[name]._y = game[name].y;
}
```

First we have passed object to the function. In this case it is char object as shoot was called from detectKeys function, but if bullet would be shot by enemy, enemy object would be passed.

We use getTimer() function to save the time this shot was fired in the lastshot property.

Next we add 1 to the game.bulletcounter property and if it is >100 we set bulletcounter back to 0.

Now we create new bullet using bulletcounter to give new bullet unique name and we also save this number into bullet object. We will add reference to the new bullet to the game.bullets array.

The if condition with dirx/diry checks if char has been moved. If player hasnt moved the char yet, the char object doesnt have dirx/diry properties and we will have the default dirx/diry from the bullet template. However, if the char has been moved, we set bullets dirx/diry equal to the chars.

To make bullet appear by the char, we need to save chars position. ob.xtile and ob.ytile are copied to the bullet.

Last part of the code creates new movie clip for the bullet, calculates its position on the screen and sets it there. Interesting part might be how exactly is bullets position found:

```
game[name].x = (ob.x + game[name].dirx * ob.width);
```

First we take chars position (ob.x), thats where the center of char is. As bullets usually dont come out from the center of hero, we add width of char to that. But since width is multiplied by the value of dirx, the bullet will be placed on the left from char (dirx=-1), right from char (dirx=1) or in the center (dirx=0). Uh, you may wonder, not in the center? But yes, dirx can be 0 only if diry is either 1 or -1, so the bullet ends up above or below char.


## KILL!

In the end of detectKeys function add line to call second new function that will move the bullet and look if we have killed something:

```
_root.moveBullets();
```
And the function itself:

```
function moveBullets ()
{
	for (var i = 0; i < game.bullets.length; ++i)
	{
		var ob = game.bullets[i];
		getMyCorners (ob.x + ob.speed * ob.dirx, ob.y + ob.speed * ob.diry, ob);
		if (ob.downleft and ob.upleft and ob.downright and ob.upright)
		{
			moveChar(ob, ob.dirx, ob.diry);
		}
		else
		{
			ob.clip.removeMovieClip();
			delete game["bullet" + game.bullets[i].id];
			game.bullets.splice(i,1);
		}
		for (var j = 0; j < game.currentEnemies.length; ++j)
		{
			var name = "enemy" + game.currentEnemies[j].id;
			var obenemy = game[name];
			var xdist = ob.x - obenemy.x;
			var ydist = ob.y - obenemy.y;
			if (Math.sqrt(xdist * xdist + ydist * ydist)
			                                  < ob.width+obenemy.width)
			{
				obenemy.clip.removeMovieClip();
				delete game["enemy" + game.currentEnemies[j].id];
				game.currentEnemies.splice(j,1);
				ob.clip.removeMovieClip();
				delete game["bullet"+game.bullets[i].id];
				game.bullets.splice(i,1);
			}
		}
	}
}
```

This function loops through all the bullets in the bullets array.

Using getMyCorners we will know if the current bullet will hit the wall or not. If none of its corners hit the wall, we will move the bullet with moveChar function.

Now if the bullet would hit wall, we have to destroy it. There are 3 things we need to do in order to get rid of bullet:

- remove the bullet mc (using removeMovieClip)
- remove bullet object (using delete function)
- remove current bullet from bullets array

We could leave the bullet object in the game, since its without movie clip you cant see it and when removed from bullets array it wont be accessed again, but then after 100 bullets the game will look like scrapyard. Its not nice to leave trash behind you.

When we have successfully moved the bullet and it hasnt hit any walls yet, we start to check if it has hit some enemy. Looping through all the enemies in the currentEnemies array, we calculate the distance between current bullet and current enemy. If they get too close, we destroy both of them.

If you want enemies to die forever, meaning them not to resurrect after leaving the map and returning, place 1 line after the distance calculation: myEnemies[game.currentMap][obenemy.id]=0;

You can do several things to make shooting more inetresting:

- limit the amount of available bullets. You could set variable in the beginning and every time bullet is shot, reduce it by 1, only allowing shooting if its >0
- limit only 1 bullet on stage. You could do this by checking game.bullets and if its length is >0 do not allow shooting
- make enemies shoot bullets too. It would be easy to make them shoot at random times in random directions, same way they change the movement
- make different weapons to choose from. You could declare several bullet templates and assign different damage values to each, so you can get better weapons and kill enemies faster
- Happy shooting! :)

You can download the source fla with all the code and movie set up here.

 

Shooting with jumping side view:

```
EXAMPLE HERE
```

Source fla for side view jumper here.