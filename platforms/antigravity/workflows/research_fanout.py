"""Antigravity 2.0 `run_workflow` template: Wave 1 parallel scout + Wave 2 contradiction synthesis.

Invoke via Antigravity's `run_workflow` tool (passing `Args={"topic": "<research question>"}`):
  Script: 'from pathlib import Path; ns = dict(globals()); exec(Path(args["workflow_path"]).read_text("utf-8"), ns); await ns["run_research"]()'
Or import `run_research` directly when installed as an Antigravity library workflow.
"""

from __future__ import annotations

import json
from typing import Any

VECTOR_SCHEMA: dict[str, Any] = {
    "type": "object",
    "required": ["vector", "claims", "citations", "risks"],
    "properties": {
        "vector": {"type": "string"},
        "claims": {"type": "array", "items": {"type": "string"}},
        "citations": {"type": "array", "items": {"type": "string"}},
        "risks": {"type": "array", "items": {"type": "string"}},
    },
}

SYNTHESIS_SCHEMA: dict[str, Any] = {
    "type": "object",
    "required": ["consensus", "contradictions", "recommended_architecture", "handoff_brief"],
    "properties": {
        "consensus": {"type": "array", "items": {"type": "string"}},
        "contradictions": {"type": "array", "items": {"type": "string"}},
        "recommended_architecture": {"type": "string"},
        "handoff_brief": {"type": "string"},
    },
}

DEFAULT_VECTORS: tuple[dict[str, str], ...] = (
    {
        "id": "codebase_reality",
        "role": "Scout 1: Codebase Reality",
        "focus": "Map existing workspace modules, manifests, constraints, and reusable patterns with file:line citations.",
    },
    {
        "id": "primary_specs",
        "role": "Researcher 2: Primary Specs",
        "focus": "Verify official documentation, RFCs, API contracts, version compatibility, and hard platform limits.",
    },
    {
        "id": "ecosystem_tradeoffs",
        "role": "Researcher 3: Trade-offs & Perf",
        "focus": "Compare orthogonal implementation options across latency, operational complexity, security, and cost.",
    },
    {
        "id": "devils_advocate",
        "role": "Critic 4: Pre-Mortem Red Team",
        "focus": "Challenge happy-path assumptions, surface production failure modes, lock-in traps, and edge cases.",
    },
)


async def run_research() -> dict[str, Any]:
    """Execute Wave 1 multi-angle scout/research fan-out and Wave 2 contradiction synthesis."""
    runtime_args: dict[str, Any] = globals().get("args") or {}
    workspaces: tuple[str, ...] = tuple(globals().get("WORKSPACES") or ())
    root = runtime_args.get("workspace") or (workspaces[0] if workspaces else ".")
    topic = runtime_args.get("topic", "Architecture and implementation trade-offs")

    phase("Wave 1: Parallel Multi-Angle Scout & Research")
    log(f"Researching topic='{topic}' in workspace={root}")

    wave1_vectors = await parallel(
        DEFAULT_VECTORS,
        lambda vec: agent(
            prompt=(
                f"Research vector `{vec['id']}` for topic: {topic}\n"
                f"Workspace root (read-only): `{root}`.\n"
                f"Mandate: {vec['focus']} Cite concrete file paths or primary URLs for every claim."
            ),
            schema=VECTOR_SCHEMA,
            role=vec["role"],
            type_name="self",
            workspace="inherit",
            model="inherit",
        ),
    )

    phase("Wave 2: Contradiction Arbitration & Handoff Synthesis")
    arbitrated = await pipeline(
        [wave1_vectors],
        lambda evidence: agent(
            prompt=(
                f"Synthesize Wave 1 findings for `{topic}` using 4-Source Triangulation. "
                "Explicitly arbitrate any contradictions between codebase reality, primary docs, and red-team risks, "
                "then produce a concise downstream HANDOFF_BRIEF.\n\n"
                f"{json.dumps(evidence, ensure_ascii=False)}"
            ),
            schema=SYNTHESIS_SCHEMA,
            role="Principal Research Arbitrator",
            type_name="self",
            workspace="inherit",
            model="inherit",
        ),
    )
    result: dict[str, Any] = arbitrated[0]
    log(f"Research synthesis complete: {len(result['consensus'])} consensus points, {len(result['contradictions'])} arbitrated")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return result


if __name__ == "__main__" and "phase" not in globals():
    print("Antigravity run_workflow module: research_fanout.py (invoke run_research() inside run_workflow).")
