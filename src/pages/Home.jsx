import { useEffect } from 'react'
import EmailCta from '../components/EmailCta';
import { Link } from 'react-router-dom'
import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'
import { hero, symptoms, whatIDo, howItWorks, straightAnswers } from '../data/home'
import { playbooks } from '../data/playbooks/registry'
import '../styles/site.css'
import './Home.css'

// The buyer-facing landing page.
//
// No Three.js, no framer-motion, no loading screen. Someone arriving from a WhatsApp
// link on a mid-range phone should see the headline immediately — the previous
// version of this page spent its first two seconds on a fake progress bar.

/** Prefilled so the first message already answers the questions I would ask. */
const CTA_BODY = "Hi Manas,\n\nMy business is:\nWhat eats the most time each week:\nWhat I'd like automated:\n\nBest time to talk:\n";

export default function Home() {
  useEffect(() => {
    document.body.classList.add('site-light')
    return () => document.body.classList.remove('site-light')
  }, [])

  const published = playbooks.filter((p) => p.status === 'published')

  return (
    <div className="site home">
      <SiteNav />

      <main>
        {/* ---------- Hero ---------- */}
        <section className="home-hero">
          <p className="site-eyebrow">{hero.eyebrow}</p>
          <h1>{hero.headline}</h1>
          <p className="home-hero-sub">{hero.subhead}</p>
          <div className="home-hero-actions">
            <Link to={hero.primaryCta.href} className="site-btn site-btn-primary">
              {hero.primaryCta.label}
            </Link>
            {hero.secondaryCta.href.startsWith('#') ? (
              <a href={hero.secondaryCta.href} className="site-btn site-btn-ghost">
                {hero.secondaryCta.label}
              </a>
            ) : (
              <Link to={hero.secondaryCta.href} className="site-btn site-btn-ghost">
                {hero.secondaryCta.label}
              </Link>
            )}
          </div>
          <p className="home-hero-note">{hero.note}</p>
        </section>

        {/* ---------- Recognition ---------- */}
        <section className="site-section site-section-tint">
          <h2>Does any of this sound like your business?</h2>
          <p className="site-lede">
            If none of it does, close this page — you do not need me. If two or more do,
            the rest is worth five minutes.
          </p>
          <div className="home-symptoms">
            {symptoms.map((s) => (
              <article className="site-card" key={s.title}>
                <span className="home-symptom-icon" aria-hidden="true">
                  {s.icon}
                </span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- Playbooks ---------- */}
        <section className="site-section" id="playbooks">
          <h2>Find your business. See exactly what changes.</h2>
          <p className="site-lede">
            Not a brochure — a walkthrough of the specific work a computer should be
            doing in your trade, what it saves, and what it costs. Written for people who
            have never bought software before.
          </p>

          <div className="home-playbooks">
            {published.map((pb) => (
              <Link key={pb.id} to={pb.href} className="home-playbook">
                <span className="home-playbook-icon" aria-hidden="true">
                  {pb.icon}
                </span>
                <span className="home-playbook-industry">{pb.industry}</span>
                <h3>{pb.headline}</h3>
                <p>{pb.summary}</p>
                <span className="home-playbook-cta">
                  Read the playbook <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}

            <div className="home-playbook home-playbook-more">
              <h3>Not a garage?</h3>
              <p>
                A reminder engine does not care whether it is chasing a wheel alignment or
                a dental check-up. If your business runs on repeat customers, the same six
                automations already fit — ask and I will map them to your trade.
              </p>
              <Link to="/playbooks" className="site-btn site-btn-ghost">
                See all playbooks
              </Link>
            </div>
          </div>
        </section>

        {/* ---------- What I do ---------- */}
        <section className="site-section site-section-tint">
          <h2>What I actually do</h2>
          <p className="site-lede">
            No jargon, because none of it is necessary to explain the job.
          </p>
          <div className="home-grid-2">
            {whatIDo.map((item) => (
              <article className="site-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- How it works ---------- */}
        <section className="site-section" id="how">
          <h2>How it works</h2>
          <p className="site-lede">
            No contract, no advance, no training programme. Your business does not stop
            for a single hour.
          </p>
          <ol className="home-steps">
            {howItWorks.map((s) => (
              <li key={s.step}>
                <span className="home-step-number">{s.step}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- Straight answers ---------- */}
        <section className="site-section site-section-tint" id="answers">
          <h2>Straight answers, before you ask</h2>
          <p className="site-lede">
            The questions every owner asks in the first ten minutes. Including the one
            most people would rather not put in writing.
          </p>
          <div className="home-answers">
            {straightAnswers.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ---------- CTA ---------- */}
        <section className="site-cta" id="talk">
          <h2>Tell me the most irritating thing you do by hand every week.</h2>
          <p>
            If I can automate it, I will build it free and you can watch it run for a
            month before we discuss anything else.
          </p>
          <div className="site-cta-actions">
            <EmailCta
              className="site-btn site-btn-primary"
              subject="Simplymation — free automation for my business"
              body={CTA_BODY}
            >
              Book the free 90 minutes
            </EmailCta>
            <Link className="site-btn site-btn-ghost" to="/playbooks">
              Read a playbook first
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
