---
name: game-developer
description: Use when building game systems, implementing Unity 6/Unreal 5/Godot 4/WebGPU features, or optimizing game performance. Invoke for Unity, Unreal, Godot, WebGPU, R3F, Phaser/PixiJS, ECS, physics, networking, and performance optimization.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
version: "5.5.0"
triggers:
  - Unity
  - Unreal Engine
  - Godot 4
  - WebGPU
  - game development
  - ECS architecture
  - game physics
  - multiplayer networking
  - game optimization
  - shader programming
  - game AI
role: specialist
scope: implementation
output-format: code
---

# Game Developer — High-FPS Engine, ECS & WebGPU Architecture (v5.5.0)

> **PURPOSE**: Engineer deterministic, zero-GC, **60–120+ FPS** game systems across **Unity 6 (DOTS/ECS & Burst)**, **Unreal Engine 5 (C++ / GAS)**, **Godot 4.3+ (Typed GDScript / C#)**, and **WebGPU / Three.js TSL / React Three Fiber / PixiJS v8 / Phaser 3** — governed by **3-Wave Contract-First Sharding (`<= 3–4 OWNED_FILES`/shard)** and `boomopen check --strict-phase --no-stubs`.

---

## 1. 3-Wave Contract-First Game Sharding (`/cook`, `/code`, `/autopilot`)

Complex game features span simulation data, rendering/shaders, input/UI, and netcode. Never overload a single agent with `> 4` files! Decompose into **3 deterministic waves**:

1. **Wave 1 — `SHARED_CONTRACT` Data & Simulation Schema Lock**:
   - Lock ECS component structs, event buses, deterministic tick/command-buffer schemas, network state snapshots, and data-driven configs (`ScriptableObject`, Godot `Resource`, JSON/TOML balance tables).
2. **Wave 2 — Parallel Domain Shards (`<= 3–4 OWNED_FILES` per `game-engineer#<shard>`)**:
   - `game-engineer#sim`: Core gameplay loop, ECS systems, physics/collision, state machines, AI behavior trees.
   - `game-engineer#render`: Shaders (`HLSL` / `WGSL` / `TSL` / `gdshader`), instanced meshes, VFX, LODs, audio cues.
   - `game-engineer#net-or-ui`: Authoritative server rooms / client-side prediction & rollback (`Colyseus` / Netcode) or HUD/menus (paired with `DESIGN-{task}.md`).
3. **Wave 3 — Frame-Budget, Determinism & CLI Verification**:
   - Run engine/headless unit tests + `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <target_dir> --strict-phase --no-stubs` (`0` `TODO`/hollow stubs, `0` explicit `any`, `0` debug `console.log` spam in frame loops).
   - For mobile touch HUDs or hybrid mobile wrappers, also run `python ~/.{TOOL}/skills/mobile-design/scripts/mobile_audit.py <project_path>` (`>= 44pt`/`48dp` touch controls & safe-area insets).

---

## 2. Reference Guide (`references/`)

Load detailed engine guidance on demand:

| Topic | Reference | Load When |
|-------|-----------|-----------|
| **Unity 6 Development** | `references/unity-patterns.md` | Unity C#, MonoBehaviour, ScriptableObjects, DOTS/Burst |
| **Unreal Engine 5 C++** | `references/unreal-cpp.md` | Unreal C++, UPROPERTY/Gameplay Ability System, Actor components |
| **ECS & Game Patterns** | `references/ecs-patterns.md` | Entity Component System, object pooling, command/state patterns |
| **Performance & Frame Budgets** | `references/performance-optimization.md` | 60–120 FPS frame budgets (`16.6ms` / `8.3ms`), zero-GC hot loops, draw calls |
| **Multiplayer Networking** | `references/multiplayer-networking.md` | Authoritative servers, client prediction, snapshot interpolation, lag compensation |

---

## 3. 2026 Game Skill Routing (`skills_library/`)

Load the exact matched library skill for specialized 2026 engines:

| Engine / Domain | Skill Path | When to Load |
|-----------------|------------|--------------|
| **Unity 6 DOTS / ECS & Burst** | `../../skills_library/unity-6-dots-ecs-architecture/SKILL.md` (`skills_library/unity-6-dots-ecs-architecture/SKILL.md`) | Unity 6 Entities 1.x, `ISystem`, Burst Compiler, Jobs, Netcode for Entities |
| **Godot 4.3+ GDScript & Shaders** | `../../skills_library/godot-4-gdscript-shaders-2d-3d/SKILL.md` (`skills_library/godot-4-gdscript-shaders-2d-3d/SKILL.md`) | Godot 4 Node composition, static GDScript typing, Custom Resources, 2D/3D shaders |
| **WebGPU, WGSL & Three.js TSL** | `../../skills_library/webgpu-wgsl-three-tsl/SKILL.md` (`skills_library/webgpu-wgsl-three-tsl/SKILL.md`) | Native WebGPU compute/render pipelines, WGSL shaders, Three.js `WebGPURenderer` & TSL |
| **React Three Fiber & Rapier 3D** | `../../skills_library/react-three-fiber-rapier-3d/SKILL.md` (`skills_library/react-three-fiber-rapier-3d/SKILL.md`) | R3F v8/v9, `@react-three/drei`, `@react-three/rapier` physics, instanced 3D web games |
| **Multiplayer Netcode & Colyseus** | `../../skills_library/multiplayer-netcode-colyseus/SKILL.md` (`skills_library/multiplayer-netcode-colyseus/SKILL.md`) | Authoritative game servers, client-side prediction, snapshot interpolation, Colyseus rooms |
| **PixiJS v8 & Phaser 3 2D Web Games** | `../../skills_library/pixijs-v8-phaser-2d-games/SKILL.md` (`skills_library/pixijs-v8-phaser-2d-games/SKILL.md`) | High-FPS HTML5 2D games, PixiJS v8 WebGPU renderer, Phaser 3 scenes & arcade physics |

---

## 4. Non-Negotiable Frame-Loop & Engineering Guardrails

### ✅ MUST DO
- **Zero-GC Per-Frame Hot Loops**: Pre-allocate scratch vectors/matrices/arrays outside `Update` / `_process` / `useFrame` / `requestAnimationFrame` — never allocate `new Vector3()` or closures inside per-frame ticks!
- **Object Pooling & Instancing**: Pool projectiles, VFX, enemies, and audio emitters; batch static geometry and use GPU `InstancedMesh` for crowds/particles.
- **Frame-Rate Independence & Fixed Physics**: Multiply continuous motion by `deltaTime` (clamped against tab-background spikes `Math.min(dt, 0.1)`) and run physics/netcode on deterministic fixed timesteps.
- **Data-Driven Tuning**: Externalize speed, damage, cooldowns, and spawn curves into typed config structs/resources (`SCREAMING_SNAKE_CASE` fallback constants, zero magic numbers).

### ❌ MUST NOT DO
- Never call `GetComponent`, `FindObjectOfType`, `get_node`, or DOM `querySelector` inside per-frame ticks — cache references during initialization!
- Never mutate React state (`setState`) at 60Hz inside React Three Fiber `useFrame` — mutate Three.js `ref.current` transforms directly!
- Never trust client-reported positions, hit detection, or currency/inventory deltas in multiplayer games — enforce server authority!
