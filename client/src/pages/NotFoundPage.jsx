import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg"
      >
        {/* 404 Graphic */}
        <div className="relative mb-8">
          <h1 className="text-[150px] md:text-[200px] font-bold text-dark-100 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl animate-float">🤔</span>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-gray-100 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-400 mb-8">
          Oops! The page you're looking for seems to have wandered off into the digital void. 
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button size="lg">
              Go Home
            </Button>
          </Link>
          <Link to="/explore">
            <Button variant="secondary" size="lg">
              Explore
            </Button>
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="mt-12 flex justify-center gap-8 text-gray-600">
          <div className="w-2 h-2 bg-primary/50 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-primary/50 rounded-full animate-pulse delay-100" />
          <div className="w-2 h-2 bg-primary/50 rounded-full animate-pulse delay-200" />
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
