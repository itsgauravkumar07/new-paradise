"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ShutdownPopupProps {
  isOpen: boolean;
}

const ShutdownPopup = memo(({ isOpen }: ShutdownPopupProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto text-center bg-white rounded-lg shadow-xl p-8 border border-red-200"
          >
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Service Temporarily Unavailable
              </h1>
              <p className="text-lg text-gray-600 mb-6">
              Website is currently offline due to non-payment of development services.
              </p>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700">
                <strong>Notice:</strong> This website is currently offline due to non-payment of development services. 
                Normal operations will resume once payment obligations are fulfilled.
              </p>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>For business inquiries, please contact the developer.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

ShutdownPopup.displayName = 'ShutdownPopup';

export default ShutdownPopup;
