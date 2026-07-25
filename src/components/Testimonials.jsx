import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { testimonials } from '../data/projects';
import './Testimonials.css';

export default function Testimonials() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const displayTestimonials = testimonials?.length ? testimonials : [
    { quote: "An absolute masterclass in web design. The attention to detail is stunning.", name: "Sarah Jenkins", role: "Product Manager", avatar: "👩‍💼" },
    { quote: "Transformed our vision into a breathtaking reality. Unparalleled expertise.", name: "David Chen", role: "Founder & CEO", avatar: "👨‍💻" },
    { quote: "Every interaction is buttery smooth. The 3D elements add a whole new dimension.", name: "Emily Watson", role: "Creative Director", avatar: "👩‍🎨" },
    { quote: "Professional, innovative, and delivered way beyond our expectations.", name: "Michael Chang", role: "CTO", avatar: "👨‍💼" },
  ];

  const endlessItems = [...displayTestimonials, ...displayTestimonials, ...displayTestimonials, ...displayTestimonials];

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animId;
    const speed = 1.2;

    const step = () => {
      if (!isHovered && container) {
        container.scrollLeft += speed;
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isHovered]);

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="testimonials-container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="testimonials-header"
        >
          <span className="section-label">TESTIMONIALS</span>
          <h2 className="section-title">What People Say</h2>
        </motion.div>

        <div className="testimonials-scroll-wrapper">
          <div 
            className="testimonials-track"
            ref={scrollRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {endlessItems.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="quote-mark">"</div>
                <p className="quote-text">{t.quote}</p>
                <div className="author-info">
                  <div className="author-avatar">{t.avatar || '👤'}</div>
                  <div className="author-details">
                    <h4 className="author-name">{t.name || t.author}</h4>
                    <p className="author-role">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="cta-section"
        >
          <h3 className="cta-title">Ready to transform your business?</h3>
          <div className="cta-buttons">
            <a href="#contact" className="btn-primary" style={{textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>Start a Project</a>
            <a href="#projects" className="btn-secondary" style={{textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>View Portfolio</a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
