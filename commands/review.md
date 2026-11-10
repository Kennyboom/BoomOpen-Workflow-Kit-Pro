---
description: "🔍 Review Router — SOTA 2026 Multi-Lens Adversarial Code/Security/Perf Review, Cross-Engine Critic (Author != Critic) & 1-Click Proceed to /fix"
version: "5.5"
category: validation
execution-mode: router
---

# /review — Multi-Lens Adversarial Code, Security & Performance Review Router (v5.5)

> **ROUTER DIRECTIVE**: Classify diff/audit scope, launch parallel read-only specialist critics immediately on Turn 1, and synthesize **1 proof-gated `REVIEW-{scope}.md`** with a 1-click **"Proceed"** bridge into `/fix` whenever `P0/P1` defects are uncovered.

<scope>$ARGUMENTS</scope>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH & PROOF-OVER-NITPICKS LAW

⚡ **TURN-1 ZERO-TAX DISPATCH**: Core orchestration laws and the **5-Field Handoff Packet** (`1. MISSION & ACCEPTANCE CRITERIA`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION & DELIVERABLE`) are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` — route and launch Stage 1 review shards **immediately on Turn 1** via `invoke_subagent(TypeName: "self", Model: "inherit")`.

> ⛔ **READ-ONLY CODEBASE LOCK & ACTIONABLE SEVERITY MATRIX (MANDATORY)**:
> 1. **Zero Source Mutation**: All `/review` workflows lock 100% of project source and test files in **`READ_ONLY_FILES`** — never modify code during `/review`!
> 2. **Proof-Over-Nitpicks Severity Matrix (`P0..P3`)**: Strip speculative style nitpicks! Every reported finding in `REVIEW-{scope}.md` MUST carry:
>    - Exact clickable `[file:line](file:///...)`
>    - **`Severity (P0 Critical | P1 High | P2 Medium | P3 Low)`** + inline **`[Confidence: HIGH|MEDIUM|LOW]`**
>    - Concrete **exploit / failure trace** (source-to-sink dataflow, race condition, or benchmark proof)
>    - Copy-pasteable **non-bypassable remediation patch snippet**
> 3. **Cross-Engine Adversarial Review (`Author != Critic`)**:
>    - When `engines.reviewer = "council"` (or multi-platform review is requested), run:
>      `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct council --task review --output "<appDataDir>/brain/<conversation-id>/COUNCIL-review-{scope}.md" --prompt "<scope>"`
>    - When `engines.reviewer = "cross_family"`, run:
>      `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct dispatch --role reviewer --engine cross_family --prompt "<scope>"`
> 4. **Cohesive Single-File `REVIEW-{scope}.md` & 1-Click `"Proceed"` to `/fix`**:
>    - Synthesize **1 cohesive user-facing file** at `<appDataDir>\brain\<conversation-id>\REVIEW-{scope}.md` (`<= 500` lines, zero `{name}/` folder splits!).
>    - Set `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` when `P0/P1` issues exist so clicking Antigravity 2.0's **"Proceed"** button fast-forwards straight into `/fix` (`RequestFeedback: false` when `0` `P0/P1` issues exist).
>    - Set `UserFacing: false, RequestFeedback: false` on all internal shard/council/mailbox files (`REVIEW-{scope}-s{k}.md`, `COUNCIL-review-{scope}.md`, `MAILBOX-{date}.md`).

---

## 🌐 Multilingual Natural-Language Auto-Triggers (17 Supported Languages)

When the user asks to review code, audit a PR/diff, or inspect security/performance in natural language without typing `/review`, automatically trigger this router:

| Language | Natural-Language Trigger Phrases |
|----------|----------------------------------|
| **`en` (English)** | *"review code"*, *"code review"*, *"review this PR/diff"*, *"audit code quality"*, *"check security & performance"* |
| **`vi` (Tiếng Việt)** | *"review code"*, *"kiểm tra code"*, *"đánh giá chất lượng code"*, *"soát lỗi PR"*, *"audit bảo mật & hiệu năng"* |
| **`zh-CN` / `zh-TW`** | *"代码审查"*, *"审查PR"*, *"检查代码质量"*, *"安全与性能审计"* / *"程式碼審查"*, *"檢查程式碼品質"* |
| **`ja` (日本語)** | *"コードレビューして"*, *"PRをレビュー"*, *"コード品質をチェック"*, *"セキュリティ監査"* |
| **`ko` (한국어)** | *"코드 리뷰해줘"*, *"PR 검토"*, *"코드 품질 검사"*, *"보안 및 성능 감사"* |
| **`es` / `pt-BR`** | *"revisar código"*, *"revisión de PR"*, *"auditar calidad de código"* / *"revisar código"*, *"revisão de PR"* |
| **`fr` / `de` / `it`** | *"revue de code"*, *"vérifier le code"* / *"Code-Review durchführen"*, *"Code prüfen"* / *"revisionare il codice"* |
| **`ru` / `tr`** | *"провести код-ревью"*, *"проверить код"* / *"kod incelemesi yap"*, *"kodu denetle"* |
| **`hi` / `ar`** | *"कोड रिव्यू करें"*, *"कोड की जांच करें"* / *"مراجعة الكود"*, *"فحص جودة الكود"* |
| **`id` / `th`** | *"tinjau kode"*, *"review PR ini"* / *"รีวิวโค้ด"*, *"ตรวจสอบคุณภาพโค้ด"* |

---

## 🧭 ROUTING LOGIC

```text
1. IF user explicitly specifies a variant:
   - `/review:fast` → Load `commands/review-fast.md`
   - `/review:hard` → Load `commands/review-hard.md`
   - `/review:team` → Load `commands/review-team.md`

2. IF scope is small (`<= 2` files):
   → Route to `/review:fast` (`commands/review-fast.md`)

3. IF scope is moderate (`3–8` files, multi-module diff):
   → Route to `/review:hard` (`commands/review-hard.md` — Parallel Multi-Lens Critics)

4. IF scope is large (`> 8` files), security/auth/payment-critical, OR `execution.mode = "team"` / `workflows.defaultVariant = "team"`:
   → Route to `/review:team` (`commands/review-team.md` — 2-Stage Elastic Golden Diamond + Cross-Engine Adversarial Review)

5. IF `workflows.defaultVariant = "ask"`:
   → Call `ask_question` UI tool with `(Recommended) /review:team` (or `/review:hard`) first
```

---

## 📋 AVAILABLE ROUTES

| Route | Workflow File | Architecture & Best Use Case |
|-------|---------------|------------------------------|
| **`/review:fast`** | `commands/review-fast.md` | **Focused PR/Diff Audit (`<= 2` Files)**: `boomopen check --strict-phase --no-stubs` + Pragmatic 2-Tier & OWASP check → `REVIEW-{scope}.md` |
| **`/review:hard`** | `commands/review-hard.md` | **Turn-1 Parallel Multi-Lens Review (`3–8` Files)**: Concurrent `reviewer#arch-1..k` + `security-engineer#owasp` + `performance-engineer#hotpaths` + CLI scanners → cohesive `REVIEW-{scope}.md` |
| **`/review:team`** | `commands/review-team.md` | **2-Stage Elastic Golden Diamond & Cross-Engine Review (`> 8` Files / Critical)**: Parallel multi-lens shards + `COUNCIL-review-{scope}.md` → warm `send_message` false-positive elimination → `REVIEW-{scope}.md` |
