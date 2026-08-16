import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './Contact.css';
import { CONTACT_EMAIL } from './EmailCta';

const sanitizeInput = (str) => {
  if (!str) return '';
  return str.replace(/<[^>]*>?/gm, ''); // basic HTML tag stripping
};

const Contact = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [focused, setFocused] = useState({
    name: false,
    email: false,
    message: false
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  /** idle | sending | sent | failed | unconfigured */
  const [status, setStatus] = useState('idle');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: sanitizeInput(value)
    }));
  };

  const handleFocus = (name) => {
    setFocused(prev => ({ ...prev, [name]: true }));
  };

  const handleBlur = (name) => {
    setFocused(prev => ({ ...prev, [name]: false }));
  };

  /**
   * Deliver the message, or say plainly that it was not delivered.
   *
   * This used to be a setTimeout with the comment "Simulate sending". It showed
   * a success tick, cleared the fields and threw the message away — so a
   * visitor who took the trouble to write something was told it had arrived
   * while it went nowhere. On a site whose whole purpose is being contacted,
   * losing the message silently is the worst outcome available; a form that
   * admits it is not wired up is strictly better.
   *
   * VITE_CONTACT_ENDPOINT takes any URL that accepts a JSON POST — a Google
   * Apps Script web app, Formspree, a serverless function. When it is unset the
   * form does not pretend: it offers the email address instead.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT;
    if (!endpoint) {
      setStatus('unconfigured');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        // text/plain, not application/json, and this matters.
        //
        // A JSON content-type makes this a "preflighted" cross-origin request,
        // so the browser sends an OPTIONS probe first. Apps Script web apps do
        // not answer OPTIONS, so the browser blocks the request before it is
        // ever sent and the form fails for every visitor — while curl, which
        // does no preflighting, succeeds. text/plain is a CORS simple request:
        // no preflight, and Apps Script still receives the raw body in
        // e.postData.contents, where JSON.parse reads it exactly the same.
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          name: sanitizeInput(formData.name),
          email: sanitizeInput(formData.email),
          message: sanitizeInput(formData.message),
          sentAt: new Date().toISOString(),
          source: 'portfolio-contact-form',
        }),
      });
      if (!res.ok) throw new Error(String(res.status));

      setStatus('sent');
      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => {
        setIsSubmitted(false);
        setStatus('idle');
      }, 4000);
    } catch {
      // Never claim success on a failed request — the sender would never know.
      setStatus('failed');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section id="contact" className="contact-section">
      <div className="contact-container" ref={ref}>
        <motion.div 
          className="contact-header"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.span className="section-label" variants={itemVariants}>GET IN TOUCH</motion.span>
          <motion.h2 className="contact-title" variants={itemVariants}>Let's Build Something Together</motion.h2>
          <motion.p className="contact-subtitle" variants={itemVariants}>
            Ready to automate your business? Let's discuss how AI and automation can transform your operations.
          </motion.p>
        </motion.div>

        <div className="contact-content">
          <motion.div 
            className="contact-info"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            <motion.div className="info-card" variants={itemVariants}>
              <div className="info-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 7.00005L10.2 11.65C11.2667 12.45 12.7333 12.45 13.8 11.65L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h3>Email</h3>
                <p>{CONTACT_EMAIL}</p>
              </div>
            </motion.div>
            <motion.div className="info-card" variants={itemVariants}>
              <div className="info-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3>Location</h3>
                <p>India</p>
              </div>
            </motion.div>
            <motion.div className="info-card" variants={itemVariants}>
              <div className="info-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3>Availability</h3>
                <p>Open for Projects</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="contact-form-wrapper"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <form className="contact-form" onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div 
                    className="success-state"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    key="success"
                  >
                    <motion.div 
                      className="checkmark-circle"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <svg viewBox="0 0 52 52">
                        <motion.circle 
                          cx="26" cy="26" r="25" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.4 }}
                        />
                        <motion.path 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="3" 
                          d="M14.1 27.2l7.1 7.2 16.7-16.8"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.4, delay: 0.3 }}
                        />
                      </svg>
                    </motion.div>
                    <h3>Message Sent!</h3>
                    <p>I'll get back to you as soon as possible.</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="form-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key="form"
                  >
                    <div className={`input-group ${focused.name || formData.name ? 'active' : ''}`}>
                      <label htmlFor="name">Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => handleFocus('name')}
                        onBlur={() => handleBlur('name')}
                        required
                      />
                    </div>
                    <div className={`input-group ${focused.email || formData.email ? 'active' : ''}`}>
                      <label htmlFor="email">Email</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => handleFocus('email')}
                        onBlur={() => handleBlur('email')}
                        required
                      />
                    </div>
                    <div className={`input-group textarea-group ${focused.message || formData.message ? 'active' : ''}`}>
                      <label htmlFor="message">Message</label>
                      <textarea 
                        id="message" 
                        name="message" 
                        value={formData.message}
                        onChange={handleChange}
                        onFocus={() => handleFocus('message')}
                        onBlur={() => handleBlur('message')}
                        rows="4"
                        required
                      />
                    </div>
                    <button type="submit" className="submit-btn" disabled={status === 'sending'}>
                      <span className="btn-text">{status === 'sending' ? 'Sending…' : 'Send Message'}</span>
                      <div className="btn-gradient"></div>
                    </button>

                    {/* A failed send has to be visible. The previous version
                        could not fail, because it never sent anything. */}
                    {status === 'failed' && (
                      <p className="form-note form-note-error">
                        That did not go through. Please email me directly at{' '}
                        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                      </p>
                    )}
                    {status === 'unconfigured' && (
                      <p className="form-note form-note-error">
                        This form is not connected to an inbox yet, so I would rather
                        not pretend it sent. Email me at{' '}
                        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and it
                        reaches me straight away.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
