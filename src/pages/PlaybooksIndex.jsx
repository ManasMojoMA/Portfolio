import { useEffect } from 'react'
import EmailCta from '../components/EmailCta';
import { Link } from 'react-router-dom'
import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'
import { playbooks, playbookRoadmap } from '../data/playbooks/registry'
import '../styles/site.css'
import './PlaybooksIndex.css'

// The industry index.
//
// Only published playbooks get a card. Industries still to be written are listed as
// plain text, not as tiles with dead links — a grid of "coming soon" boxes reads as
// vapour to exactly the buyer we want, and one dead link costs more trust than six
// tiles buy.

/** Prefilled so the first message already answers the questions I would ask. */
const CTA_BODY = "Hi Manas,\n\nMy business is:\nWhat eats the most time each week:\nWhat I'd like automated:\n\nBest time to talk:\n";

export default function PlaybooksIndex() {
  useEffect(() => {
    document.body.classList.add('site-light')
    return () => document.body.classList.remove('site-light')
  }, [])

  const published = playbooks.filter((p) => p.status === 'published')

  return (
    <div className="site playbooks-index">
      <SiteNav />

      <main>
        <section className="pbi-hero">
          <p className="site-eyebrow">Playbooks</p>
          <h1>What automation actually looks like in your trade.</h1>
          <p className="pbi-hero-sub">
            Each playbook walks through the specific work a computer should be doing in
            one kind of business — what it saves, what it costs, and where the free
            version stops. No jargon, no sales pitch, and every number is either measured
            or labelled as an assumption you can change.
          </p>
        </section>

        <section className="site-section">
          <div className="pbi-list">
            {published.map((pb) => (
              <Link key={pb.id} to={pb.href} className="pbi-card">
                <span className="pbi-icon" aria-hidden="true">
                  {pb.icon}
                </span>
                <div className="pbi-body">
                  <span className="pbi-industry">{pb.industry}</span>
                  <h2>{pb.headline}</h2>
                  <p>{pb.summary}</p>
                  <span className="pbi-cta">
                    Read the playbook <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="pbi-next">
            <h2>Being written next</h2>
            <p>
              The same patterns carry across almost unchanged — a reminder engine does not
              care whether it is chasing a wheel alignment or a dental check-up.
            </p>
            <ul>
              {playbookRoadmap.map((industry) => (
                <li key={industry}>{industry}</li>
              ))}
            </ul>
            <p className="pbi-next-note">
              Your trade not listed? It almost certainly still fits. Tell me what you do
              by hand every week and I will map it — that conversation is free whether or
              not a playbook exists yet.
            </p>
          </div>
        </section>

        <section className="site-cta" id="talk">
          <h2>One free automation. Your business. No money, no contract.</h2>
          <p>
            Tell me the single most irritating thing you or your staff do by hand every
            week. If I can automate it, I will build it free and you can watch it run for
            a month before we discuss anything else.
          </p>
          <div className="site-cta-actions">
            <EmailCta
              className="site-btn site-btn-primary"
              subject="Simplymation — free automation for my business"
              body={CTA_BODY}
            >
              Book the free 90 minutes
            </EmailCta>
            <Link className="site-btn site-btn-ghost" to="/">
              Back to the start
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
