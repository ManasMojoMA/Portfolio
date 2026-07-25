import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './About.css';

const skills = [
  {
    title: 'Full-Stack Development',
    skills: 'React, Next.js, Node.js, Python',
  },
  {
    title: 'AI & Machine Learning',
    skills: 'Gemini, RAG, NLP, Claude',
  },
  {
    title: 'Cloud & DevOps',
    skills: 'Firebase, Supabase, AWS, Cloudflare',
  },
  {
    title: 'Business Automation',
    skills: 'Workflow Design, Process Optimization',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
    },
  },
};

export default function About() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section id="about" className="about-section">
      <div className="about-container">
        <motion.div
          className="about-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          ref={ref}
        >
          <span className="section-label">ABOUT</span>
          <h2 className="section-title">Turning Complexity Into Simplicity</h2>
          <p className="section-description">
            Manas is an AI & Automation specialist who helps small businesses automate their processes, reduce costs, and scale efficiently. He builds end-to-end solutions — from AI-powered tools to enterprise platforms — with a focus on measurable impact.
          </p>
        </motion.div>

        <motion.div
          className="skills-grid"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {skills.map((skill, index) => (
            <motion.div key={index} className="skill-card" variants={itemVariants}>
              <div className="skill-card-inner">
                <h3 className="skill-title">{skill.title}</h3>
                <p className="skill-details">{skill.skills}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      <div className="section-divider"></div>
    </section>
  );
}
