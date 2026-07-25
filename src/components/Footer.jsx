import React from 'react';
import { motion } from 'framer-motion';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <motion.footer 
      className="footer"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={footerVariants}
    >
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <h3>Manas Arora</h3>
            <p>Made with passion.</p>
          </div>
          
          <div className="footer-links">
            <h4>Quick Links</h4>
            <nav>
              <a href="#home" onClick={(e) => scrollToSection(e, 'home')}>Home</a>
              <a href="#about" onClick={(e) => scrollToSection(e, 'about')}>About</a>
              <a href="#services" onClick={(e) => scrollToSection(e, 'services')}>Services</a>
              <a href="#projects" onClick={(e) => scrollToSection(e, 'projects')}>Projects</a>
              <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')}>Contact</a>
            </nav>
          </div>

          <div className="footer-social">
            <h4>Connect</h4>
            <nav>
              <a href="#" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="#" target="_blank" rel="noopener noreferrer">Twitter</a>
            </nav>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Manas Arora. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
