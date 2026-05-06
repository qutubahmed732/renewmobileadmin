"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { CheckCircle2, AlertCircle, Info, X, Trash2 } from "lucide-react";

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface UIContextValue {
  toast: (opts: { type: ToastType; title: string; message?: string }) => void;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

const UIContext = createContext<UIContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const toast = useCallback(({ type, title, message }: { type: ToastType; title: string; message?: string }) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({ ...opts, resolve });
    });
  }, []);

  const handleConfirmResult = (result: boolean) => {
    confirmState?.resolve(result);
    setConfirmState(null);
  };

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
    <UIContext.Provider value={{ toast, confirm }}>
      {children}

      {/* ── Toast Stack ─────────────────────────────────────────────────────── */}
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

      {/* ── Confirm Modal ────────────────────────────────────────────────────── */}
      {confirmState && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => handleConfirmResult(false)}
          />

          {/* Dialog */}
          <div className="relative bg-white dark:bg-[#111318] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Icon */}
            <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${confirmState.danger ? "bg-rose-50 dark:bg-rose-500/10" : "bg-amber-50 dark:bg-amber-500/10"}`}>
              <Trash2 size={24} className={confirmState.danger ? "text-rose-500" : "text-amber-500"} />
            </div>

            {/* Text */}
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                {confirmState.title || "Are you sure?"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {confirmState.message}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleConfirmResult(false)}
                className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {confirmState.cancelLabel || "Cancel"}
              </button>
              <button
                onClick={() => handleConfirmResult(true)}
                className={`flex-1 h-11 rounded-xl text-sm font-bold text-white transition-all active:scale-95 ${confirmState.danger ? "bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/25" : "bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/25"}`}
              >
                {confirmState.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return { toast: ctx.toast };
}

export function useConfirm() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useConfirm must be used within a ToastProvider");
  return ctx.confirm;
}
