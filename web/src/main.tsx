import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LanguageProvider } from './i18n/context'
import { App } from './App'
import './styles/globals.css'

/** Mounts the bilingual BoomOpen Workflow Kit Pro v5.5 Flagship Application with AnimatePresence shell. */
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root mount element #root not found in index.html')
}

createRoot(rootElement).render(
  <StrictMode>
    <LanguageProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LanguageProvider>
  </StrictMode>,
)
