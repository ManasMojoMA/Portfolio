import { useEffect, useRef, useState } from 'react';
import './EmailCta.css';

/**
 * A "get in touch" button that works whatever the visitor reads mail in.
 *
 * The CTAs used to be a bare `mailto:` link. That hands off to whatever the
 * operating system has registered as the default mail handler — on Windows,
 * usually Outlook, even for someone who has never opened it and reads
 * everything in Gmail on the web. They get an app they do not use, half-filled,
 * and most of them close it. On a page whose entire job is starting a
 * conversation, that is the worst possible place to lose someone.
 *
 * So the button opens a small chooser instead: Gmail and Outlook on the web,
 * the default mail app for people who genuinely use one, and copy-the-address
 * for everyone else. Every option carries the same prefilled subject and body.
 */

const ADDRESS = 'aroramanasm07@gmail.com';

export default function EmailCta({
  subject,
  body = '',
  className = 'site-btn site-btn-primary',
  children,
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef(null);

  // Close on an outside click or Escape, the two things people reach for.
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const enc = encodeURIComponent;
  const options = [
    {
      key: 'gmail',
      label: 'Gmail',
      hint: 'Opens in your browser',
      href: `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(ADDRESS)}&su=${enc(subject)}&body=${enc(body)}`,
    },
    {
      key: 'outlook',
      label: 'Outlook.com',
      hint: 'Opens in your browser',
      href: `https://outlook.live.com/mail/0/deeplink/compose?to=${enc(ADDRESS)}&subject=${enc(subject)}&body=${enc(body)}`,
    },
    {
      key: 'default',
      label: 'My mail app',
      hint: 'Apple Mail, Outlook desktop, Thunderbird',
      href: `mailto:${ADDRESS}?subject=${enc(subject)}&body=${enc(body)}`,
    },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ADDRESS);
    } catch {
      // Clipboard access can be refused; the address is on screen either way.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className="email-cta" ref={wrapRef}>
      <button
        type="button"
        className={className}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {children}
      </button>

      {open && (
        <div className="email-cta-menu" role="menu">
          <p className="email-cta-menu-title">Write to me using…</p>
          {options.map((o) => (
            <a
              key={o.key}
              role="menuitem"
              href={o.href}
              target={o.key === 'default' ? undefined : '_blank'}
              rel="noreferrer"
              className="email-cta-option"
              onClick={() => setOpen(false)}
            >
              <span className="email-cta-option-label">{o.label}</span>
              <span className="email-cta-option-hint">{o.hint}</span>
            </a>
          ))}

          <button type="button" className="email-cta-option email-cta-copy" onClick={copy}>
            <span className="email-cta-option-label">
              {copied ? 'Copied' : 'Copy my address'}
            </span>
            <span className="email-cta-option-hint">{ADDRESS}</span>
          </button>
        </div>
      )}
    </span>
  );
}

export { ADDRESS as CONTACT_EMAIL };
