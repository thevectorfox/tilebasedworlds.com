+++
title = 'WebSocket Stack Comparison for Indie Game Servers'
date = 2026-04-25T15:02:33+10:00
draft = true
+++

Choosing a WebSocket server stack for an indie game is not primarily a performance decision. At the connection counts a small game reaches, every stack on this list is fast enough. A Slither-style game at peak might hold 500 concurrent players in a single room. At Node.js + Socket.io's 150KB per connection, that's 75MB — trivial on any VPS.

The differences that matter at this scale are **latency consistency** and **maintenance reliability over time**.

A game server that a solo developer touches once every three months needs to be robust by construction, not by vigilance. Rust's compile-time guarantees are worth more in this context than they would be for a full-time engineering team with monitoring and on-call rotations. The recommendations below reflect that: the numbers set a baseline, but the final call is about sustainable solo development.

---

## Connection Memory Comparison

Memory per idle WebSocket connection at steady state.
Numbers are approximate — vary by OS, library version, and buffer configuration.

| Stack | Memory / Connection | 10K Connections | 100K Connections | 1M Connections | Binary Size |
|---|---|---|---|---|---|
| **Node.js + Socket.io** | ~100–150KB | ~1.2GB | ~12GB | ~120GB | N/A (runtime) |
| **Node.js + raw `ws`** | ~60–80KB | ~700MB | ~7GB | ~70GB | N/A (runtime) |
| **Go (gorilla/websocket)** | ~30–50KB | ~400MB | ~4GB | ~40GB | ~8–12MB |
| **Rust (Tokio + Axum)** | ~10–20KB | ~150MB | ~1.5GB | ~15GB | ~5–15MB |
| **Nim (Mummy + ORC)** | ~8–15KB | ~115MB | ~1.2GB | ~12GB | ~300KB–1MB |

> Note: "Connection" here means an idle authenticated WebSocket with no
> active game state. Live game servers carry additional per-connection state
> (player position, room membership, game phase) on top of these baselines.
> For a slither-style server with 500 players, add ~2–5KB per player for
> snake segment data regardless of language.

---

## What Drives the Difference

**Node.js + Socket.io** is the heaviest because Socket.io adds its own
event emitter, reconnection state, heartbeat timers, and packet encoding
layer on top of the raw WebSocket. Each connection carries the overhead
of both the WebSocket and Socket.io's internal state machine. The V8
runtime also has a higher baseline heap cost per object than compiled
languages.

**Node.js + raw `ws`** removes the Socket.io layer but the V8 heap
allocation model still uses significantly more memory per object than
compiled languages. JavaScript's garbage collector also retains memory
between GC cycles meaning live usage is higher than theoretical minimum.

**Go** uses goroutines — lightweight green threads of ~2–8KB at creation —
rather than OS threads. The goroutine-per-connection model is extremely
memory-efficient at scale. The `net/http` WebSocket upgrade is tight.
Go's GC is a concurrent mark-and-sweep collector — non-generational by design,
tuned for low pause times; pauses are typically sub-millisecond at these workloads.

**Rust (Tokio + Axum)** uses async tasks which are smaller than goroutines
and have zero GC overhead. Memory usage is bounded and predictable — no
surprise spikes from GC pressure. The 10–20KB figure includes the Tokio
task stack, WebSocket frame buffers, and connection state. The higher
floor compared to Nim reflects Tokio's more feature-rich async runtime.

**Nim (Mummy + ORC)** achieves the lowest footprint because Mummy uses
OS threads (not async tasks) with socket I/O that is synchronous from the
handler's perspective — each connection is served by a dedicated thread — and ORC memory
management is deterministic reference counting with no GC pauses and
minimal runtime overhead. The binary is tiny because Nim compiles to C
and the resulting binary strips aggressively. The 8–15KB per connection
is genuinely impressive.

---

## Practical Scaling Thresholds

At what point does each stack require vertical scaling or architectural changes?

| Stack | Comfortable on $6/mo VPS | Needs upgrade at | Horizontal scaling required at |
|---|---|---|---|
| Node.js + Socket.io | ~500 concurrent | ~2,000 concurrent | ~5,000 concurrent |
| Node.js + raw `ws` | ~800 concurrent | ~3,000 concurrent | ~8,000 concurrent |
| Go | ~3,000 concurrent | ~15,000 concurrent | ~50,000 concurrent |
| Rust (Tokio + Axum) | ~5,000 concurrent | ~25,000 concurrent | ~100,000 concurrent |
| Nim (Mummy + ORC) | ~6,000 concurrent | ~30,000 concurrent | ~120,000 concurrent |

> "Comfortable" means memory, CPU, and latency all within acceptable bounds
> for a real-time game (sub-20ms response to player input).
> A $6/mo Hetzner VPS has 2 vCPU and 4GB RAM as a rough reference point.

Horizontal scaling for WebSocket game servers requires shared game state across instances — typically via a message broker or shared state service. The specific approaches are outside the scope of this comparison.

---

## Latency Characteristics

Memory is one axis. Latency consistency is the other that matters for games.

| Stack | Typical p50 latency | p99 latency | GC pause risk | Notes |
|---|---|---|---|---|
| Node.js + Socket.io | 1–5ms | 10–50ms | Medium | V8 GC pauses visible under load |
| Node.js + raw `ws` | 1–3ms | 8–30ms | Medium | Same GC, less overhead |
| Go | 0.5–2ms | 3–10ms | Low | GC pauses <1ms at game server scale |
| Rust (Tokio + Axum) | 0.2–1ms | 1–5ms | None | No GC — latency is flat over time |
| Nim (Mummy + ORC) | 0.2–1ms | 1–4ms | None | ORC is deterministic — no pauses |

For **turn-based games** (Grid & Glory, word games, Minesweeper) the GC pause
risk is largely irrelevant — a 20ms pause during a turn-based game is invisible.

For **real-time games** (Slither, Orbit, typing race) the p99 latency matters.
A 50ms GC pause in Node.js during a fast-paced game creates a visible hitch.
Rust and Nim's absence of GC pauses is a genuine advantage here.

---

## Stack Recommendations

### TypeScript + Socket.io
**Use for:** Prototyping, early production, developer-audience tools where
the network is trusted and connection counts stay below 1,000.

**Strengths:**
- Fastest iteration speed for a TypeScript developer
- Largest AI training data — Claude and Cursor produce correct code reliably
- Socket.io's reconnection handling, namespaces, and rooms save real
  implementation time
- Enormous ecosystem — every library you might need exists

**Weaknesses:**
- Socket.io adds ~40–60KB overhead per connection vs raw WebSocket
- V8 GC creates unpredictable latency spikes under sustained load
- Runtime must be deployed alongside code — no single binary deployment
- At 10,000+ connections, memory cost becomes a real infrastructure expense

**When to migrate away:** When a single server needs to hold more than
~2,000 concurrent connections, or when GC pauses are causing visible
game hitches in latency-sensitive games.

---

### TypeScript + raw `ws`
**Use for:** The same scenarios as Socket.io but when you want lower
per-connection overhead and do not need Socket.io's reconnection or
rooms abstraction.

Replacing Socket.io with raw WebSockets on the client side (plain `WebSocket`
API) produces noticeably faster connection establishment even with a Node.js
server. The Socket.io handshake adds 2–3 round trips before the first game
message.

---

### Go
**Use for:** Production services where you want a strong ecosystem, excellent
tooling, readable concurrency, and significantly better performance than
Node.js without Rust's complexity.

**Strengths:**
- Goroutine-per-connection model is extremely natural for game servers
- `net/http` WebSocket upgrade is clean and well-documented
- Standard library handles most needs — fewer dependencies than Node.js
- Single binary deployment
- Excellent AI training data — second only to TypeScript in reliability
  of AI-generated code
- GC pauses are minimal at game server scale

**Weaknesses:**
- Slightly higher memory floor than Rust or Nim
- Error handling is verbose (explicit `if err != nil` everywhere)
- No borrow checker — data races are possible, race detector helps

**Recommended for:** A developer who wants significantly better performance
than Node.js, is not already invested in Rust, and values fast development
over maximum performance. A strong recommendation for any new project that
is not already using Rust.

---

### Rust (Tokio + Axum)
**Use for:** Production game servers where reliability, performance, and
predictable latency are the primary requirements. Current recommendation
for tilebasedworlds.com game servers.

**Strengths:**
- Compile-time memory safety — the borrow checker prevents the entire
  class of bugs (use-after-free, data races, null dereferences) that
  cause production incidents in other languages
- No GC — latency is flat and predictable regardless of connection count
  or server uptime
- 10–20KB per connection is production-grade efficiency
- Single self-contained binary — `COPY binary /usr/local/bin/` is the
  entire Dockerfile
- AI assistance quality has improved significantly — Tokio + Axum patterns
  are well represented in training data

**Weaknesses:**
- Borrow checker requires explicit reasoning about ownership that other
  languages handle implicitly
- Shared mutable state (`Arc<RwLock<>>`) is more ceremonial than Go's
  goroutine channels or Node's single-threaded model
- Longer compilation times than Go or TypeScript
- AI assistance, while good, occasionally produces subtly wrong async
  patterns that require Rust knowledge to debug

**Settled on for:** All tilebasedworlds.com production game servers.
The reliability guarantee — code that compiles has a high probability
of being correct — is particularly valuable for a solo developer
maintaining multiple game servers across months of infrequent updates.

---

### Nim (Mummy + ORC)
**Use for:** Scenarios where the developer has strong Nim familiarity,
binary size and memory footprint are critical constraints, or complex
game logic benefits from Nim's expressive syntax.

**Strengths:**
- Smallest binary of any option (~300KB–1MB vs 5–15MB for Rust)
- Lowest per-connection memory (8–15KB)
- No GC pauses — ORC is deterministic reference counting
- Compiles to C — the resulting binary runs everywhere
- Syntax is significantly more readable than Rust for complex game logic
  (recommended for Advance Wars-style business logic, not networking)
- Mummy exposes a `ws.data` pointer on each WebSocket object for attaching arbitrary per-connection state — no external hash map required

**Weaknesses:**
- Thin AI training data — Claude and Cursor produce plausible-looking
  Nim code that has subtle threading or API errors. Requires genuine
  Nim knowledge to debug. This is the primary practical barrier for
  AI-assisted development workflows.
- Smaller ecosystem than Go, Rust, or TypeScript
- Mummy's `server.websockets` broadcast iteration does not scale as
  cleanly as Rust's `broadcast::channel` at very high connection counts
- Less production-battle-tested than the alternatives

**Recommended use pattern for tilebasedworlds.com:**
- Networking layer: Rust (reliability, AI assistance, production proven)
- Complex game logic (Advance Wars unit interactions, Stardew simulation):
  consider Nim for expressiveness, callable from Rust via FFI or as a
  separate process

**On AI training data for Nim:** The observation that AI struggles with
Nim due to thin training data is accurate and worth acknowledging as
a community problem. Publishing detailed Nim WebSocket tutorials, blog
posts, and open-source Mummy examples would directly improve AI
assistance quality for future developers. tilebasedworlds.com is well
positioned to contribute this content.

---

## Decision Flowchart

```
Starting a new game server?
│
├── Is it a prototype or early experiment?
│   ├── YES → TypeScript + Socket.io
│   │          Fast iteration, AI friendly, revisit at 1K concurrent users
│   └── NO ↓
│
├── Do you already know Rust?
│   ├── YES → Rust + Tokio + Axum
│   │          Best reliability guarantee for solo maintenance
│   └── NO ↓
│
├── Do you already know Go?
│   ├── YES → Go + gorilla/websocket
│   │          Excellent performance, strong ecosystem, fast development
│   └── NO ↓
│
├── Is the game logic complex (deep conditional trees, unit interactions)?
│   ├── YES → Consider Nim for the logic layer, Rust for the network layer
│   │          Nim's syntax earns its keep on business logic complexity
│   └── NO ↓
│
└── Are you optimising for absolute minimum infrastructure cost?
    ├── YES → Nim + Mummy (if you know Nim)
    │          Rust + Tokio (if you don't)
    └── NO  → Rust + Tokio + Axum
               Safe default for new projects
```

---

## Raw Numbers Summary

Connections supportable on common VPS tiers (estimated, game server workload):

| VPS Tier | RAM | Node+Socket.io | Node+ws | Go | Rust | Nim |
|---|---|---|---|---|---|---|
| Hetzner CX11 ($4/mo) | 2GB | ~12K | ~20K | ~40K | ~80K | ~100K |
| Hetzner CX21 ($8/mo) | 4GB | ~25K | ~40K | ~80K | ~160K | ~200K |
| Fly.io shared-cpu-1x | 256MB | ~1.5K | ~2.5K | ~5K | ~10K | ~12K |
| Fly.io performance-1x | 2GB | ~12K | ~20K | ~40K | ~80K | ~100K |

> These are idle connection counts. Active game connections with state
> (position, inventory, room membership) reduce capacity by 2–5×
> depending on game complexity. For planning purposes, divide by 3.