import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useRouteMeta } from './hooks/useRouteMeta.js'
import './index.css'

// Every route is lazy so the two halves of the site never pay for each other.
// The buyer-facing pages (/, /playbooks, playbook pages) are light and small;
// /portfolio alone carries Three.js and framer-motion for recruiters.
const Home = lazy(() => import('./pages/Home.jsx'))
const PlaybooksIndex = lazy(() => import('./pages/PlaybooksIndex.jsx'))
const PlaybookTyreGarage = lazy(() => import('./pages/PlaybookTyreGarage.jsx'))
const Portfolio = lazy(() => import('./pages/Portfolio.jsx'))

// Must live inside BrowserRouter to read the current location.
function AppRoutes() {
  useRouteMeta()

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/playbooks" element={<PlaybooksIndex />} />
        <Route path="/playbooks/tyre-garage" element={<PlaybookTyreGarage />} />
        <Route path="/portfolio" element={<Portfolio />} />
        {/* Unknown paths land on the buyer-facing home rather than a dead end. */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Suspense>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>,
)
