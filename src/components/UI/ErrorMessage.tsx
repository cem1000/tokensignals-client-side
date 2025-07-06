import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage = ({ message, className = '' }: ErrorMessageProps) => {
  return (
    <div className={`flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 ${className}`}>
      <AlertCircle size={20} />
      <span>{message}</span>
    </div>
  );
}; 