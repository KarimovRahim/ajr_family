// components/Notification.jsx
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';

export function Notification({ isOpen, onClose, type = 'success', title, message, duration = 4000 }) {
  const icons = {
    success: { icon: FiCheckCircle, color: '#45C14A', bg: 'rgba(69, 193, 74, 0.1)', border: '#45C14A30' },
    error: { icon: FiXCircle, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', border: '#EF444430' },
    info: { icon: FiInfo, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', border: '#3B82F630' },
    warning: { icon: FiAlertTriangle, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', border: '#F59E0B30' }
  };

  const Icon = icons[type].icon;

  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[2000] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="pointer-events-auto w-full max-w-md mx-4"
          >
            <div 
              className="bg-[#0F1113] border rounded-2xl shadow-2xl overflow-hidden"
              style={{ borderColor: icons[type].border }}
            >
              <div className="p-5">
                <div className="flex gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: icons[type].bg }}
                  >
                    <Icon size={24} color={icons[type].color} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{message}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white/30 hover:text-white/60 transition-colors"
                  >
                    <FiXCircle size={18} />
                  </button>
                </div>
              </div>
              <div 
                className="h-1 animate-progress"
                style={{ 
                  background: `linear-gradient(90deg, ${icons[type].color}, ${icons[type].color}80)`,
                  animation: `shrink ${duration}ms linear forwards`
                }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}