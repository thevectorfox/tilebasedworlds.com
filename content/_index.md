+++
title = 'Tile Based Worlds'
date = 2026-03-08T19:54:58+11:00
draft = false
+++

{{< hero
  eyebrow="Tile Based Worlds"
  title="The systems behind tile worlds —"
  title_em="explained by building them."
  body="A structured tutorial series for developers who want to understand 2D game rendering properly — not just copy it. Each world builds on the last, taking you from a grid and a character through pathfinding, procedural generation, lighting, and physics. Live, editable demos throughout."
  cta_primary="Start with World One"
  cta_primary_url="/tutorial/world-one/"
  cta_secondary="Browse all worlds"
  cta_secondary_url="/tutorial/"
>}}

{{< lineage-block >}}
Inspired by the Tonypa tile-based game tutorials — the most influential game dev writing on the early web — and rebuilt from scratch for modern JavaScript and PixiJS. The same depth, none of the Flash.
{{< /lineage-block >}}

{{< learn-grid label="What you'll actually learn" >}}
  {{< learn-item title="Rendering fundamentals" >}}Grid systems, camera, layers, depth sorting, isometric projection.{{< /learn-item >}}
  {{< learn-item title="Movement and physics" >}}Collision, gravity, slopes, platforms, and character controllers.{{< /learn-item >}}
  {{< learn-item title="Pathfinding algorithms" >}}BFS, Dijkstra, A*, Flow Fields, JPS — with animated step-throughs.{{< /learn-item >}}
  {{< learn-item title="Procedural generation" >}}BSP, cellular automata, noise functions, biome generation.{{< /learn-item >}}
{{< /learn-grid >}}

{{< worlds-grid label="The worlds" >}}

  {{< world-card num="World 01" name="World One" status="available" tags="rendering|collision" url="/tutorial/world-one/" >}}Grid, movement, collision, interaction, and enemies. The foundation everything else builds on.{{< /world-card >}}

  {{< world-card num="World 02" name="A Side-Scrolling World" status="available" tags="physics|platforms" url="/tutorial/a-side-scrolling-world/" >}}Gravity, jumping, ladders, moving platforms, slopes, and combat.{{< /world-card >}}

  {{< world-card num="World 03" name="A Tilted World" status="available" tags="isometric" url="/tutorial/a-tilted-world/" >}}Isometric rendering, depth sorting, mouse movement, and camera rotation.{{< /world-card >}}

  {{< world-card num="World 04" name="A Thinking World" status="available" tags="algorithms" url="/tutorial/a-thinking-world/" >}}Pathfinding foundations — BFS, Dijkstra's, Greedy Best-First, and A* with visual step-throughs.{{< /world-card >}}

  {{< world-card num="World 05" name="A Smarter World" status="soon" tags="algorithms" >}}Advanced pathfinding — Flow Fields, JPS, Bidirectional A*, D* Lite, HPA*.{{< /world-card >}}

  {{< world-card num="World 06" name="A Random World" status="soon" tags="procgen" >}}Procedural generation — room placement, BSP, cellular automata, noise, biomes.{{< /world-card >}}

  {{< world-card num="World 07" name="A Darker World" status="soon" tags="lighting" >}}Lighting — raycasting, FOV, shadow casting, fog of war, day/night cycles.{{< /world-card >}}

  {{< world-card num="World 08" name="A Living World" status="soon" tags="simulation" >}}Physics simulation — gravity, water flow, falling sand, destructible tiles.{{< /world-card >}}

{{< /worlds-grid >}}
