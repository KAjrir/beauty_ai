"use client";

import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToast = useCallback((type, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    
    setTimeout(() => removeToast(id), 3000);
  }, []);

  const toast = {
    success: (msg) => addToast("success", msg),
    error: (msg) => addToast("error", msg),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast UI */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center space-y-2">
        {toasts.map((t) => (
            <div
                key={t.id}
                className={`
                    toast-anim 
                    rounded shadow-lg text-white font-medium
                    px-3 py-2 text-xs    /* default: klein voor mobieltjes */
                    sm:px-4 sm:py-3 sm:text-sm   /* tablets: iets groter */
                    md:px-5 md:py-3 md:text-base /* laptops/desktops: nog groter */
                    lg:px-6 lg:py-4 lg:text-lg   /* grote desktops */
                    max-w-[90vw] sm:max-w-[400px] md:max-w-[500px]
                    text-center
                    ${t.type === "error" ? "bg-red-500" : "bg-green-600"}
                `}
            >
                {t.message}
            </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes toastFade {
          0% { opacity: 0; transform: translateY(-10px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }

        .toast-anim {
          animation: toastFade 3s ease-in-out forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}