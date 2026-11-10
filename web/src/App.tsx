import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { Layout } from './components/layout/Layout'

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })))
const CommandsPage = lazy(() => import('./pages/CommandsPage').then((m) => ({ default: m.CommandsPage })))
const AgentsTeamsPage = lazy(() => import('./pages/AgentsTeamsPage').then((m) => ({ default: m.AgentsTeamsPage })))
const SkillsPage = lazy(() => import('./pages/SkillsPage').then((m) => ({ default: m.SkillsPage })))
const ArchitecturePage = lazy(() => import('./pages/ArchitecturePage').then((m) => ({ default: m.ArchitecturePage })))
const InstallPage = lazy(() => import('./pages/InstallPage').then((m) => ({ default: m.InstallPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

/**
 * Declarative Flagship Router (1,462 indexed skills) — pairs code-split route modules
 * with `<Layout />` skeleton Suspense, AnimatePresence transitions, and legacy redirects.
 */
export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="commands" element={<CommandsPage />} />
          <Route path="agents" element={<AgentsTeamsPage />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="architecture" element={<ArchitecturePage />} />
          <Route path="install" element={<InstallPage />} />

          {/* Legacy bookmark redirects */}
          <Route path="installation" element={<Navigate to="/install" replace />} />
          <Route path="docs" element={<Navigate to="/architecture" replace />} />
          <Route path="features/commands" element={<Navigate to="/commands" replace />} />
          <Route path="features/commands-workflows" element={<Navigate to="/commands" replace />} />
          <Route path="features/specialist-agents" element={<Navigate to="/agents" replace />} />
          <Route path="features/agent-teams" element={<Navigate to="/agents" replace />} />
          <Route path="features/matrix-skills" element={<Navigate to="/skills" replace />} />
          <Route path="features" element={<Navigate to="/architecture" replace />} />
          <Route path="features/*" element={<Navigate to="/architecture" replace />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </MotionConfig>
  )
}

export default App
