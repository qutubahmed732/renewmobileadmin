"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (opts: { type: ToastType; title: string; message?: string }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ type, title, message }: { type: ToastType; title: string; message?: string }) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 size={20} className="shrink-0" />,
    error: <AlertCircle size={20} className="shrink-0" />,
    info: <Info size={20} className="shrink-0" />,
  };

  const colors: Record<ToastType, string> = {
    success: "bg-emerald-500 text-white shadow-emerald-500/30",
    error: "bg-rose-500 text-white shadow-rose-500/30",
    info: "bg-amber-500 text-white shadow-amber-500/30",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 p-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto ${colors[t.type]}`}
          >
            {icons[t.type]}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-snug">{t.title}</p>
              {t.message && <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{t.message}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="opacity-70 hover:opacity-100 transition-opacity shrink-0 mt-0.5"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
