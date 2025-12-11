import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Infinite scroll hook with intersection observer
 * @param {Function} callback - Function to call when bottom is reached
 * @param {Object} options - Options object
 * @returns {Object} - { lastElementRef, isLoading }
 */
const useInfiniteScroll = (callback, options = {}) => {
  const { threshold = 0.1, rootMargin = '100px' } = options;
  const [isLoading, setIsLoading] = useState(false);
  const observer = useRef(null);

  const lastElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      
      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsLoading(true);
            Promise.resolve(callback()).finally(() => {
              setIsLoading(false);
            });
          }
        },
        { threshold, rootMargin }
      );

      if (node) {
        observer.current.observe(node);
      }
    },
    [callback, isLoading, threshold, rootMargin]
  );

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  return { lastElementRef, isLoading };
};

export default useInfiniteScroll;
