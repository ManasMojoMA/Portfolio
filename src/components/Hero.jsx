import { motion, useScroll, useTransform, animate } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { stats as importedStats } from '../data/projects';
import './Hero.css';

// No hardcoded fallback here on purpose. This used to hold invented numbers
// ("40% Cost Reduction", "100% Satisfaction") that would render the moment
// `stats` came back empty. Every number shown must be checkable by a visitor,
// so an empty `stats` array now renders no strip at all rather than a lie.

const AnimatedNumber = ({ value, inView }) => {
  const nodeRef = useRef(null);

  useEffect(() => {
    if (inView && nodeRef.current) {
      const controls = animate(0, value, {
        duration: 2,
        ease: 'easeOut',
        onUpdate(v) {
          if (nodeRef.current) {
            nodeRef.current.textContent = Math.round(v);
          }
        },
      });
      return () => controls.stop();
    }
  }, [value, inView]);

  return <span ref={nodeRef}>0</span>;
};

const Hero = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const textY = useTransform(scrollYProgress, [0, 0.5], ['0%', '-25%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  const [statsRef, statsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const displayStats = Array.isArray(importedStats) ? importedStats : [];

  const titleVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  };

  const lineVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // Apple-like spring/ease
      },
    },
  };

  return (
    <section className="hero-section" ref={containerRef}>
      {/* Background Orbs */}
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-glow-overlay" />

      <motion.div 
        className="hero-content"
      >
        <motion.div 
          className="hero-badge"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="badge-icon">✦</span> AI & Automation Expert
        </motion.div>

        <motion.div 
          className="hero-title"
          variants={titleVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 variants={lineVariants}>
            I <span className="gradient-text-1">Automate.</span>
          </motion.h1>
          <motion.h1 variants={lineVariants}>
            I <span className="gradient-text-2">Build.</span>
          </motion.h1>
          <motion.h1 variants={lineVariants}>
            I <span className="gradient-text-3">Transform.</span>
          </motion.h1>
        </motion.div>

        <motion.p 
          className="hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
        >
          Helping small businesses unlock efficiency through AI-powered automation and custom software solutions.
        </motion.p>

        <motion.div 
          className="hero-ctas"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: 'easeOut' }}
        >
          <a href="#projects" className="cta-button primary-cta" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            View My Work
            <div className="cta-hover-glow" />
          </a>
          <a href="#contact" className="cta-button secondary-cta" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            Let's Talk
          </a>
        </motion.div>
      </motion.div>

      {/* Floating Stats Bar — omitted entirely when there is nothing verifiable
          to show, rather than rendering an empty bordered shell. */}
      {displayStats.length > 0 && (
        <motion.div
          className="hero-stats-container"
          ref={statsRef}
          initial={{ opacity: 0, y: 50 }}
          animate={statsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="hero-stats">
            {displayStats.map((stat, index) => (
              <div className="stat-item" key={index}>
                <h3 className="stat-value">
                  <AnimatedNumber value={stat.value} inView={statsInView} />
                  <span className="stat-suffix">{stat.suffix}</span>
                </h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Scroll Indicator */}
      <motion.div 
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <div className="mouse">
          <motion.div 
            className="wheel"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          />
        </div>
        <motion.div 
          className="chevron"
          animate={{ y: [0, 5, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay: 0.2 }}
        >
          ↓
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
