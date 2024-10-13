import React from 'react';
import { useTheme } from 'next-themes';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div
        className={`${
          theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'
        } rounded-lg shadow-lg border border-gray-600 max-w-3xl w-11/12 max-h-full overflow-y-auto p-6 relative bg-opacity-90`}
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors duration-300"
          onClick={onClose}
        >
          <span className="sr-only">Close</span>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
