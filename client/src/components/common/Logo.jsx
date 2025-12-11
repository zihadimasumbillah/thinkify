import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const sizes = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
};

const Logo = ({ size = 'md', className = '', showText = true }) => {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 group ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        {/* Logo Icon */}
        <div className={`
          ${sizes[size]} font-bold 
          bg-gradient-to-br from-primary to-primary-600 
          text-dark rounded-xl p-2
          shadow-neon group-hover:shadow-neon-lg
          transition-shadow duration-300
        `}>
          T
        </div>
        
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.div>

      {showText && (
        <span className={`
          ${sizes[size]} font-bold text-gray-100
          group-hover:text-primary transition-colors duration-300
        `}>
          hinkify
        </span>
      )}
    </Link>
  );
};

export default Logo;
