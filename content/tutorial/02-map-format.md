+++
title = "Map Format"
date = 2026-03-08T22:00:00+11:00
weight = 2
draft = false
tags = ["beginner", "tiles", "tutorial"]
next = "/tutorial/03-more-maps/"
prev = "/tutorial/01-why-tiles/"
+++

Maps are a type of 


## TWO DIMENSIONAL ARRAY

We need two-dimensional array for map. No, it's not something out of another dimension, it's only array with array as every element. Confused? Let's see.

Normal, simple array that normal people can make:
```
myArray = ["a", "b", "c", "d"];
```

That was easy. You can get value of first element with myArray[0], which is "a", second element myArray[1] has value "b", and so on.

Now the clever part! What if we don't put "a", "b" and "c" into array, but we put other arrays there? Yes, we can do that. Here, lets make some arrays:

```
a = ["a1", "a2", "a3"];
b = ["b1", "b2", "b3"];
c = ["c1", "c2", "c3"];
myArray = [a, b, c];
```

Now we have declared array myArray and each element in there is also an array. So, the value of first element `myArray[0]` is a and a is array of ["a1", "a2", "a3"], the second element has value ["b1", "b2", "b3"]. If you write:

```
myVar = myArray[2];
```

then myVar gets value ["c1", "c2", "c3"].

Ok, so what, you might ask. We don't have to stop here. If you write: myVar=myArray[2][0]; then it gets value of first element of third element in myArray "c1".

Let's practice more. myVar=myArray[0][1] takes first element of myArray (a) and second element from that ("a2"): myVar=myArray[1][0] gets value "b1".

You get the picture?


## MAKING THE MAP

First we write the map array that will hold information about every tile:

```
myMap = [
[1, 1, 1, 1, 1, 1, 1, 1],
[1, 0, 0, 0, 0, 0, 0, 1],
[1, 0, 1, 0, 0, 0, 0, 1],
[1, 0, 0, 0, 0, 1, 0, 1],
[1, 0, 0, 0, 0, 0, 0, 1],
[1, 1, 1, 1, 1, 1, 1, 1]
];
```

As you can see our map has 6 rows and 8 columns. If our hero would start from top left corner, he could move 8 steps right and 6 steps down before going out from the map and wondering into unknown space.

But some smart people already have raised the important question: "What do those numbers in the map array mean?". Well, we will use some OOP (that's Objects, but don't run away, they are not so frightening as they sound) to create the tiles and manage our game. We declare several tiles first, they are like templates for other tiles we actually put into game. Then we loop through the map array and pick up the numbers in every position.

If for example we get number 1, then we create new tile from Tile1 template. Then in the game, when we reach that tile, we will check the properties of that tile object. It can have many properties, most basic tiles have only 2 properties, walkable and frame.

Walkable is property that shows if any character can walk into that tile (then we have set walkable=true) or it can not do that (false). We do not use hitTest as hitTest is slow and it is not cool to use it with tile based game.

Frame is property that tells us what frame of tiles movie clip we have to show in that position. It is used when placing the tiles on the screen. As we use same tiles movie clip for every tile by attaching it over again, they all would show frame 1 by default. More about this on Creating Tiles section.

So, if we declare following tile:

```
//wall tile
Tile1 = function () {};
Tile1.prototype.walkable = false;
Tile1.prototype.frame = 2;
```

then we make similar object every time there is 1 in the map array (Tile1), we also say this tile cant be stepped on (walkable=false) and in that spot tile movie clip should show frame 2.

