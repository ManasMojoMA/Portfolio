import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import './SiteNav.css'

// Shared navigation for the buyer-facing half of the site (/, /playbooks, and every
// playbook page). The recruiter-facing /portfolio keeps its own dark Navbar.
//
// No framer-motion here on purpose: this bar renders on every buyer page and it is
// the first thing painted. A CSS transition does the same job for none of the weight.

const links = [
  { to: '/try/recall', label: 'Free tool' },
  { to: '/playbooks', label: 'Playbooks' },
  { to: '/#how', label: 'How it works' },
  { to: '/portfolio', label: 'For recruiters' },
]

export default function SiteNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-nav">
      <div className="site-nav-inner">
        <Link to="/" className="site-brand" onClick={() => setOpen(false)}>
          Simply<span>mation</span>
        </Link>

        <nav className="site-nav-links" aria-label="Main">
          {links.map((link) =>
            link.to.includes('#') ? (
              <a key={link.to} href={link.to}>
                {link.label}
              </a>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? 'is-active' : undefined)}
              >
                {link.label}
              </NavLink>
            )
          )}
        </nav>

        <a href="/#talk" className="site-nav-cta">
          Talk to me
        </a>

        <button
          type="button"
          className={`site-nav-toggle ${open ? 'is-open' : ''}`}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>

      {open && (
        <nav className="site-nav-mobile" aria-label="Mobile">
          {links.map((link) =>
            link.to.includes('#') ? (
              <a key={link.to} href={link.to} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ) : (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            )
          )}
          <a href="/#talk" className="site-nav-mobile-cta" onClick={() => setOpen(false)}>
            Talk to me
          </a>
        </nav>
      )}
    </header>
  )
}
