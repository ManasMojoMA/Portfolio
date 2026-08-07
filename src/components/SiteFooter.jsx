import { Link } from 'react-router-dom'
import './SiteFooter.css'

// The recruiter escape hatch lives here rather than in the main nav: a business
// owner should never wonder whether they are on the right site, and a recruiter
// will happily scroll.
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <p className="site-footer-brand">
            Simply<span>mation</span>
          </p>
          <p>AI and automation for small businesses that were told it was not for them.</p>
        </div>

        <nav aria-label="Footer">
          <Link to="/playbooks">Playbooks</Link>
          <a href="/#how">How it works</a>
          <a href="mailto:aroramanasm07@gmail.com">Email</a>
        </nav>
      </div>

      <p className="site-footer-alt">
        Hiring rather than buying? <Link to="/portfolio">The engineering portfolio is here.</Link>
      </p>
    </footer>
  )
}
