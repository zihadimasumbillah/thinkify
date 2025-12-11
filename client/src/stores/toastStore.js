import { create } from 'zustand';

const useToastStore = create((set, get) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast,
    };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
    
    // Auto remove toast after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }
    
    return id;
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  
  clearToasts: () => {
    set({ toasts: [] });
  },
  
  // Helper methods
  success: (message, options = {}) => {
    return get().addToast({ message, type: 'success', ...options });
  },
  
  error: (message, options = {}) => {
    return get().addToast({ message, type: 'error', ...options });
  },
  
  warning: (message, options = {}) => {
    return get().addToast({ message, type: 'warning', ...options });
  },
  
  info: (message, options = {}) => {
    return get().addToast({ message, type: 'info', ...options });
  },
}));

export default useToastStore;
