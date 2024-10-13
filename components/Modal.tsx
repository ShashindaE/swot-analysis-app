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
          theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'
        } rounded-lg shadow-lg border border-gray-300 bg-opacity-50 backdrop-blur-md max-w-4xl w-11/12 max-h-[80vh] overflow-hidden relative`}
      >
        <div className="sticky top-0 bg-opacity-90 backdrop-blur-none p-4 border-b border-gray-300 z-10 text-center">
          <h2 className="text-xl font-bold">Analysis Results</h2>
        </div>
        <button
          className={`absolute top-2 right-2 ${
            theme === 'dark' ? 'text-white' : 'text-black'
          } transition-colors duration-300 bg-opacity-90 rounded-full w-10 h-10 flex items-center justify-center shadow-lg bg-gray-700 z-20`}
          onClick={onClose}
        >
          <span className="sr-only">Close</span>
          &times;
        </button>
        <div className="pt-4 px-8 overflow-y-auto max-h-[calc(80vh-64px)] scrollbar-thin scrollbar-thumb-gray-400">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
