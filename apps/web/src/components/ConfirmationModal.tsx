import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: ReactNode;
  children?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  cancelButtonClass?: string;
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  children,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmButtonClass = "bg-green-500 hover:bg-green-600",
  cancelButtonClass = "bg-red-500 hover:bg-red-600",
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 max-w-md p-4 rounded-lg shadow-lg border border-zinc-800">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        
        {message && <p className="mb-4">{message}</p>}
        
        {children}
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button
            onClick={onClose}
            className={cancelButtonClass}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={confirmButtonClass}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 