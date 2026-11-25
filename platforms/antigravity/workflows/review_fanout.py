"""Antigravity 2.0 `run_workflow` template: 3-angle parallel adversarial code/security/perf review.

Invoke via Antigravity's `run_workflow` tool (passing `Args={"scope": "HEAD", "base_ref": "origin/main"}`):
  Script: 'from pathlib import Path; ns = dict(globals()); exec(Path(args["workflow_path"]).read_text("utf-8"), ns); await ns["run_review"]()'
Or import `run_review` directly when installed as an Antigravity library workflow.
"""

from __future__ import annotations

import json
from typing import Any

ISSUE_SCHEMA: dict[str, Any] = {
    "type": "object",
    "required": ["severity", "confidence", "angle", "location", "trace", "patch_summary"],
    "properties": {
        "severity": {"type": "string", "enum": ["P0", "P1", "P2", "P3"]},
        "confidence": {"type": "string", "enum": ["HIGH", "MEDIUM"]},
        "angle": {"type": "string"},
        "location": {"type": "string"},
        "trace": {"type": "string"},
        "patch_summary": {"type": "string"},
    },
}

ANGLE_RESULT_SCHEMA: dict[str, Any] = {
    "type": "object",
    "required": ["angle", "issues", "verified_strengths"],
    "properties": {
        "angle": {"type": "string"},
        "issues": {"type": "array", "items": ISSUE_SCHEMA},
        "verified_strengths": {"type": "array", "items": {"type": "string"}},
    },
}

VERDICT_SCHEMA: dict[str, Any] = {
    "type": "object",
    "required": ["verdict", "p0_p1_count", "issues", "review_markdown"],
    "properties": {
        "verdict": {"type": "string", "enum": ["APPROVE", "REQUEST_CHANGES", "BLOCK"]},
        "p0_p1_count": {"type": "integer"},
        "issues": {"type": "array", "items": ISSUE_SCHEMA},
        "review_markdown": {"type": "string"},
    },
}

REVIEW_ANGLES: tuple[dict[str, str], ...] = (
    {
        "id": "code_contracts",
        "role": "Critic 1: Logic & Contracts",
        "focus": "SHARED_CONTRACT/DESIGN_CONTRACT parity, null/async/race bugs, transaction safety, 0 explicit any, and 0 stubs.",
    },
    {
        "id": "security_2layer",
        "role": "Critic 2: 2-Layer Security",
        "focus": "AuthN/AuthZ/BOLA tenant scope, SQLi/SSRF/traversal/command injection sinks, and BOPLA/secret response leaks.",
    },
    {
        "id": "perf_regressions",
        "role": "Critic 3: Perf & Regressions",
        "focus": "N+1 queries, missing indexes, unbounded memory/renders, untested diff branches, and weakened assertions.",
    },
)


async def run_review() -> dict[str, Any]:
    """Run 3-angle parallel read-only review shards followed by proof-gated arbitration."""
    runtime_args: dict[str, Any] = globals().get("args") or {}
    workspaces: tuple[str, ...] = tuple(globals().get("WORKSPACES") or ())
    root = runtime_args.get("workspace") or (workspaces[0] if workspaces else ".")
    scope = runtime_args.get("scope", ".")
    base_ref = runtime_args.get("base_ref", "origin/main")

    phase("Wave 1: Parallel 3-Angle Adversarial Review")
    log(f"Reviewing workspace={root} scope={scope} base_ref={base_ref}")

    shard_reviews = await parallel(
        REVIEW_ANGLES,
        lambda angle: agent(
            prompt=(
                f"STRICT READ-ONLY REVIEW ({angle['id']}) in `{root}` for scope `{scope}` (base `{base_ref}`). "
                f"Inspect changed hunks and 1-hop callers without editing files. Focus: {angle['focus']} "
                "Report only proven issues with exact file:line, trigger trace, and minimal fix."
            ),
            schema=ANGLE_RESULT_SCHEMA,
            role=angle["role"],
            type_name="self",
            workspace="inherit",
            model="inherit",
        ),
    )

    phase("Wave 2: False-Positive Pruning & Verdict Arbitration")
    verdict = await pipeline(
        [shard_reviews],
        lambda batch: agent(
            prompt=(
                "Arbitrate these 3 adversarial review outputs. Strip speculative style nitpicks, "
                "deduplicate overlapping findings, and synthesize a proof-backed verdict.\n\n"
                f"{json.dumps(batch, ensure_ascii=False)}"
            ),
            schema=VERDICT_SCHEMA,
            role="Lead Review Arbitrator",
            type_name="self",
            workspace="inherit",
            model="inherit",
        ),
    )
    final_report: dict[str, Any] = verdict[0]
    log(f"Review verdict={final_report['verdict']} (P0/P1={final_report['p0_p1_count']})")
    print(json.dumps(final_report, indent=2, ensure_ascii=False))
    return final_report


if __name__ == "__main__" and "phase" not in globals():
    print("Antigravity run_workflow module: review_fanout.py (invoke run_review() inside run_workflow).")
