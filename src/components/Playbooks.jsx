import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useInView } from 'react-intersection-observer'
import { playbooks, playbookRoadmap } from '../data/projects'
import './Playbooks.css'

// The bridge between the two audiences. A business owner lands here and leaves
// for their industry playbook; a recruiter reads it as evidence of productised
// thinking rather than one-off freelance work.
export default function Playbooks() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  const published = playbooks.filter((p) => p.status === 'published')

  return (
    <section id="playbooks" className="playbooks-section">
      <div className="playbooks-container" ref={ref}>
        <motion.div
          className="playbooks-header"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="section-label">FOR BUSINESS OWNERS</span>
          <h2 className="section-title">Find your business. See what changes.</h2>
          <p className="section-description">
            Not a sales pitch — a walkthrough of the specific work a computer should be
            doing in your industry, what it saves, and what it costs. Written for people
            who have never bought software before.
          </p>
        </motion.div>

        <motion.div
          className="playbooks-grid"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {published.map((pb) => (
            <Link key={pb.id} to={pb.href} className="playbook-card">
              <span className="playbook-icon" aria-hidden="true">
                {pb.icon}
              </span>
              <span className="playbook-industry">{pb.industry}</span>
              <h3 className="playbook-headline">{pb.headline}</h3>
              <p className="playbook-summary">{pb.summary}</p>
              <span className="playbook-cta">
                Read the playbook <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}

          <div className="playbook-card playbook-card-next">
            <span className="playbook-icon" aria-hidden="true">
              ✎
            </span>
            <span className="playbook-industry">Being written next</span>
            <h3 className="playbook-headline">The same six automations transfer almost unchanged.</h3>
            <ul className="playbook-roadmap">
              {playbookRoadmap.map((industry) => (
                <li key={industry}>{industry}</li>
              ))}
            </ul>
            <p className="playbook-note">
              A reminder engine does not care whether it is chasing a wheel alignment or a
              dental check-up. If your business runs on repeat visits, the pattern already
              fits — ask and I will map it to your trade.
            </p>
          </div>
        </motion.div>
      </div>
      <div className="section-divider" />
    </section>
  )
}
