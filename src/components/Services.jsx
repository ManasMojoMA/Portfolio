import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { services } from '../data/projects'
import { useRef, useState } from 'react'
import './Services.css'

const Card = ({ service, index }) => {
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

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <motion.div 
      className="service-card-wrapper"
      variants={cardVariants}
    >
      <div 
        className="service-card"
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          '--accent-color': service.color || '#0a84ff'
        }}
      >
        <div className="service-accent-line"></div>
        <div className="service-icon">{service.icon}</div>
        <h3 className="service-title">{service.title}</h3>
        <p className="service-desc">{service.description}</p>
        <ul className="service-benefits">
          {service.benefits && service.benefits.map((benefit, i) => (
            <li key={i}>
              <span className="checkmark">✓</span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default function Services() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  // Fallback data just in case
  const data = services && services.length > 0 ? services : [
    {
      title: "Frontend Development",
      description: "Building responsive, performant, and accessible user interfaces.",
      icon: "💻",
      color: "#0a84ff",
      benefits: ["React & Vue", "Performance Optimization", "Responsive Design"]
    },
    {
      title: "Backend Development",
      description: "Scalable server architectures and robust API designs.",
      icon: "⚙️",
      color: "#30d158",
      benefits: ["Node.js & Python", "Database Design", "RESTful APIs"]
    },
    {
      title: "UI/UX Design",
      description: "Crafting intuitive and engaging user experiences.",
      icon: "✨",
      color: "#bf5af2",
      benefits: ["Wireframing", "Prototyping", "User Research"]
    },
    {
      title: "3D Web Experiences",
      description: "Interactive and immersive 3D web applications.",
      icon: "🧊",
      color: "#ff9f0a",
      benefits: ["Three.js", "React Three Fiber", "WebGL Optimization"]
    }
  ];

  return (
    <section id="services" className="services-section">
      <div className="services-container" ref={ref}>
        <motion.div 
          className="services-header"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="section-label">SERVICES</span>
          <h2 className="section-title">What I Do</h2>
        </motion.div>
        
        <motion.div 
          className="services-grid"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {data.map((service, index) => (
            <Card key={index} service={service} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
