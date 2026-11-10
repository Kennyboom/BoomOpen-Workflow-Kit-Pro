/**
 * Legend and concept cards for the workflow architecture page.
 */
import { AGENT_COUNT, DOMAIN_COUNT, SKILL_COUNT, formatCount } from './kitStats'
import type { WorkflowNodeType } from './workflowArchitecture'

// Node type descriptions for legend
export const nodeTypeLegend: { type: WorkflowNodeType; label: string; color: string; description: string }[] = [
  {
    type: 'entry',
    label: 'Entry Point',
    color: '#00d4ff',
    description: 'User input via natural language or slash commands',
  },
  {
    type: 'core',
    label: 'Orchestrator',
    color: '#ff4444',
    description: 'Core coordination components that delegate work',
  },
  {
    type: 'rule',
    label: 'Rule Engine',
    color: '#ff8844',
    description: 'Governance protocols enforcing orchestration laws',
  },
  {
    type: 'tier',
    label: 'Execution Tier',
    color: '#00ff88',
    description: 'TIER 1 (sub-agent) or TIER 2 (embody) execution',
  },
  {
    type: 'agent',
    label: 'Specialist Agent',
    color: '#ff8844',
    description: `${AGENT_COUNT} domain experts (backend, frontend, tester, etc.)`,
  },
  {
    type: 'skill',
    label: 'Matrix Skills',
    color: '#8844ff',
    description: `${formatCount(SKILL_COUNT)} skills across ${DOMAIN_COUNT} domains injected at runtime`,
  },
  {
    type: 'phase',
    label: 'Phase Loop',
    color: '#ffcc00',
    description: 'Workflow continues to next phase until completion',
  },
  {
    type: 'output',
    label: 'Deliverables',
    color: '#00ff88',
    description: 'Final output: code, plans, tests, documentation',
  },
]

// Key architectural concepts
export const architectureConcepts = [
  {
    title: 'Orchestrator Pattern',
    description: 'Central brain that coordinates all work. Never implements directly—only delegates, verifies, and synthesizes.',
    icon: '🧠',
  },
  {
    title: 'Tiered Execution',
    description: 'TIER 1 (sub-agent with isolated context) is mandatory when available. TIER 2 (embody with shared context) is fallback only.',
    icon: '⚡',
  },
  {
    title: 'Phase-Based Workflows',
    description: 'All commands execute as sequential phases: Research → Scout → Plan → Implement → Test → Review.',
    icon: '📋',
  },
  {
    title: 'Matrix Skill Discovery',
    description: `Instead of hardcoded skills, agents declare profiles. System resolves and injects ${formatCount(SKILL_COUNT)} skills at runtime.`,
    icon: '🎯',
  },
]
