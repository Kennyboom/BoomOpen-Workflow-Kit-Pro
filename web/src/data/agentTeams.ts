/**
 * Agent team roster, debate protocol and consensus paths for the Agent Teams page.
 * Keep the roster in step with agents/teams/<domain>-team/*.md (base-agent fields).
 */
export const teams = [
  { domain: 'backend', icon: '⚙️', techLead: 'tech-lead', executor: 'backend-engineer', reviewerFocus: 'security + performance', color: 'red' as const },
  { domain: 'frontend', icon: '🎨', techLead: 'tech-lead', executor: 'frontend-engineer', reviewerFocus: 'design + performance', color: 'cyan' as const },
  { domain: 'fullstack', icon: '🔗', techLead: 'tech-lead', executor: 'backend + frontend-engineer', reviewerFocus: 'security + performance', color: 'purple' as const },
  { domain: 'database', icon: '🗄️', techLead: 'tech-lead', executor: 'database-architect', reviewerFocus: 'security + performance', color: 'orange' as const },
  { domain: 'research', icon: '🔬', techLead: 'researcher', executor: 'researcher', reviewerFocus: 'critical evaluator', color: 'green' as const },
  { domain: 'planning', icon: '📋', techLead: 'planner', executor: 'researcher', reviewerFocus: 'feasibility critic', color: 'cyan' as const },
  { domain: 'brainstorm', icon: '💡', techLead: 'planner', executor: 'brainstormer', reviewerFocus: 'pre-mortem + unit economics', color: 'purple' as const },
  { domain: 'qa', icon: '🧪', techLead: 'tester', executor: 'tester', reviewerFocus: 'security + performance', color: 'green' as const },
  { domain: 'design', icon: '✏️', techLead: 'designer', executor: 'frontend-engineer', reviewerFocus: 'UX + accessibility', color: 'purple' as const },
  { domain: 'debug', icon: '🐛', techLead: 'debugger', executor: 'backend-engineer', reviewerFocus: 'root-cause validator', color: 'red' as const },
  { domain: 'devops', icon: '🚀', techLead: 'devops-engineer', executor: 'backend-engineer', reviewerFocus: 'security', color: 'orange' as const },
  { domain: 'security', icon: '🔒', techLead: 'security-engineer', executor: 'backend-engineer', reviewerFocus: 'pen-test mindset', color: 'red' as const },
  { domain: 'game', icon: '🎮', techLead: 'tech-lead', executor: 'game-engineer', reviewerFocus: 'game arch + performance', color: 'purple' as const },
  { domain: 'mobile', icon: '📱', techLead: 'tech-lead', executor: 'mobile-engineer', reviewerFocus: 'UX + platform + performance', color: 'cyan' as const },
  { domain: 'performance', icon: '⚡', techLead: 'performance-engineer', executor: 'backend-engineer', reviewerFocus: 'measurement validation', color: 'orange' as const },
  { domain: 'docs', icon: '📄', techLead: 'docs-manager', executor: 'researcher', reviewerFocus: 'accuracy + completeness', color: 'green' as const },
  { domain: 'project', icon: '📊', techLead: 'project-manager', executor: 'business-analyst', reviewerFocus: 'technical feasibility', color: 'cyan' as const },
  { domain: 'report', icon: '📈', techLead: 'reporter', executor: 'scouter', reviewerFocus: 'data accuracy + insight', color: 'purple' as const },
]

export const debateSteps = [
  { step: 1, title: 'Executor Implements', description: 'Executor delivers implementation. Reviewer receives the work.', icon: '💻', badge: 'Execute' },
  { step: 2, title: 'Reviewer Critiques', description: 'Reviewer challenges with specific, evidence-based objections.', icon: '🔍', badge: 'Challenge' },
  { step: 3, title: 'Executor Defends or Fixes', description: 'Executor DEFENDS with evidence OR acknowledges and FIXES. No performative agreement.', icon: '🛡️', badge: 'Defend / Fix' },
  { step: 4, title: 'Consensus or Escalation', description: 'Reviewer approves → PASS. If FAIL after 3 rounds → Tech Lead ARBITRATES (binding decision).', icon: '⚖️', badge: 'Resolve' },
]

export const consensusPaths = [
  { name: 'Clean Pass', icon: '✅', description: 'Reviewer approves on first review. No issues found.', color: 'from-[rgba(0,255,136,0.2)] to-[rgba(0,212,255,0.1)]', borderColor: 'border-[rgba(0,255,136,0.3)]' },
  { name: 'Resolved Pass', icon: '🔄', description: 'After defense with evidence or fix, Reviewer approves.', color: 'from-[rgba(255,136,68,0.2)] to-[rgba(136,68,255,0.1)]', borderColor: 'border-[rgba(255,136,68,0.3)]' },
  { name: 'Arbitrated Pass', icon: '⚖️', description: 'Tech Lead overrides after max 3 debate rounds. Binding decision.', color: 'from-[rgba(255,68,68,0.2)] to-[rgba(136,68,255,0.1)]', borderColor: 'border-[rgba(255,68,68,0.3)]' },
]
