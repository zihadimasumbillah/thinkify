import { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../stores/authStore';
import Logo from '../components/common/Logo';

const AuthLayout = () => {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // If already authenticated, redirect to home
  if (isAuthenticated && !isLoading) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-dark-300 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-cyber-grid bg-grid opacity-30" />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent-purple/10" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Logo size="xl" className="mb-8" />
            
            <h1 className="text-4xl font-bold text-gray-100 mb-4">
              Think. Share. <span className="text-primary">Connect.</span>
            </h1>
            
            <p className="text-lg text-gray-400 max-w-md">
              Join a vibrant community where meaningful conversations happen. 
              Share your ideas, engage with thinkers, and be part of something bigger.
            </p>

            {/* Features */}
            <div className="mt-12 grid grid-cols-1 gap-4 text-left max-w-sm mx-auto">
              {[
                { icon: '💡', text: 'Share your unique perspective' },
                { icon: '🌐', text: 'Connect with like-minded thinkers' },
                { icon: '🚀', text: 'Discover trending ideas' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3 text-gray-300"
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Decorative Elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent-purple/10 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Logo size="lg" />
          </div>

          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
