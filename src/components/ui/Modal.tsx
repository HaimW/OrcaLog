"use client";

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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {description && <p className="text-gray-600 mb-4">{description}</p>}
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn btn-secondary">{cancelText}</button>
          <button onClick={onConfirm} className={danger ? "btn btn-danger" : "btn btn-primary"}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
