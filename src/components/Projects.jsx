import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { projects } from '../data/projects';
import { demoFor } from '../data/demoAccounts';
import './Projects.css';

const ProjectModal = ({ project, onClose }) => {
  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [project]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {project && (
        <motion.div 
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="modal-content glass-effect"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={onClose} aria-label="Close modal">&times;</button>
            
            <div className="modal-header">
              <span className="modal-icon">{project.icon}</span>
              <div className="modal-title-group">
                <span className="project-category">{project.category}</span>
                <h2>{project.title}</h2>
                <p className="project-subtitle">{project.subtitle}</p>
              </div>
            </div>

            <div className="modal-body">
              <p className="modal-description">{project.fullDescription || project.description}</p>
              
              {project.metrics && (
                <div className="metrics-bar">
                  {Object.entries(project.metrics).map(([key, value], i) => (
                    <div key={i} className="metric-item">
                      <span className="metric-value">{value}</span>
                      <span className="metric-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                    </div>
                  ))}
                </div>
              )}

              {project.features && project.features.length > 0 && (
                <div className="modal-section">
                  <h3>Key Features</h3>
                  <ul className="features-list">
                    {project.features.map((feature, i) => (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <span className="check-icon">✓</span> {feature}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {project.sop && project.sop.length > 0 && (
                <div className="modal-section">
                  <h3>SOP Guide</h3>
                  <div className="sop-steps">
                    {project.sop.map((step, i) => (
                      <div key={i} className="sop-step">
                        <div className="step-number">{i + 1}</div>
                        <div className="step-content">
                          <h4>{step.title}</h4>
                          <p>{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* How to get in. Apps with role buttons on their own login screen need
                  no credentials here at all — that is the standard, and the portfolio
                  is better for not being a credential registry. Anything still on
                  published logins says so rather than leaving a recruiter stuck. */}
              {(() => {
                const demo = demoFor(project.id)

                if (demo.status !== 'live') {
                  return (
                    <div className="modal-section demo-credentials">
                      <div className="demo-head"><h3>Try it</h3></div>
                      <p className="demo-note demo-note-muted">
                        {demo.status === 'pending'
                          ? 'Live demo being set up. Happy to screen-share a walkthrough in the meantime.'
                          : 'Not deployed publicly. Happy to walk through it on a call or share a recording.'}
                      </p>
                    </div>
                  )
                }

                return (
                  <div className="modal-section demo-credentials">
                    <div className="demo-head">
                      <h3>Try it</h3>
                      <a href={demo.url} target="_blank" rel="noopener noreferrer" className="launch-app-btn">
                        Explore the app
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '0.5rem' }}>
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </a>
                    </div>

                    {demo.entry === 'roles' && (
                      <>
                        <p className="demo-note">
                          No signup, no credentials to copy. The login screen has a button
                          for each role — pick one and you are straight in.
                        </p>
                        <div className="demo-roles">
                          {(demo.roles ?? []).map((role) => (
                            <span className="demo-role-chip" key={role}>
                              Explore as {role}
                            </span>
                          ))}
                        </div>
                      </>
                    )}

                    {demo.entry === 'sso' && (
                      <p className="demo-note">
                        Sign in with any Google account — nothing to set up.
                      </p>
                    )}

                    {demo.entry === 'signup' && (
                      <>
                        <p className="demo-note">
                          Register with any email — it takes a few seconds and the account
                          is yours to break. Role buttons are on the way here too.
                        </p>
                        {demo.roles?.length > 0 && (
                          <div className="demo-roles">
                            {demo.roles.map((role) => (
                              <span className="demo-role-chip" key={role}>
                                {role}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {demo.note && <p className="demo-note">{demo.note}</p>}
                  </div>
                )
              })()}

              {project.techStack && project.techStack.length > 0 && (
                <div className="modal-section">
                  <h3>Tech Stack</h3>
                  <div className="tech-stack">
                    {project.techStack.map((tech, i) => (
                      <span key={i} className="tech-badge">{tech}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

const ProjectCard = ({ project, onClick, variants }) => {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateXValue = ((y - centerY) / centerY) * -10;
    const rotateYValue = ((x - centerX) / centerX) * 10;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div 
      ref={cardRef}
      className="project-card glass-effect"
      variants={variants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
    >
      <div className="card-header">
        <span className="card-icon">{project.icon}</span>
        <span className="category-badge">{project.category}</span>
      </div>
      <div className="card-content">
        <h3 className="card-title">{project.title}</h3>
        <p className="card-subtitle">{project.subtitle}</p>
        <p className="card-description">{project.description}</p>
        
        <div className="tech-stack-preview">
          {project.tags?.slice(0, 3).map((tag, i) => (
            <span key={i} className="tech-pill">{tag}</span>
          ))}
          {project.tags?.length > 3 && (
            <span className="tech-pill more">+{project.tags.length - 3}</span>
          )}
        </div>
      </div>
      
      <button 
        className="view-details-btn"
        onClick={onClick}
      >
        View Details
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </motion.div>
  );
};

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
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
      transition: { type: "spring", stiffness: 100 }
    },
  };

  return (
    <section id="projects" className="projects-section" ref={ref}>
      <div className="container">
        <div className="section-header">
          <span className="section-label">PORTFOLIO</span>
          <h2 className="section-title">Built to Solve Real Problems</h2>
        </div>

        <motion.div 
          className="projects-grid"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {projects?.map((project, index) => (
            <ProjectCard 
              key={index}
              project={project}
              variants={itemVariants}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </motion.div>
      </div>

      <ProjectModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </section>
  );
}
