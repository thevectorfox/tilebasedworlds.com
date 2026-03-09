+++
title = "Enemy on Platform"
date = 2026-03-09T09:00:00+11:00
weight = 13
draft = false
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/14-shoot-him/"
prev = "/tutorial/12-stupid-enemy/"
+++

If you want to have enemies in the side view jumping game like this (in the second room):

```
EXAMPLE HERE
```

You only need to change couple of lines. The enemy will walk on the platform and detect the end of platform. In the end enemy will turn around and walk back. This requires enemy to check for platform below the next tile he would be on:

```
getMyCorners (ob.x + ob.speed * ob.xMove, ob.y + ob.speed * ob.yMove + 1, ob);
if (!ob.downleft and !ob.downright)
{
	...
```

Important number to notice here, is 1 in the ob.y+ob.speed*ob.yMove+1. That will check for wall below next tile. Also note how if statement will be true only if both upleft and upright corner are walls, if one of them is walkable tile, enemy would walk into air.

You can download the source fla with all the code and movie set up here.


## TEACHING THE ENEMY SOME TRICKS

What if our enemy could change direction, not only reverse the direction:

```
EXAMPLE HERE
```


Let's modify enemyBrain function. When we last time just reversed ob.xMove and ob.yMove, now we will choose randomly new direction to move:

```
	...
}
else
{
	ob.xMove = random(2);
	if (ob.xMove == 0)
	{
		ob.xMove = 0;
		ob.yMove = random(2) * 2 - 1;
	}
	else
	{
		ob.xMove = random(2) * 2 - 1;
		ob.yMove = 0;
	}
}
```

When enemy would hit the wall, xMove will get random value. random(2) will have value 0 or 1. If xMove was 0, we set yMove randomly to 1 or -1.
random(2) is 0 or 1.
random(2)*2 is 0 or 2.
random(2)*2-1 is -1 or 1.

In case xMove had value 1, we now set yMove to 0 and get random 1 or -1 for xMove.

You can download the source fla with all the code and movie set up here.

 

That's much nicer, but if we want to make enemy better, we should avoid reversing the last direction.

```
EXAMPLE HERE
```

Write code:

```
	...
}
else
{
	if (ob.xMove == 0)
	{
		ob.xMove = random(2) * 2 - 1;
		ob.yMove = 0;
		getMyCorners (ob.x + ob.speed * ob.xMove, ob.y + ob.speed * ob.yMove, ob);
		if (!ob.downleft or !ob.upleft or !ob.downright or !ob.upright)
		{
			ob.xMove = -ob.xMove;
		}
	}
	else
	{
		ob.xMove = 0;
		ob.yMove = random(2) * 2 - 1;
		getMyCorners (ob.x + ob.speed * ob.xMove, ob.y + ob.speed * ob.yMove, ob);
		if (!ob.downleft or !ob.upleft or !ob.downright or !ob.upright)
		{
			ob.yMove = -ob.yMove;
		}
	}
}
```

This time we first check the current direction. If for example we moved vertically (xMove==0) then we choose randomly 1 or -1 for xMove and set yMove to 0. But if enemy moves into corner, his new direction might send him again into wall. That's why we get the corner points with new direction and if we detect wall, we reverse the new direction.

You can download the source fla with all the code and movie set up here.

 

Ok, enemy moves better since player can't predict where enemy is going to step next. But as you can notice, enemy keeps hugging the walls, he always moves until hitting the wall, then and only then choose another direction. If your map contains large empty areas, player can be sure enemy never comes there. Good example is second room, until hero stays in the center, enemy will never catch him.

We will add a chance for enemy to change direction even when he doesn't hit the wall.

```
EXAMPLE HERE
```

I haven't figured out a good description for ability to change direction while walking, so let's add each enemy new property called "turning":

```
game.Enemy1.prototype.turning = 5;
game.Enemy2.prototype.turning = 5;
```

Turning will represent the chance to randomly change direction in each step. Value of 0 will mean enemy never changes direction, value 100 will make him choose new direction in each step (thats funny, you should try that out).

And to make enemy choose new direction, add to the if statement:

```
if (ob.downleft and ob.upleft and ob.downright and ob.upright and random(100)
				                               > ob.turning)
{
	...
```

In case random(100) will have value less than value of ob.turning, we will choose new direction even when we could continue same way.

You can download the source fla with all the code and movie set up here.

