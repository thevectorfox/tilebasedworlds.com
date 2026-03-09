+++
title = "Pathfinding Best-First"
date = 2026-03-09T23:00:00+11:00
weight = 27
draft = false
tags = ["advanced", "optimization", "tutorial"]
next = "/tutorial/28-slopes/"
prev = "/tutorial/26-pathfinding-breadth-first/"
+++

The breath-first search we created in last chapter, is not too fast. Thats why this time we look into faster algorithm, that would allow usage of larger maps without slowing down the game:

```
EXAMPLE HERE
```


## BEST-FIRST

You may remember from the last chapter, how breath-first search expanded all the nodes in every direction. It had no idea, where the target was, it looked everywhere. Thats why it took forever to find the path. It did find shortest path every time, but lets be honest, whats more important, finding perfect path or making playable game?

So, lets introduce best-first search. This time we will try to see how far the target is from current node and we attach the estimated distance with each node.

```
cost = Math.abs(x - targetx) + Math.abs(y - targety);
```

We count how many steps is target from the current tile both in x and y direction and add steps from both directions.

The other difference is, that we keep our Unchecked_Neighbours array sorted from the node with lowest cost to the target (it should be near the target) to the node with highest cost. By sorting the array we always look into the direction of the target, before going in other directions. But be warned, while the best-first search always finds the path, its not always the shortest path. Its still much faster in most maps then A*.


## BEST-CODES

Take code from previous chapter and change the findPath function. We need to add cost to the first node:

```
var cost = Math.abs(startx - targetx) + Math.abs(starty - targety);
path[path.name] = {x:startx, y:starty, visited:true,
	parentx:null, parenty:null, cost:cost}
```

and we have to pass the target to the addNode function:

```
addNode (N, N.x + 1, N.y, targetx, targety);
addNode (N, N.x - 1, N.y, targetx, targety);
addNode (N, N.x, N.y + 1, targetx, targety);
addNode (N, N.x, N.y - 1, targetx, targety);
```

In the addNode function remember, that target is passed to it too:

```
function addNode (ob, x, y, targetx, targety)
{
  path.name = "node_" + y + "_" + x;
  if(game["t_" + y + "_" + x].walkable)
  {
    var cost = Math.abs(x - targetx) + Math.abs(y - targety);
    if (path[path.name].cost > cost or path[path.name].cost == undefined)
    {
      path[path.name] = {x:x, y:y, visited:false, parentx:ob.x, parenty:ob.y, cost:cost};
      for(var i=0; i<path.Unchecked_Neighbours.length; i++)
      {
        if (cost < path.Unchecked_Neighbours[i].cost)
        {
          path.Unchecked_Neighbours.splice(i, 0, path[path.name]);
          break;
        }
      }
      if (i >= path.Unchecked_Neighbours.length)
      {
        path.Unchecked_Neighbours[path.Unchecked_Neighbours.length] = path[path.name];
      }
    }
  }
}
```

Cost is calculated same way. Then we check if the node is already created or if it is created, but has currently higher cost.

After making new node we start to loop through the Unchecked_Neighbours array and compare cost of current node with cost of each element in the array. We break the loop, if we have found node in the array, that has higher cost. We insert new node in that spot into array.

Last if statement checks if we have looped through entire array without finding any node with higher cost. That means we add our new node in the end of the array.


## FASTER, FASTER

If the pathfinding still takes too long, because you have large maps, you might consider precalculating some parts of the maps or using waypoints to lead char from one part of the map into another part without looking through all the tiles.

Michael Grundvig has created extremely fast pathfinding system using precalculated paths. You can read about it here. He calculates all the paths from each tile to every tile and stores those paths with the maps. When char wants to go from one tile to another during the game, he only has to pick the path and walk.

Waypoints system would slice the map virtually up into smaller maps, connected with prededefined paths. Then you would need to find only which minimap starting tile and target tile belong and use memorised path to get from starting minimap to target. That allows paths for really-really big maps too.

Another way for calculation of larger paths without slowing down the game would be spreading the path calculation over several frames. You would need to break the pathfinding loop after certain steps, remember the current state, then run other code in the game and in the next frame continue finding the path. Andre Michelle has posted very nice example of this idea here.

You can download the source fla with all the code and movie set up here.