import { useState, useMemo, useEffect } from 'react';
import EmailCta from '../components/EmailCta';
import { Link } from 'react-router-dom';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import {
  meta,
  leaks,
  automations,
  roiModel,
  calculateRecovery,
  costs,
  rollout,
  trust,
  theTrick,
} from '../data/playbooks/tyreGarage';
import '../styles/site.css';
import './PlaybookTyreGarage.css';

// Deliberately no framer-motion and no 3D on this route.
// The buyer opens this on a cheap phone, often standing in the sun.
// Speed and legibility beat spectacle here.

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const formatINR = (n) => inr.format(n);

function Calculator() {
  const [values, setValues] = useState(() =>
    Object.fromEntries(roiModel.inputs.map((i) => [i.key, i.default]))
  );

  const result = useMemo(() => calculateRecovery(values), [values]);
  const totalHours = roiModel.timeSaved.reduce((sum, t) => sum + t.hours, 0);

  const update = (key, value) =>
    setValues((prev) => ({ ...prev, [key]: Number(value) }));

  return (
    <div className="pb-calc">
      <div className="pb-calc-inputs">
        {roiModel.inputs.map((input) => (
          <label key={input.key} className="pb-calc-field">
            <span className="pb-calc-label">{input.label}</span>
            <span className="pb-calc-value">
              {input.unit === '₹'
                ? formatINR(values[input.key])
                : `${values[input.key]}${input.unit}`}
            </span>
            <input
              type="range"
              min={input.min}
              max={input.max}
              step={input.step}
              value={values[input.key]}
              onChange={(e) => update(input.key, e.target.value)}
              aria-label={input.label}
            />
          </label>
        ))}
      </div>

      <div className="pb-calc-output">
        <p className="pb-calc-output-label">
          Revenue you are likely leaving on the table each year
        </p>
        <p className="pb-calc-total">{formatINR(result.total)}</p>

        <ul className="pb-calc-breakdown">
          <li>
            <span>Alignment &amp; balancing brought back</span>
            <strong>{formatINR(result.serviceRecovery)}</strong>
          </li>
          <li>
            <span>Tyre replacements brought back</span>
            <strong>{formatINR(result.tyreRecovery)}</strong>
          </li>
          <li>
            <span>Customers still reachable after a year</span>
            <strong>{result.reachableBase.toLocaleString('en-IN')}</strong>
          </li>
        </ul>

        <div className="pb-calc-time">
          <strong>{totalHours} hours a month</strong> of your staff&apos;s time comes back too:
          <ul>
            {roiModel.timeSaved.map((t) => (
              <li key={t.task}>
                {t.task} <em>~{t.hours} hrs</em>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <details className="pb-assumptions">
        <summary>
          Every assumption behind this number — check them, they are deliberately pessimistic
        </summary>
        <ul>
          {roiModel.assumptions.map((a) => (
            <li key={a.label}>
              <span>{a.label}</span>
              <strong>{a.value}</strong>
            </li>
          ))}
        </ul>
        <p className="pb-assumptions-note">
          These are estimates, not promises. Nobody can tell you your real numbers until your
          own job cards are in the system — which is exactly what the free plan does. If the
          real figure comes out lower, you will have paid nothing to find out.
        </p>
      </details>
    </div>
  );
}

/** Prefilled so the first message already answers the questions I would ask. */
const CTA_BODY = "Hi Manas,\n\nMy business is:\nWhat eats the most time each week:\nWhat I'd like automated:\n\nBest time to talk:\n";

export default function PlaybookTyreGarage() {
  const heroAutomation = automations.find((a) => a.hero);
  const restAutomations = automations.filter((a) => !a.hero);

  // The global stylesheet paints body dark for the portfolio. This route is
  // light, so flip it while mounted or the dark shows through on overscroll.
  useEffect(() => {
    document.body.classList.add('site-light');
    return () => document.body.classList.remove('site-light');
  }, []);

  return (
    <div className="site pb">
      <SiteNav />

      <main>
        {/* ---------- Hero ---------- */}
        <section className="pb-hero">
          <p className="pb-eyebrow">
            Playbook · {meta.industry} · {meta.readTime}
          </p>
          <h1>{meta.headline}</h1>
          <p className="pb-lede">{meta.subhead}</p>
          <div className="pb-hero-actions">
            <a href="#calculator" className="pb-btn pb-btn-primary">
              Show me the number
            </a>
            <a href="#how" className="pb-btn pb-btn-ghost">
              What gets automated
            </a>
          </div>
          <p className="pb-hero-note">{meta.region}</p>
        </section>

        {/* ---------- The leaks ---------- */}
        <section className="pb-section pb-section-tint">
          <h2>Does any of this sound like your shop?</h2>
          <p className="pb-section-lede">
            If none of it does, close this page — you do not need me. If three or more do,
            the rest is worth six minutes.
          </p>
          <div className="pb-leaks">
            {leaks.map((leak) => (
              <article key={leak.id} className="pb-leak">
                <span className="pb-leak-icon" aria-hidden="true">
                  {leak.icon}
                </span>
                <h3>{leak.title}</h3>
                <p>{leak.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- Automations ---------- */}
        <section className="pb-section" id="how">
          <h2>Six things that start running on their own</h2>
          <p className="pb-section-lede">
            None of these change how you run your garage. They remove the parts of it that a
            computer should have been doing all along.
          </p>

          {heroAutomation && (
            <article className="pb-auto pb-auto-hero">
              <div className="pb-auto-head">
                <span className="pb-auto-number">{heroAutomation.number}</span>
                <div>
                  <h3>{heroAutomation.name}</h3>
                  <p className="pb-auto-tagline">{heroAutomation.tagline}</p>
                </div>
                <span className="pb-auto-badge">{heroAutomation.payoff}</span>
              </div>
              <p className="pb-auto-problem">{heroAutomation.problem}</p>
              <ol className="pb-auto-steps">
                {heroAutomation.solution.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
              <p className="pb-auto-honest">
                <strong>Straight answer:</strong> {heroAutomation.honest}
              </p>
              <ul className="pb-auto-built">
                {heroAutomation.builtWith.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            </article>
          )}

          <div className="pb-auto-grid">
            {restAutomations.map((auto) => (
              <article key={auto.id} className="pb-auto">
                <div className="pb-auto-head">
                  <span className="pb-auto-number">{auto.number}</span>
                  <div>
                    <h3>{auto.name}</h3>
                    <p className="pb-auto-tagline">{auto.tagline}</p>
                  </div>
                </div>
                <p className="pb-auto-problem">{auto.problem}</p>
                <ol className="pb-auto-steps">
                  {auto.solution.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
                <p className="pb-auto-honest">
                  <strong>Straight answer:</strong> {auto.honest}
                </p>
                <ul className="pb-auto-built">
                  {auto.builtWith.map((tool) => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- Calculator ---------- */}
        <section className="pb-section pb-section-tint" id="calculator">
          <h2>What is this actually worth to you?</h2>
          <p className="pb-section-lede">
            Move the sliders to match your garage. I would rather show you the maths than
            quote you a percentage.
          </p>
          <Calculator />
        </section>

        {/* ---------- The trick ---------- */}
        <section className="pb-section pb-trick">
          <h2>{theTrick.title}</h2>
          <p className="pb-section-lede">{theTrick.body}</p>
          <pre className="pb-code">
            <code>{theTrick.formula}</code>
          </pre>
          <p className="pb-trick-foot">{theTrick.footnote}</p>
        </section>

        {/* ---------- Cost & limits ---------- */}
        <section className="pb-section pb-section-tint">
          <h2>The price, and the catch</h2>
          <p className="pb-section-lede">
            There is always a catch. Here is this one, before you ask.
          </p>
          <div className="pb-cost-grid">
            <div className="pb-cost pb-cost-free">
              <h3>{costs.free.title}</h3>
              <ul>
                {costs.free.points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
            <div className="pb-cost pb-cost-limits">
              <h3>{costs.limits.title}</h3>
              <ul>
                {costs.limits.points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ---------- Rollout ---------- */}
        <section className="pb-section">
          <h2>How the first month actually goes</h2>
          <p className="pb-section-lede">
            No contract, no advance, no training programme. Your shop does not shut for a
            single hour.
          </p>
          <ol className="pb-timeline">
            {rollout.map((phase) => (
              <li key={phase.when}>
                <div className="pb-timeline-marker" aria-hidden="true" />
                <div className="pb-timeline-body">
                  <p className="pb-timeline-when">
                    {phase.when} <span>· {phase.duration}</span>
                  </p>
                  <p>{phase.what}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- Trust ---------- */}
        <section className="pb-section pb-section-tint">
          <h2>{trust.title}</h2>
          <div className="pb-trust">
            {trust.points.map((point) => (
              <article key={point.heading}>
                <h3>{point.heading}</h3>
                <p>{point.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- CTA ---------- */}
        <section className="pb-cta" id="talk">
          <h2>One free automation. Your garage. No money, no contract.</h2>
          <p>
            Tell me the single most irritating thing you or your staff do by hand every week.
            If I can automate it, I will build it free and you can watch it run for a month
            before we discuss anything else.
          </p>
          <div className="pb-cta-actions">
            <EmailCta
              className="pb-btn pb-btn-primary"
              subject="Simplymation — free automation for my business"
              body={CTA_BODY}
            >
              Book the free 90 minutes
            </EmailCta>
            <Link className="pb-btn pb-btn-ghost" to="/">
              See what I have built before
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
