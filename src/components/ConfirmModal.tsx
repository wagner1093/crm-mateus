'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar',
  variant = 'danger'
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!mounted) return null;

  const colors = {
    danger: {
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      confirmBg: 'bg-red-500 hover:bg-red-600',
      confirmText: 'text-white'
    },
    warning: {
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      confirmBg: 'bg-amber-500 hover:bg-amber-600',
      confirmText: 'text-white'
    },
    info: {
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      confirmBg: 'bg-blue-500 hover:bg-blue-600',
      confirmText: 'text-white'
    }
  };

  const currentColors = colors[variant];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-start gap-5">
                <div className={`w-14 h-14 rounded-2xl ${currentColors.iconBg} flex items-center justify-center ${currentColors.iconColor} shrink-0`}>
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h3>
                  <p className="mt-2 text-gray-500 leading-relaxed">{message}</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 text-gray-600 font-bold hover:bg-gray-100 transition-all"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 px-6 py-4 rounded-2xl ${currentColors.confirmBg} ${currentColors.confirmText} font-bold shadow-lg shadow-red-500/10 transition-all`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
