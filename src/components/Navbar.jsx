import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './Navbar.css'

// Five items, ordered so a business owner hits "For Your Business" before the
// engineering work, and a recruiter still reaches "Work" in one click.
// About is reachable by scrolling; keeping it out of the bar keeps mobile short.
const navLinks = [
  { name: 'Home', id: 'home' },
  { name: 'Services', id: 'services' },
  { name: 'For Your Business', id: 'playbooks' },
  { name: 'Work', id: 'projects' },
  { name: 'Contact', id: 'contact' }
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const scrollToSection = (id) => {
    setIsOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Animation variants
  const menuVariants = {
    closed: { opacity: 0, y: '-100%' },
    open: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: 'spring', 
        stiffness: 100, 
        damping: 20, 
        staggerChildren: 0.1, 
        delayChildren: 0.1 
      } 
    }
  }

  const linkVariants = {
    closed: { opacity: 0, y: 20 },
    open: { opacity: 1, y: 0 }
  }

  return (
    <>
      <motion.nav 
        className={`navbar ${isScrolled ? 'scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="navbar-container">
          {/* Logo */}
          <div className="navbar-logo" onClick={() => scrollToSection('home')}>
            <span className="logo-m">M</span>
            <span className="logo-a">A</span>
          </div>

          {/* Desktop Links */}
          <div className="navbar-links-desktop">
            {navLinks.map((link) => (
              <button 
                key={link.name} 
                className="nav-link"
                onClick={() => scrollToSection(link.id)}
              >
                {link.name}
                <span className="nav-link-indicator"></span>
              </button>
            ))}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button 
            className={`navbar-toggle ${isOpen ? 'open' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            <span className="hamburger-line top"></span>
            <span className="hamburger-line middle"></span>
            <span className="hamburger-line bottom"></span>
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="mobile-menu-overlay"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="mobile-menu-container">
              {navLinks.map((link) => (
                <motion.button
                  key={link.name}
                  className="mobile-nav-link"
                  variants={linkVariants}
                  onClick={() => scrollToSection(link.id)}
                >
                  {link.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
