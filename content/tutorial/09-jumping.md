+++
title = "Jumping"
date = 2026-03-09T05:00:00+11:00
weight = 9
draft = false
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/10-clouds/"
prev = "/tutorial/08-*/"
+++

Lets turn our game from up view to the side view so we can add jumping. In this example we are looking to the game from side and our hero can walk left and right with arrow keys. He will also be able to jump with space key. Like this:

```
EXAMPLE HERE
```


## JUMP BASICS

Any jump begins with push up. As you remember, up in the Flash stage means y coordinate will decrease. So, we calculate new_y=current_y-jumpspeed. If we do it only once, then hero moves up by jumpspeed and stops there. Yes, we have to continue calculating new y position as long the hero jumps, but we also have to change the jumpspeed or our hero will just fly away to the sky and never returns.

For changing jumpspeed we will declare new variable "gravity". Gravity is pulling hero back to the ground, thats down. In every step we add gravity to the jumpspeed: jumpspeed=jumpspeed+gravity. You can change the value of gravity, when you make less gravity, hero will fly higher (balloon-type), when you increase gravity, hero will pop down sooner (stone-type). As we have lotsa objects and character is also an object, you can actually give different gravity to different objects.

Lets look at one example. Jumpspeed starting value is -10 and gravity is 2. First step, hero is moved up by 10 pixels and jumpspeed gets value of 8. Next step, moving up by 8, speed=6. After couple of steps, jumpspeed gets value of 0, meaning hero wont move up anymore. Next step jumpspeed has positive value and hero starts to move down.

But what to do when hero hits the solid tile (wall) while jumping. If hero is jumping up and hits wall above, we will set the jumpspeed to 0 and hero starts to fall down. If hero hits solid tile below, then he has landed and jump is over.

In tile based game its always important not to let speed get bigger then size of tile. If hero has too high speed, he will not check the next tile, and might move through walls. While some magicians can move through walls, in normal game thats just a bug.

As you can see, jumping wont affect horisontal movement. Its still done exactly same way as before. We only have to check after moving hero left/right, if he has walked off the solid tile below and might start to fall down.


## BE MY HERO

We add some properties to our character:

```
char = {xtile:2, ytile:1, speed:4, jumpstart:-18, gravity:2, jump:false};
```
The property speed will set the speed when moving left or right. Jumpstart is the starting value of jumpspeed. Gravity will pull hero back to the ground and property "jump" will be used to check if hero is currently jumping (then jump=true) or standing/walking/running/sitting/fighting on solid ground (jump=false).

Next line to change is in the buildmap function, when we set the starting position of hero. In examples before we did put hero in the center of tile, but that will look weird since hero will always start falling down after new map is created. We will make hero stand in the bottom of its starting tile (dont forget to move that line after the line declaring char.height):

```
char.y = ((char.ytile + 1) * game.tileW) - char.height;
```
Functions changeMap and getMyCorners doesnt need any change.


## GIVE ME THE WINGS

Lets starts with detectKeys function. We need to add code to check for space key and we can remove up/down arrow keys.

```
function detectKeys()
{
	var ob = _root.char;
	var keyPressed = false;
	if (Key.isDown(Key.SPACE) and !ob.jump)
	{
		ob.jump = true;
		ob.jumpspeed = ob.jumpstart;
	}
	if (Key.isDown(Key.RIGHT))
	{
		keyPressed = _root.moveChar(ob, 1, 0);
	}
	else if (Key.isDown(Key.LEFT))
	{
		keyPressed = _root.moveChar(ob, -1, 0);
	}
	if (ob.jump)
	{
		keyPressed = _root.jump(ob);
	}
	if (!keyPressed)
	{
		ob.clip.char.gotoAndStop(1);
	}
	else
	{
		ob.clip.char.play();
	}
}
```
Note how we wont let character to jump again while he is already jumping (!ob.jump). Space key will be counted for starting new jump only if variable jump is false. But if space key is pressed and hero was not yet jumping, we will set variable jump to true and give hero starting speed.

After left/right arrow keys we will check if variable jump is true and if it is, we will call new "jump" function (function "jump" is not same thing as variable "jump", bad choice of names from me, sorry). This function will be called every step until variable jump is true, so our hero continues jumping even after the space key is released.

Jump function will add gravity to the current jumpspeed. It will then check if jumping speed has grown too big and if it is, will set the speed equal to the tile size. Last lines will call moveChar function:

```
function jump (ob)
{
	ob.jumpspeed = ob.jumpspeed + ob.gravity;
	if (ob.jumpspeed > game.tileH)
	{
		ob.jumpspeed = game.tileH;
	}
	if (ob.jumpspeed < 0)
	{
		moveChar(ob, 0, -1, -1);
	}
	else if (ob.jumpspeed > 0)
	{
		moveChar(ob, 0, 1, 1);
	}
	return (true);
}
```
We also need to change moveChar function. In the previous chapters we used ob.speed to change objects position, but now we also have the jumpspeed, which is changing in every step. Change the start of moveChar function:

```
function moveChar(ob, dirx, diry, jump)
{
	if (Math.abs(jump) == 1)
	{
		speed = ob.jumpspeed * jump;
	}
	else
	{
		speed = ob.speed;
	}
	...
```
The jump argument will be 1 or -1 only if the moveChar function is called from jump function and then variable speed will have value from jumpspeed. When it is called from left/right keys detection variable speed will be equal to ob.speed. Change lines in the moveChar functions that used previously variable ob.speed to "speed" so correct value is used.

In the going up code we change jumpspeed to 0 if we hit the wall above:

```
ob.y = ob.ytile * game.tileH + ob.height;
ob.jumpspeed = 0;
```
And in the down part we set jump to false if we detect wall below:

```
ob.y = (ob.ytile + 1) * game.tileH - ob.height;
ob.jump = false;
```
In the left and right movement, we add line to check for the situation, when hero walks over the edge of platform and should start falling down:

```
ob.x += speed * dirx;
fall (ob);
```
So, the last new function we will need, is fall:

```
function fall (ob)
{
	if (!ob.jump)
	{
		getMyCorners (ob.x, ob.y + 1, ob);
		if (ob.downleft and ob.downright)
		{
			ob.jumpspeed = 0;
			ob.jump = true;
		}
	}
}
```
We cant start falling down if we already are jumping, so first we check if variable jump is false (hero currently stands). If we are standing, we will call the getMyCorners function to get corner points of hero. We use coordinate ob.y+1 to check if point 1 pixel lower then characters current position is walkable. If both corner points below hero (downleft and downright) are walkable (have value of true) that will mean our dear hero is standing on the air.

To correct the "thou-shall-not-stand-in-the-air" situation, we will force hero to jump by setting variable jump=true. But unlike when space key was pressed, we will set the starting speed of jump to 0, so hero will start to fall down.

You can download the source fla with all the code and movie set up here.