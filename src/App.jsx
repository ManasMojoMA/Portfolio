import { useState, useEffect, useCallback, lazy, Suspense, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import './App.css'

// Lazy load components for performance
const Background3D = lazy(() => import('./components/Background3D'))
import Navbar from './components/Navbar'
const Hero = lazy(() => import('./components/Hero'))
const About = lazy(() => import('./components/About'))
const Services = lazy(() => import('./components/Services'))
const Projects = lazy(() => import('./components/Projects'))
const Proof = lazy(() => import('./components/Proof'))
const Contact = lazy(() => import('./components/Contact'))
const Footer = lazy(() => import('./components/Footer'))

// Loading Screen Component
function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [show, setShow] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setShow(false)
            onComplete?.()
          }, 400)
          return 100
        }
        return prev + Math.random() * 15 + 5
      })
    }, 80)

    return () => clearInterval(interval)
  }, [onComplete])

  if (!show) return null

  return (
    <motion.div
      className="loading-screen"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="loading-content">
        <motion.div
          className="loading-logo"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="gradient-text">MA</span>
        </motion.div>
        <motion.div
          className="loading-bar-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="loading-bar">
            <motion.div
              className="loading-bar-fill"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <span className="loading-percentage">{Math.min(Math.round(progress), 100)}%</span>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Fallback for lazy components
function SectionFallback() {
  return <div style={{ minHeight: '100vh' }} />
}

// Continuous 3D Scroll Transition Wrapper Component
function Section3D({ children }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [6, 0, 0, -6]);
  const scale = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0.96, 1, 1, 0.96]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0.6, 1, 1, 0.6]);

  return (
    <motion.div
      ref={ref}
      style={{
        perspective: 1200,
        transformStyle: 'preserve-3d',
        rotateX,
        scale,
        opacity
      }}
    >
      {children}
    </motion.div>
  )
}

function App() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  return (
    <div className="app" onMouseMove={handleMouseMove}>
      <AnimatePresence>
        {!isLoaded && <LoadingScreen onComplete={() => setIsLoaded(true)} />}
      </AnimatePresence>

      {isLoaded && (
        <>
          {/* Noise overlay for texture */}
          <div className="noise-overlay" aria-hidden="true" />

          {/* Cursor follow glow */}
          <div
            className="cursor-glow"
            style={{ left: mousePos.x, top: mousePos.y }}
            aria-hidden="true"
          />

          {/* 3D Background */}
          <Suspense fallback={null}>
            <Background3D />
          </Suspense>

          {/* Navigation */}
          <Navbar />

          {/* Main Content with 3D Scroll Transitions */}
          <main className="main-content">
            <Suspense fallback={<SectionFallback />}>
              <Hero />
            </Suspense>

            <Suspense fallback={<SectionFallback />}>
              <Section3D>
                <About />
              </Section3D>
            </Suspense>

            <Suspense fallback={<SectionFallback />}>
              <Section3D>
                <Services />
              </Section3D>
            </Suspense>

            <Suspense fallback={<SectionFallback />}>
              <Section3D>
                <Projects />
              </Section3D>
            </Suspense>

            <Suspense fallback={<SectionFallback />}>
              <Section3D>
                <Proof />
              </Section3D>
            </Suspense>

            <Suspense fallback={<SectionFallback />}>
              <Section3D>
                <Contact />
              </Section3D>
            </Suspense>

            <Suspense fallback={<SectionFallback />}>
              <Footer />
            </Suspense>
          </main>
        </>
      )}
    </div>
  )
}

export default App
