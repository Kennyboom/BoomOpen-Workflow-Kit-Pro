'use strict';

/**
 * Static HTML for the local settings Web UI. The per-launch session token is embedded so the page
 * can authenticate its own API calls; dynamic values rendered via innerHTML pass through esc().
 */

const { SETTING_DESCRIPTIONS } = require('./settings-schema.js');

const CATEGORY_SCHEMA = [
  {
    title: '1. Orchestration & Execution Mode',
    badge: '🚦 Gate & Dispatch',
    fields: [
      { key: 'execution.mode', label: 'Execution Mode (Proactive Sub-agent First vs Mode A/B)' },
      {
        key: 'execution.modeAThresholdFiles',
        label: 'Known-Target Micro-Edit File Threshold (Proactive Sub-agents above this)',
        options: [1, 2, 3, 5, 10],
      },
      { key: 'execution.swarmScaling', label: 'Sub-Agent Swarm Scaling Strategy (1 → 2–3 → 4–6 → 8+)' },
      { key: 'execution.maxParallelSubagents', label: 'Max Parallel Sub-Agents Per Wave', options: [3, 6, 8, 12, 16] },
      { key: 'workflows.defaultVariant', label: 'Default Slash Command Variant' },
      { key: 'workflows.naturalLanguageResearchTrigger', label: 'Natural-Language Research Trigger' },
    ],
  },
  {
    title: '2. Intelligence, Models & Research',
    badge: '🧠 Inherits Session Model',
    fields: [
      { key: 'models.subagentPolicy', label: 'Sub-Agent Model Policy' },
      { key: 'research.depth', label: 'Research & Brainstorm Depth' },
      { key: 'clarification.style', label: 'Socratic Clarification Style' },
      { key: 'teams.maxDebateRounds', label: 'Golden Triangle Max Debate Rounds' },
    ],
  },
  {
    title: '3. Coding Standards & Verification',
    badge: '📏 Pragmatic 2-Tier',
    fields: [
      { key: 'codingStandards.preset', label: '2-Tier Coding Standards Profile' },
      { key: 'codingStandards.softFileLines', label: 'Soft File Length Target (Lines)', type: 'number', min: 1, max: 100000 },
      { key: 'codingStandards.hardFileLines', label: 'Hard File Length Limit (Lines)', type: 'number', min: 1, max: 100000 },
      { key: 'verification.level', label: 'Verification & Testing Strictness' },
    ],
  },
  {
    title: '4. Deliverables & Localization',
    badge: '📂 Clean Git Tree',
    fields: [
      { key: 'deliverables.routing', label: 'Transient Artifact Routing' },
      { key: 'language.response', label: 'Response & Report Language' },
    ],
  },
  {
    title: '5. Multi-Engine Conductor & Parallel Council',
    badge: '🎼 Cross-Engine & Council',
    fields: [
      { key: 'engines.researcher', label: 'Researcher Engine (or Parallel Council)' },
      { key: 'engines.planner', label: 'Planner / Architect Engine (or Parallel Council)' },
      { key: 'engines.coder', label: 'Coder / Executor Engine' },
      { key: 'engines.debugger', label: 'Debugger Engine (supports cross_family Author!=Critic)' },
      { key: 'engines.reviewer', label: 'Reviewer / Critic Engine (supports cross_family & council)' },
      { key: 'engines.councilMembers', label: 'Parallel Council Participating Engines' },
    ],
  },
];

const I18N = {
  en: {
    title: '⚡ BOOMOPEN v5.5 — UNIFIED SETTINGS & CONTROL CENTER',
    scopeGlobal: '🌐 Global (~/.boomopen/settings.json)',
    scopeProject: '📁 Project (./.boomopen.json)',
    resetBtn: '🔄 Reset Defaults',
    saveBtn: '💾 Save & Sync to All 5 Platforms',
    saveProjectBtn: '💾 Save Project Overrides (./.boomopen.json)',
    unsavedNotice: '✏️ Unsaved changes — click Save to apply',
    previewTitle: '⚡ Live AOT Injected Entrypoint Block Preview',
    previewBadge: '0ms Turn-1 Overhead',
    presets: [
      { id: 'smart-hybrid', title: '⚡ Smart-Hybrid (Default v5.5)', desc: 'Mode A <= 2 known files; Proactive Sub-agent First on Turn 1 for > 2 files, unscoped exploration, or /cmd; 17-language NL workflow routing.' },
      { id: 'carbon-guardrails', title: '🛡️ Carbon-Guardrails (<3KB Antigravity Slim)', desc: 'Carbon drives, BoomOpen guards: <3KB GEMINI.md (-87% prompt tax), Mode A (≤10 files), NL trigger off, strict Pragmatic 400/500 & E2E gates + opt-in /cmd.' },
      { id: 'solo-fast', title: '🚀 Solo-Fast (Direct Mode A)', desc: 'Force Mode A Direct Execution (≤10 files), conservative swarm (max 3), :fast variant, Relaxed 600/800 lines.' },
      { id: 'deep-architect', title: '🧠 Deep-Architect (Strict Mode B)', desc: 'Force Mode B Multi-Agent Orchestrator (max 12), :hard variant, Strict 300/400 lines, council/cross_family routing.' },
      { id: 'adversarial-team', title: '🔺 Adversarial-Team (Golden Triangle)', desc: 'Force Golden Triangle :team, hyper_swarm (max 12), Strict 300/400 lines, council/cross_family review.' },
    ],
    cats: [
      ['1. Orchestration & Execution Mode', '🚦 Gate & Dispatch'],
      ['2. Intelligence, Models & Research', '🧠 Inherits Session Model'],
      ['3. Coding Standards & Verification', '📏 Pragmatic 2-Tier'],
      ['4. Deliverables & Localization', '📂 Clean Git Tree'],
      ['5. Multi-Engine Conductor & Parallel Council', '🎼 Cross-Engine & Council'],
    ],
    labels: {},
    hints: {
      ...SETTING_DESCRIPTIONS,
      'codingStandards.softFileLines': 'Soft target file length in lines before considering cohesive splitting',
      'codingStandards.hardFileLines': 'Hard maximum file length in lines enforced by boomopen check',
    },
  },
  vi: {
    title: '⚡ BOOMOPEN v5.5 — TRUNG TÂM ĐIỀU KHIỂN & CÀI ĐẶT HỢP NHẤT',
    scopeGlobal: '🌐 Toàn cục (~/.boomopen/settings.json)',
    scopeProject: '📁 Dự án (./.boomopen.json)',
    resetBtn: '🔄 Khôi phục mặc định',
    saveBtn: '💾 Lưu & Đồng bộ 5 Nền tảng',
    saveProjectBtn: '💾 Lưu Cấu hình Dự án (./.boomopen.json)',
    unsavedNotice: '✏️ Có thay đổi chưa lưu — bấm Lưu để áp dụng',
    previewTitle: '⚡ Xem trước Khối Cấu hình AOT Nạp sẵn',
    previewBadge: '0ms Độ trễ Turn-1',
    presets: [
      { id: 'smart-hybrid', title: '⚡ Smart-Hybrid (Mặc định v5.5)', desc: 'Mode A <= 2 file đã biết; Tự động gọi Sub-agent ngay Turn 1 khi > 2 file, khám phá codebase, hoặc /cmd; Định tuyến tự nhiên 17 ngôn ngữ.' },
      { id: 'carbon-guardrails', title: '🛡️ Carbon-Guardrails (Carbon Cầm Lái, BoomOpen Gác Cổng)', desc: 'Bản siêu gọn <3KB cho Antigravity (-87% token mỗi lượt): Carbon tự lái Mode A (≤10 file), tắt bắt câu tự nhiên, giữ chặt chuẩn 400/500 dòng, E2E & lệnh /cmd chủ động.' },
      { id: 'solo-fast', title: '🚀 Solo-Fast (Trực tiếp Mode A)', desc: 'Ưu tiên Mode A trực tiếp (≤10 file), conservative (tối đa 3 sub-agent), biến thể :fast, giới hạn 600/800 dòng.' },
      { id: 'deep-architect', title: '🧠 Deep-Architect (Mode B Nghiêm ngặt)', desc: 'Bắt buộc Mode B đa tác tử (tối đa 12), biến thể :hard, chuẩn 300/400 dòng, định tuyến council/cross_family.' },
      { id: 'adversarial-team', title: '🔺 Adversarial-Team (Tam Giác Vàng)', desc: 'Kích hoạt Golden Triangle :team, hyper_swarm (tối đa 12), chuẩn 300/400 dòng, phản biện council/cross_family.' },
    ],
    cats: [
      ['1. Chế độ Điều phối & Thực thi', '🚦 Cổng & Phân luồng'],
      ['2. Trí tuệ, Mô hình & Nghiên cứu', '🧠 Kế thừa Model Phiên'],
      ['3. Quy chuẩn Code & Kiểm thử', '📏 Thực dụng 2 Tầng'],
      ['4. Đầu ra & Ngôn ngữ', '📂 Sạch Git Tree'],
      ['5. Điều phối Đa Nền tảng & Hội đồng Song song', '🎼 Đa Engine & Hội đồng'],
    ],
    labels: {
      'execution.mode': 'Chế độ Thực thi (Proactive Sub-agent First vs Mode A/B)',
      'execution.modeAThresholdFiles': 'Ngưỡng Số File Mode A (Vượt ngưỡng tự gọi Sub-agent)',
      'execution.swarmScaling': 'Chiến lược Co giãn Đàn Sub-Agent (1 → 2–3 → 4–6 → 8+)',
      'execution.maxParallelSubagents': 'Số Sub-Agent Song song Tối đa Mỗi Đợt',
      'workflows.defaultVariant': 'Biến thể Lệnh Slash Mặc định',
      'workflows.naturalLanguageResearchTrigger': 'Kích hoạt Quy trình bằng Ngôn ngữ Tự nhiên',
      'models.subagentPolicy': 'Chính sách Model cho Sub-Agent',
      'research.depth': 'Độ sâu Nghiên cứu & Brainstorm',
      'clarification.style': 'Phong cách Hỏi làm rõ Socratic',
      'teams.maxDebateRounds': 'Số vòng Phản biện Tối đa (Tam Giác Vàng)',
      'codingStandards.preset': 'Hồ sơ Quy chuẩn Code 2 Tầng',
      'codingStandards.softFileLines': 'Ngưỡng Dòng Mềm mỗi File (Soft Limit)',
      'codingStandards.hardFileLines': 'Ngưỡng Dòng Cứng mỗi File (Hard Limit)',
      'verification.level': 'Mức độ Kiểm thử & Xác minh',
      'deliverables.routing': 'Định tuyến Báo cáo & Artifact Tạm thời',
      'language.response': 'Ngôn ngữ Phản hồi & Báo cáo',
      'engines.researcher': 'Engine Nghiên cứu (hoặc Hội đồng Song song)',
      'engines.planner': 'Engine Lập kế hoạch / Kiến trúc',
      'engines.coder': 'Engine Lập trình / Thực thi',
      'engines.debugger': 'Engine Gỡ lỗi (hỗ trợ cross_family khác họ model)',
      'engines.reviewer': 'Engine Phản biện / Review (hỗ trợ cross_family & council)',
      'engines.councilMembers': 'Danh sách Engine Tham gia Hội đồng Song song',
    },
    hints: {
      'execution.mode': 'auto = tự gọi sub-agent ở Turn 1 khi > N file hoặc khám phá; mode_a = trực tiếp; mode_b = đa agent; team = Tam Giác Vàng',
      'execution.modeAThresholdFiles': 'Số file đã biết tối đa cho Mode A (vượt ngưỡng sẽ phân mảnh sub-agent song song)',
      'execution.swarmScaling': 'elastic = chia 1 → 2–3 → 4–6 → 8+ sub-agent (<= 3–4 file/agent); hyper_swarm = chia nhỏ tối đa; conservative = giới hạn 2–3',
      'execution.maxParallelSubagents': 'Giới hạn trần số lượng sub-agent chạy song song trong một đợt (3, 6, 8, 12, hoặc 16)',
      'workflows.defaultVariant': 'Biến thể mặc định khi gõ lệnh /cmd không kèm hậu tố (auto, fast, hard, team, ask)',
      'workflows.naturalLanguageResearchTrigger': 'Tự động định tuyến yêu cầu ngôn ngữ tự nhiên trên cả 17 ngôn ngữ (auto_team, auto_hard, ask_first, off)',
      'models.subagentPolicy': 'quality_first = ưu tiên model chất lượng cao; strict_inherit = luôn kế thừa 100%; balanced_speed = dùng flash cho việc phụ',
      'research.depth': '5_lens_deep = 5 lăng kính + kiểm chứng đa nguồn; standard = tiêu chuẩn; quick_brief = tóm tắt nhanh',
      'clarification.style': 'autonomous_first = tự trinh sát codebase trước khi hỏi; interactive_ask = hỏi tương tác; zero_questions = tự quyết không hỏi',
      'teams.maxDebateRounds': 'Số vòng tranh biện đối kháng tối đa giữa Tech Lead, Executor và Reviewer/Critic (1, 2, hoặc 3)',
      'codingStandards.preset': 'pragmatic (400/500 dòng), strict (300/400 dòng), hoặc relaxed (600/800 dòng)',
      'codingStandards.softFileLines': 'Số dòng khuyến nghị mỗi file trước khi cân nhắc tách module theo đúng trách nhiệm',
      'codingStandards.hardFileLines': 'Số dòng tối đa tuyệt đối mỗi file được kiểm tra bởi lệnh boomopen check',
      'verification.level': 'strict_e2e = bắt buộc chạy test/build đến khi hết lỗi; fast_check = kiểm tra nhanh; manual = thủ công',
      'deliverables.routing': 'brain_artifacts = lưu vào vùng nhớ tạm UI (giữ sạch Git); workspace_reports = lưu ./reports/; both = lưu cả hai nơi',
      'language.response': 'auto = tự động khớp ngôn ngữ người dùng, hoặc chọn 1 trong 17 ngôn ngữ hỗ trợ (vi, en, zh-CN, zh-TW, ja, ko, es, fr, de, ...)',
      'engines.researcher': 'Chọn nền tảng AI thực thi pha nghiên cứu (current, auto, council, antigravity, claude, codex, cursor, copilot)',
      'engines.planner': 'Chọn nền tảng AI thực thi pha thiết kế kiến trúc & lập kế hoạch (current, auto, council, hoặc engine cụ thể)',
      'engines.coder': 'Chọn nền tảng AI thực thi pha viết code (current, auto, hoặc engine cụ thể)',
      'engines.debugger': 'Chọn nền tảng AI gỡ lỗi (cross_family tự chọn model khác họ với coder; hoặc current, auto, council)',
      'engines.reviewer': 'Chọn nền tảng AI chấm điểm & phản biện độc lập (hỗ trợ cross_family và council)',
      'engines.councilMembers': 'Tổ hợp các nền tảng chạy song song khi kích hoạt chế độ hội đồng (/conduct:council, hoặc all_installed)',
    },
  },
};

/** JSON that is safe to embed inside an inline <script>. */
const toScriptJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

/**
 * @param {string} [sessionToken] per-launch token the page must send as X-BoomOpen-Token
 * @returns {string}
 */
function renderDashboardHtml(sessionToken = '') {
  const schemaJson = toScriptJson(CATEGORY_SCHEMA);
  const i18nJson = toScriptJson(I18N);
  const tokenJson = toScriptJson(String(sessionToken));
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>⚡ BoomOpen v5.5 — Unified Settings & Control Center</title>
  <style>
    :root { --bg: #07090e; --card: rgba(15, 23, 42, 0.76); --border: rgba(148, 163, 184, 0.18); --cyan: #00f0ff; --purple: #8b5cf6; --emerald: #10b981; --text: #f8fafc; --muted: #94a3b8; }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    body { background: radial-gradient(circle at 15% 15%, rgba(0, 240, 255, 0.12), transparent 35%), radial-gradient(circle at 85% 20%, rgba(139, 92, 246, 0.12), transparent 35%), var(--bg); color: var(--text); min-height: 100vh; padding: 24px; }
    .container { max-width: 1280px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
    .glass { background: var(--card); backdrop-filter: blur(16px); border: 1px solid var(--border); border-radius: 14px; padding: 18px 22px; }
    .header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 14px; }
    .title { font-size: 1.25rem; font-weight: 800; letter-spacing: 0.4px; background: linear-gradient(90deg, var(--cyan), #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .controls { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .pill { font-size: 0.78rem; padding: 5px 10px; border-radius: 999px; border: 1px solid var(--border); background: rgba(15, 23, 42, 0.9); color: var(--muted); }
    .pill.ok { border-color: rgba(16, 185, 129, 0.5); color: var(--emerald); }
    button, select, input[type="number"] { background: rgba(15, 23, 42, 0.95); color: var(--text); border: 1px solid var(--border); padding: 8px 14px; border-radius: 8px; font-size: 0.85rem; cursor: pointer; transition: 0.15s; }
    input[type="number"] { width: 110px; cursor: text; text-align: right; }
    button:hover, select:hover, input[type="number"]:hover, input[type="number"]:focus { border-color: var(--cyan); outline: none; }
    .btn-primary { background: linear-gradient(135deg, #0284c7, #7c3aed); border: none; font-weight: 600; }
    .btn-primary:hover { filter: brightness(1.12); }
    .presets { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
    .preset-card { cursor: pointer; border: 1px solid var(--border); border-radius: 12px; padding: 14px; background: rgba(15, 23, 42, 0.6); transition: 0.18s; }
    .preset-card.active, .preset-card:hover, .preset-card:focus-visible { border-color: var(--cyan); box-shadow: 0 0 18px rgba(0, 240, 255, 0.15); outline: none; }
    .preset-card h4 { font-size: 0.95rem; margin-bottom: 6px; color: var(--cyan); }
    .preset-card p { font-size: 0.8rem; color: var(--muted); line-height: 1.4; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 480px), 1fr)); gap: 16px; }
    .cat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
    .field { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; gap: 12px; border-bottom: 1px solid rgba(148, 163, 184, 0.08); }
    .field:last-child { border-bottom: none; }
    .field label { font-size: 0.86rem; color: #e2e8f0; flex: 1; cursor: pointer; }
    .field code { display: block; font-size: 0.73rem; color: #38bdf8; margin-top: 2px; }
    .field .hint { display: block; font-size: 0.74rem; color: var(--muted); margin-top: 2px; line-height: 1.35; }
    pre { background: #05070b; border: 1px solid var(--border); border-radius: 10px; padding: 14px; font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: #38bdf8; overflow-x: auto; line-height: 1.5; }
    #toast { font-size: 0.82rem; color: var(--emerald); font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="glass header">
      <div>
        <div class="title" id="headerTitle">⚡ BOOMOPEN v5.5 — UNIFIED SETTINGS & CONTROL CENTER</div>
        <div id="platforms" style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;"></div>
      </div>
      <div class="controls">
        <span id="toast" role="status" aria-live="polite"></span>
        <button id="langBtn" type="button" aria-label="Toggle UI Language">🌐 EN | 🇻🇳 VI</button>
        <select id="scopeSelect" aria-label="Settings Scope">
          <option value="global" id="optGlobal">🌐 Global (~/.boomopen/settings.json)</option>
          <option value="project" id="optProject">📁 Project (./.boomopen.json)</option>
        </select>
        <button id="resetBtn" type="button">🔄 Reset Defaults</button>
        <button id="saveBtn" type="button" class="btn-primary">💾 Save & Sync to All 5 Platforms</button>
      </div>
    </div>
    <div class="presets" id="presetCards"></div>
    <div class="grid" id="categoriesGrid"></div>
    <div class="glass">
      <div class="cat-header"><h3 id="previewTitle">⚡ Live AOT Injected Entrypoint Block Preview</h3><span class="pill ok" id="previewBadge">0ms Turn-1 Overhead</span></div>
      <pre id="markdownPreview">Loading...</pre>
    </div>
  </div>
  <script>
    const SCHEMA = ${schemaJson};
    const I18N = ${i18nJson};
    const TOKEN = ${tokenJson};
    const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC_MAP[c]);
    let state = { settings: {}, allowedEnums: {}, codingPresets: {}, installStatus: {}, scope: 'global', lang: 'en', dirty: false };
    let reqSeq = 0;
    const getVal = (obj, k) => k.split('.').reduce((a, p) => (a ? a[p] : undefined), obj);
    const setVal = (obj, k, v) => { const p = k.split('.'); let c = obj; for (let i = 0; i < p.length - 1; i++) c = c[p[i]] = c[p[i]] || {}; c[p[p.length - 1]] = v; };
    const toast = (text) => { document.getElementById('toast').textContent = text; };
    async function api(path, body) {
      const init = { headers: { 'X-BoomOpen-Token': TOKEN } };
      if (body !== undefined) { init.method = 'POST'; init.headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(body); }
      const r = await fetch(path, init);
      const d = await r.json().catch(() => ({ ok: false, error: 'Invalid server response' }));
      if (!r.ok || !d.ok) throw new Error(d.error || ('HTTP ' + r.status));
      return d;
    }

    function syncPresetHighlight() {
      document.querySelectorAll('.preset-card').forEach((el) => {
        el.classList.toggle('active', el.dataset.preset === state.settings.preset);
      });
    }

    function renderUI(data) {
      if (data) {
        state.settings = data.settings;
        state.dirty = false;
        if (data.allowedEnums) state.allowedEnums = data.allowedEnums;
        if (data.codingPresets) state.codingPresets = data.codingPresets;
        if (data.installStatus) state.installStatus = data.installStatus;
        document.getElementById('markdownPreview').textContent = data.markdownPreview;
      }
      const dict = I18N[state.lang] || I18N.en;
      document.documentElement.lang = state.lang;
      document.getElementById('headerTitle').textContent = dict.title;
      document.getElementById('optGlobal').textContent = dict.scopeGlobal;
      document.getElementById('optProject').textContent = dict.scopeProject;
      document.getElementById('resetBtn').textContent = dict.resetBtn;
      document.getElementById('saveBtn').textContent = state.scope === 'project' ? dict.saveProjectBtn : dict.saveBtn;
      document.getElementById('previewTitle').textContent = dict.previewTitle;
      document.getElementById('previewBadge').textContent = dict.previewBadge;
      document.getElementById('langBtn').textContent = state.lang === 'vi' ? '🇻🇳 VI (Đổi sang EN)' : '🌐 EN (Switch to VI)';
      const synced = (data && data.syncReport && data.syncReport.platforms) || {};
      document.getElementById('platforms').innerHTML = Object.entries(state.installStatus).map(([k, ok]) => \`<span class="pill \${ok ? 'ok' : ''}">\${ok ? '✅' : '⬚'} \${esc(k)}\${synced[k] ? ' · synced' : ''}</span>\`).join('');
      document.getElementById('presetCards').innerHTML = dict.presets.map(p => \`
        <div class="preset-card \${state.settings.preset === p.id ? 'active' : ''}" data-preset="\${esc(p.id)}" role="button" tabindex="0" onclick="applyPresetClick('\${esc(p.id)}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();applyPresetClick('\${esc(p.id)}');}">
          <h4>\${esc(p.title)}</h4><p>\${esc(p.desc)}</p>
        </div>\`).join('');
      document.getElementById('categoriesGrid').innerHTML = SCHEMA.map((cat, idx) => {
        const [catTitle, catBadge] = (dict.cats && dict.cats[idx]) || [cat.title, cat.badge];
        return \`<div class="glass">
          <div class="cat-header"><h3>\${esc(catTitle)}</h3><span class="pill">\${esc(catBadge)}</span></div>
          \${cat.fields.map(f => {
            const id = esc('field-' + f.key);
            const cur = String(getVal(state.settings, f.key) ?? '');
            const label = (dict.labels && dict.labels[f.key]) || f.label;
            const hint = (dict.hints && dict.hints[f.key]) || '';
            if (f.type === 'number') {
              return \`<div class="field"><label for="\${id}">\${esc(label)}<code>\${esc(f.key)}</code>\${hint ? \`<span class="hint">\${esc(hint)}</span>\` : ''}</label>
                <input id="\${id}" type="number" min="\${f.min || 1}" max="\${f.max || 100000}" data-key="\${esc(f.key)}" value="\${esc(cur)}" onchange="onFieldChange(this.dataset.key, this.value)" /></div>\`;
            }
            const baseOpts = state.allowedEnums[f.key] || f.options || [];
            const opts = baseOpts.map(String).includes(cur) || !cur ? baseOpts : [cur, ...baseOpts];
            return \`<div class="field"><label for="\${id}">\${esc(label)}<code>\${esc(f.key)}</code>\${hint ? \`<span class="hint">\${esc(hint)}</span>\` : ''}</label>
              <select id="\${id}" data-key="\${esc(f.key)}" onchange="onFieldChange(this.dataset.key, this.value)">
                \${opts.map(o => \`<option value="\${esc(o)}" \${String(o) === cur ? 'selected' : ''}>\${esc(o)}</option>\`).join('')}
              </select></div>\`;
          }).join('')}
        </div>\`;
      }).join('');
    }
    function describeResult(d, verb) {
      if (d.message) return 'ℹ️ ' + d.message;
      const failed = (d.syncReport && d.syncReport.failedFiles.length) || 0;
      const where = d.scope === 'project' ? ' (workspace only)' : '';
      return (failed ? '⚠️ ' : '✅ ') + verb + where + ' (' + d.elapsedMs + 'ms)' + (failed ? ' — ' + failed + ' file(s) could not be synced' : '');
    }
    async function run(action, verb) {
      const seq = ++reqSeq;
      try { const d = await action(); if (seq !== reqSeq) return; renderUI(d); toast(describeResult(d, verb)); } catch (err) { if (seq === reqSeq) toast('❌ ' + err.message); }
    }
    async function fetchState() {
      await run(() => api('/api/settings?scope=' + encodeURIComponent(state.scope)), 'Loaded');
    }
    window.onFieldChange = (k, v) => {
      setVal(state.settings, k, /^\\d+$/.test(v) ? Number(v) : v);
      const limits = k === 'codingStandards.preset' ? state.codingPresets[v] : null;
      if (limits) {
        state.settings.codingStandards.softFileLines = limits.softFileLines;
        state.settings.codingStandards.hardFileLines = limits.hardFileLines;
        const softEl = document.getElementById('field-codingStandards.softFileLines');
        const hardEl = document.getElementById('field-codingStandards.hardFileLines');
        if (softEl) softEl.value = String(limits.softFileLines);
        if (hardEl) hardEl.value = String(limits.hardFileLines);
      }
      state.settings.preset = 'custom';
      state.dirty = true;
      syncPresetHighlight();
      toast((I18N[state.lang] || I18N.en).unsavedNotice);
    };
    window.applyPresetClick = (preset) => run(() => api('/api/preset', { preset, scope: state.scope }), 'Applied ' + preset);
    document.getElementById('langBtn').onclick = () => { state.lang = state.lang === 'en' ? 'vi' : 'en'; renderUI(); if (state.dirty) toast((I18N[state.lang] || I18N.en).unsavedNotice); };
    document.getElementById('scopeSelect').onchange = (e) => { state.scope = e.target.value; fetchState(); };
    document.getElementById('saveBtn').onclick = () => run(() => api('/api/settings', { settings: state.settings, scope: state.scope }), 'Saved');
    document.getElementById('resetBtn').onclick = () => run(() => api('/api/reset', { scope: state.scope }), 'Reset to defaults');
    fetchState();
  </script>
</body>
</html>`;
}

module.exports = { CATEGORY_SCHEMA, I18N, renderDashboardHtml };
