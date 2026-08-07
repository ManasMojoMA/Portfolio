import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useRouteMeta } from './hooks/useRouteMeta.js'
import './index.css'

// Both halves of the site are lazy so neither pays for the other. The
// recruiter-facing portfolio carries Three.js and framer-motion; the
// buyer-facing playbooks must stay small enough to open instantly on a
// mid-range phone over mobile data.
const App = lazy(() => import('./App.jsx'))
const PlaybookTyreGarage = lazy(() => import('./pages/PlaybookTyreGarage.jsx'))

// Must live inside BrowserRouter to read the current location.
function AppRoutes() {
  useRouteMeta()

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/playbooks/tyre-garage" element={<PlaybookTyreGarage />} />
        <Route path="*" element={<App />} />
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
