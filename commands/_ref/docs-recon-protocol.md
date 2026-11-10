---
description: "📊 Intelligence Report Template + Cross-Platform Recon Steps — Referenced by docs-core.md"
version: "5.5"
type: reference
---

# Phase 1: Deep Codebase Reconnaissance — Full Protocol (`v5.5`)

## Step 1.0: PRE-FLIGHT — Mode Detection

BEFORE any scanning, check `./documents/`:

| Knowledge Area | Folder Exists | Flat File Exists | Mode |
|----------------|---------------|------------------|------|
| `knowledge-overview/` | Yes/No | Yes/No | CREATE/UPDATE/MIGRATE |
| `knowledge-architecture/` | Yes/No | Yes/No | CREATE/UPDATE/MIGRATE |
| `knowledge-domain/` | Yes/No | Yes/No | CREATE/UPDATE/MIGRATE |
| `knowledge-source-base/` | Yes/No | Yes/No | CREATE/UPDATE/MIGRATE |
| `knowledge-standards/` | Yes/No | Yes/No | CREATE/UPDATE/MIGRATE |

Mode rules:
- Folder exists with sub-files → **UPDATE** (check each sub-file for staleness)
- Flat file exists (no folder) → **MIGRATE** (convert to folder structure)
- Nothing exists → **CREATE** (generate from scratch)

## Step 1.1: Structure Scan
- List all top-level directories and files
- Recursively map directory tree (depth 3-4)
- Identify entry points: `main.*`, `index.*`, `app.*`, `server.*`, `package.json`, `Dockerfile`
- **Direct-read minimum**: `README*`, `CHANGELOG*`, `package.json`, at least ONE entry-point file per runtime surface

## Step 1.2: Tech Stack Detection
- Parse package manifests for dependencies
- Detect frameworks from imports/config
- Identify databases from connection strings, ORM config, migration files
- Detect CI/CD and containerization

## Step 1.3: Architecture Pattern Discovery
Run targeted search passes:
- Architecture: `controller|service|repository|use-case|domain|module|adapter|middleware|handler`
- API surface: `router|route|endpoint|graphql|openapi|swagger|trpc`
- Data model: `model|schema|entity|migration|prisma|typeorm|sequelize|mongoose|sql`
- Standards: `eslint|prettier|editorconfig|commitlint|husky|lint-staged|test`

## Step 1.4: Domain Intelligence
- Locate data models, API definitions, business logic
- Map entity relationships from foreign keys, references, imports

## Step 1.5: Context-Window Optimization (Large Codebases — Cross-Platform)
- Run the fast directory/manifest inventory using the native OS shell (so Windows PowerShell environments never fail if `bash` is unavailable):
  - **macOS / Linux / Git Bash**:
    ```bash
    bash ~/.{TOOL}/skills_library/docs-core/scripts/scan-project.sh [project-root]
    ```
  - **Windows PowerShell / Cross-Platform Node.js Fallback (Zero `bash` Dependency)**:
    ```powershell
    Get-ChildItem -Path . -Recurse -Depth 3 -Force | Where-Object { $_.FullName -notmatch '(\\|/)(node_modules|\.git|dist|build|\.next|target|__pycache__|coverage)(\\|/|$)' } | Select-Object FullName, Mode, Length
    ```
    *(Or portable Node.js across all OSes)*:
    ```bash
    node -e "const fs=require('fs'),p=require('path'),skip=new Set(['node_modules','.git','dist','build','.next','target','__pycache__']);(function w(d,l){if(l>3)return;for(const e of fs.readdirSync(d,{withFileTypes:true})){if(skip.has(e.name))continue;const f=p.join(d,e.name);console.log((e.isDirectory()?'[D] ':'[F] ')+f);if(e.isDirectory())w(f,l+1);}})(process.argv[1]||'.',0)" [project-root]
    ```
- Shard large repos across parallel `scouter#1..k` shards (`≤ 3–4` heavy files per shard, `TypeName: "self"`, `Model: "inherit"`) and read selectively: `config → entry points → routes → models → tests`.
- Use `grep_search` / `rg` for pattern discovery instead of reading entire generated or vendor files.

---

## Intelligence Report Template

```markdown
## Intelligence Report

### Execution Plan
| Knowledge Area | Mode | Reason |
|----------------|------|--------|
| knowledge-overview/ | CREATE/UPDATE/MIGRATE | {why} |
| knowledge-architecture/ | CREATE/UPDATE/MIGRATE | {why} |
| knowledge-domain/ | CREATE/UPDATE/MIGRATE | {why} |
| knowledge-source-base/ | CREATE/UPDATE/MIGRATE | {why} |
| knowledge-standards/ | CREATE/UPDATE/MIGRATE | {why} |

### Project Scale Assessment
| Metric | Value |
|--------|-------|
| Total files | {N} |
| Total directories | {N} |
| Primary language | {lang} |
| Complexity | Small (<100) / Medium (100-500) / Large (500+) |

### Tech Stack Map
| Layer | Technology | Version | Evidence File |
|-------|-----------|---------|---------------|
| Runtime | {e.g. Node.js} | {ver} | {package.json} |
| Framework | {e.g. Next.js} | {ver} | {package.json} |
| Database | {e.g. PostgreSQL} | {ver} | {docker-compose.yml} |

### Architecture Signals
| Signal | Evidence | Pattern |
|--------|----------|---------|
| {e.g. src/controllers/} | {path} | MVC — controller layer |

### Domain Signals
| Entity/Model | Location | Type | Relationships |
|-------------|----------|------|---------------|
| {e.g. User} | {path} | ORM Model | -> Posts, -> Orders |

### API Surface
| Method | Path | Handler | Auth |
|--------|------|---------|------|
| GET | /api/users | {file:line} | {type} |

### Evidence Ledger (BLOCKING — Phase 2 uses this)
| Claim Area | Evidence Files | Confidence |
|------------|---------------|------------|
| Architecture | {paths} | High/Medium/Low |
| Domain/Data | {paths} | High/Medium/Low |
```

## Anti-Shallow Guardrails
- NEVER generate content from script output alone — must verify with direct file reads (`read_file`)
- Each knowledge area must have at least 3 evidence files in the ledger
- If evidence is weak, explicitly state it — do NOT guess
