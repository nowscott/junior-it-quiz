import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  // variant = 'info' // Remove unused variant prop usage if not needed
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-xs md:max-w-sm bg-white rounded-xl md:rounded-2xl shadow-xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-4 md:p-6 text-center">
          <div className="mx-auto flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-red-100 mb-3 md:mb-4">
            <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-red-600" aria-hidden="true" />
          </div>
          
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1.5 md:mb-2">
            {title}
          </h3>
          
          <p className="text-xs md:text-sm text-gray-500">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-4 pb-4 md:px-6 md:pb-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-3 py-2 md:px-4 md:py-2.5 bg-gray-100 text-gray-700 text-xs md:text-sm font-medium rounded-lg md:rounded-xl hover:bg-gray-200 transition-colors"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-3 py-2 md:px-4 md:py-2.5 bg-red-600 text-white text-xs md:text-sm font-bold rounded-lg md:rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
