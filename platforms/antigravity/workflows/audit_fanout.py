"""Antigravity 2.0 `run_workflow` template: 4-lens parallel Round-1 `/audit` fan-out.

Invoke via Antigravity's `run_workflow` tool (passing `Args={"scope": ".", "docs": ""}`):
  Script: 'from pathlib import Path; ns = dict(globals()); exec(Path(args["workflow_path"]).read_text("utf-8"), ns); await ns["run_audit"]()'
Or import `run_audit` directly when installed as an Antigravity library workflow.
"""

from __future__ import annotations

import json
from typing import Any

FINDING_ITEM_SCHEMA: dict[str, Any] = {
    "type": "object",
    "required": ["severity", "dimension", "title", "primary_location", "owned_files", "proof", "remediation"],
    "properties": {
        "severity": {"type": "string", "enum": ["P0", "P1", "P2", "P3", "SPEC_GAP"]},
        "dimension": {"type": "string"},
        "title": {"type": "string"},
        "primary_location": {"type": "string"},
        "owned_files": {"type": "array", "items": {"type": "string"}},
        "proof": {"type": "string"},
        "remediation": {"type": "string"},
    },
}

LENS_RESULT_SCHEMA: dict[str, Any] = {
    "type": "object",
    "required": ["lens", "checked_files", "findings"],
    "properties": {
        "lens": {"type": "string"},
        "checked_files": {"type": "integer"},
        "findings": {"type": "array", "items": FINDING_ITEM_SCHEMA},
    },
}

SYNTHESIS_SCHEMA: dict[str, Any] = {
    "type": "object",
    "required": ["verdict", "blocking_count", "findings", "summary_markdown"],
    "properties": {
        "verdict": {"type": "string", "enum": ["CONVERGED", "AWAITING_USER_APPROVAL"]},
        "blocking_count": {"type": "integer"},
        "findings": {"type": "array", "items": FINDING_ITEM_SCHEMA},
        "summary_markdown": {"type": "string"},
    },
}

AUDIT_LENSES: tuple[dict[str, str], ...] = (
    {
        "id": "spec_rtm",
        "role": "Audit Lens 1: Spec RTM",
        "focus": "Forward and reverse Spec-to-Code RTM, omitted [SC-*] sub-clauses, and unimplemented acceptance rules.",
    },
    {
        "id": "vertical_flows",
        "role": "Audit Lens 2: Vertical Flows",
        "focus": "UI -> API -> Service -> DB continuity, unwired island modules (REC-G1), /api route mismatches (REC-G2), and empty catch blocks.",
    },
    {
        "id": "security_leakage",
        "role": "Audit Lens 3: 2-Layer Security",
        "focus": "Inbound AuthN/AuthZ/BOLA/injection guards and Outbound BOPLA/PII/secret/stacktrace leakage.",
    },
    {
        "id": "code_quality_perf",
        "role": "Audit Lens 4: Quality & Perf",
        "focus": "Pragmatic 2-Tier rules (0 explicit any, 0 hollow stubs, <=500L), N+1 loop queries, and TOCTOU race hazards.",
    },
)


async def run_audit() -> dict[str, Any]:
    """Execute 4-lens read-only parallel audit fan-out and proof-gated synthesis."""
    runtime_args: dict[str, Any] = globals().get("args") or {}
    workspaces: tuple[str, ...] = tuple(globals().get("WORKSPACES") or ())
    root = runtime_args.get("workspace") or (workspaces[0] if workspaces else ".")
    scope = runtime_args.get("scope", ".")
    docs = runtime_args.get("docs", "")

    phase("Round 1: 4-Lens Read-Only Audit Fan-Out")
    log(f"Auditing workspace={root} scope={scope}")

    lens_outputs = await parallel(
        AUDIT_LENSES,
        lambda item: agent(
            prompt=(
                f"READ-ONLY AUDIT ({item['id']}) in `{root}` (scope: `{scope}`, docs: `{docs or 'auto-discover'}`). "
                f"Do NOT modify any files. Focus: {item['focus']} "
                "Every finding MUST include exact file:line, concrete failure/exploit proof, and surgical remediation."
            ),
            schema=LENS_RESULT_SCHEMA,
            role=item["role"],
            type_name="self",
            workspace="inherit",
            model="inherit",
        ),
    )

    phase("Deduplicate & Synthesize Audit Findings")
    synthesis = await agent(
        prompt=(
            "Consolidate and deduplicate these 4 read-only audit lens JSON results. "
            "Prune any speculative warning lacking concrete file:line proof.\n\n"
            f"{json.dumps(lens_outputs, ensure_ascii=False)}"
        ),
        schema=SYNTHESIS_SCHEMA,
        role="Audit Lead Synthesizer",
        type_name="self",
        workspace="inherit",
        model="inherit",
    )
    log(f"Audit synthesis complete: verdict={synthesis['verdict']} blockers={synthesis['blocking_count']}")
    print(json.dumps(synthesis, indent=2, ensure_ascii=False))
    return synthesis


if __name__ == "__main__" and "phase" not in globals():
    print("Antigravity run_workflow module: audit_fanout.py (invoke run_audit() inside run_workflow).")
