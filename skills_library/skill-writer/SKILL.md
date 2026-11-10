---
name: skill-writer
description: Create and improve agent skills following the Agent Skills specification. Use when asked to create, write, or update skills.
risk: unknown
source: community
---

# Skill Writer

Use this as the single canonical workflow for skill creation and improvement.
Primary success condition: maximize high-value input coverage before authoring so the resulting skill has minimal blind spots.

## Step 1: Resolve target and path

1. Resolve target skill path and intended operation (`create`, `update`, `synthesize`, `iterate`).
2. Classify the skill (`workflow-process`, `integration-documentation`, `security-review`, `skill-authoring`, `generic`).
3. Ask one direct question if class or depth requirements are ambiguous; otherwise state explicit assumptions.

## Step 2: Run synthesis when needed

1. Collect and score relevant sources with provenance.
2. Apply trust and safety rules when ingesting external content.
3. Produce source-backed decisions and coverage/gap status.
4. Enforce baseline source pack for skill-authoring workflows.
5. Enforce depth gates before moving to authoring.

## Step 3: Run iteration first when improving from outcomes/examples

1. Capture and anonymize examples with provenance.
2. Re-evaluate skill behavior against working and holdout slices.
3. Propose improvements from positive/negative/fix evidence.
4. Carry concrete behavior deltas into authoring.

Skip this step when selected path does not include `iteration`.

## Step 4: Author or update skill artifacts

1. Write or update `SKILL.md` in imperative voice with trigger-rich description.
2. Create focused reference files and scripts only when justified.
3. Keep structure and output deterministic: consistent section order, explicit workflow steps and a fixed output template.
4. For authoring/generator skills, include transformed examples in references:
   - happy-path
   - secure/robust variant
   - anti-pattern + corrected version

## Step 5: Optimize description quality

1. Validate should-trigger and should-not-trigger query sets.
2. Reduce false positives and false negatives with targeted description edits.
3. Keep trigger language generic across Codex and Claude.

## Step 6: Evaluate outcomes

1. Run a lightweight qualitative check by default (recommended).
2. For integration/documentation and skill-authoring skills, include a concise depth rubric (coverage of inputs, edge cases and failure modes).
3. Run deeper eval playbook and quantitative baseline-vs-with-skill only when requested or risk warrants it.
4. Record outcomes and unresolved risks.

## Step 7: Register and validate

1. Apply repository registration steps.
2. Run quick validation with strict depth gates.
3. Reject shallow outputs that fail depth gates or required artifact checks.

## Output format

Return:

1. `Summary`
2. `Changes Made`
3. `Validation Results`
4. `Open Gaps`

## When to Use
Use this skill when tackling tasks related to its primary domain or functionality as described above.
