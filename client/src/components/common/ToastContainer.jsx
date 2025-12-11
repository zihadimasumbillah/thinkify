import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import useToastStore from '../../stores/toastStore';

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastColors = {
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    icon: 'text-green-400',
    text: 'text-green-300',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: 'text-red-400',
    text: 'text-red-300',
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    icon: 'text-yellow-400',
    text: 'text-yellow-300',
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: 'text-blue-400',
    text: 'text-blue-300',
  },
};

const Toast = ({ toast }) => {
  const { removeToast } = useToastStore();
  const Icon = toastIcons[toast.type];
  const colors = toastColors[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm
        ${colors.bg} ${colors.border} min-w-[300px] max-w-[400px] shadow-lg`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colors.icon}`} />
      
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={`font-medium text-sm ${colors.text}`}>
            {toast.title}
          </p>
        )}
        <p className="text-sm text-text-primary">
          {toast.message}
        </p>
      </div>
      
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 p-1 hover:bg-white/5 rounded transition-colors"
      >
        <X className="w-4 h-4 text-text-secondary" />
      </button>
    </motion.div>
  );
};

const ToastContainer = () => {
  const { toasts } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
