import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { projects, testimonials } from '../data/projects'
import './Proof.css'

// Replaces the old Testimonials section.
//
// The previous version shipped invented people ("Sarah Jenkins, Product Manager").
// The target buyer is a professional skeptic: one traced-back fake quote would end
// the referral network the whole business depends on. So this section shows only
// things a visitor can independently verify, and says the gap out loud.
//
// When real testimonials arrive — named, with permission — populate `testimonials`
// in data/projects.js and they render above the evidence cards automatically.

// The demo count is derived, never written by hand — if a deployment is pulled
// from data/projects.js the sentence must stop claiming it exists.
const COUNT_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight']
const countWord = (n) => COUNT_WORDS[n] ?? String(n)

const buildEvidence = (liveCount) => [
  {
    icon: '🔗',
    title: 'Click the demos yourself',
    body: `${countWord(liveCount)} of these products ${liveCount === 1 ? 'is' : 'are'} deployed and live right now. Log in, click around, break something. Working software you can touch beats any quote from someone you cannot call.`
  },
  {
    icon: '🔍',
    title: 'Nothing is hidden',
    body: 'Every project lists its real stack and a numbered walkthrough you can follow inside the live demo. If you would rather learn it and build it yourself, the steps are right there. Most owners would rather run their business.'
  },
  {
    icon: '💸',
    title: 'The first automation is free',
    body: 'Not a trial that expires — genuinely free, because it runs on infrastructure that costs nothing at your size. You find out whether this works without spending anything.'
  },
  {
    icon: '🔐',
    title: 'Your data stays in your account',
    body: 'Everything lives in your own Google account — your customer list, your job cards, your records. Revoke access in one click and you keep all of it.'
  }
]

export default function Proof() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  const liveDemos = projects.filter((p) => p.demoCredentials?.url)
  const hasTestimonials = testimonials.length > 0

  // Drop the "click the demos" card entirely if nothing is actually deployed.
  const evidence = buildEvidence(liveDemos.length).filter(
    (item) => liveDemos.length > 0 || item.title !== 'Click the demos yourself'
  )

  return (
    <section id="proof" className="proof-section">
      <div className="proof-container" ref={ref}>
        <motion.div
          className="proof-header"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="section-label">PROOF</span>
          <h2 className="section-title">
            {hasTestimonials ? 'What clients say' : 'No client logos yet.'}
          </h2>
          <p className="section-description">
            {hasTestimonials
              ? 'Real names, real businesses, shared with permission.'
              : 'Simplymation is new, so there is no wall of company logos and no glowing quotes from people you cannot verify. Here is what you can check instead.'}
          </p>
        </motion.div>

        {hasTestimonials && (
          <motion.div
            className="proof-testimonials"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {testimonials.map((t, i) => (
              <figure className="proof-quote" key={i}>
                <blockquote>{t.quote}</blockquote>
                <figcaption>
                  <strong>{t.name}</strong>
                  <span>
                    {t.business}
                    {t.city ? ` · ${t.city}` : ''}
                  </span>
                </figcaption>
              </figure>
            ))}
          </motion.div>
        )}

        {liveDemos.length > 0 && (
          <motion.div
            className="proof-demos"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="proof-demos-label">Live right now — open them in a new tab</p>
            <div className="proof-demos-list">
              {liveDemos.map((p) => (
                <a
                  key={p.id}
                  className="proof-demo"
                  href={p.demoCredentials.url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <span className="proof-demo-icon" aria-hidden="true">
                    {p.icon}
                  </span>
                  <span className="proof-demo-text">
                    <strong>{p.title.split('—')[0].trim()}</strong>
                    <span>{p.subtitle}</span>
                  </span>
                  <span className="proof-demo-arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          className="proof-grid"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {evidence.map((item) => (
            <article className="proof-card" key={item.title}>
              <span className="proof-card-icon" aria-hidden="true">
                {item.icon}
              </span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </motion.div>

        <motion.div
          className="proof-cta"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <h3>Tell me the most irritating thing you do by hand every week.</h3>
          <p>
            If I can automate it, I will build it free and you can watch it run for a
            month before we discuss anything else.
          </p>
          <div className="proof-cta-actions">
            <a href="#contact" className="btn-primary">
              Start there
            </a>
            <a href="#projects" className="btn-secondary">
              See what I have built
            </a>
          </div>
        </motion.div>
      </div>
      <div className="section-divider" />
    </section>
  )
}
