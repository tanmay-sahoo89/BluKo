import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface NotificationProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

export function Notification({ type, message, onClose }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div
        className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl min-w-[300px] max-w-[500px] ${
          type === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}
      >
        {type === 'success' ? (
          <CheckCircle size={24} className="flex-shrink-0" />
        ) : (
          <XCircle size={24} className="flex-shrink-0" />
        )}
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
