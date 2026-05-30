"use client";

import { AlertTriangle } from "lucide-react";

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function Modal({ open, title, description, confirmText, cancelText, onConfirm, onCancel, danger }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <div
        className="rounded-2xl p-6 max-w-sm w-full animate-scale-in"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2)",
          color: "var(--text)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {danger && (
          <div className="w-12 h-12 rounded-2xl bg-coral/10 flex items-center justify-center mb-4 mx-auto">
            <AlertTriangle size={22} className="text-coral" />
          </div>
        )}
        <h3 className="text-base font-semibold mb-2 text-center">{title}</h3>
        {description && (
          <p className="text-sm text-center mb-5" style={{ color: "var(--text-muted)" }}>
            {description}
          </p>
        )}
        <div className="flex gap-3 mt-4">
          <button onClick={onCancel} className="btn btn-secondary flex-1">{cancelText}</button>
          <button onClick={onConfirm} className={`btn flex-1 ${danger ? "btn-danger" : "btn-primary"}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
