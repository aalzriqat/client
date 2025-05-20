import React from 'react';

interface ErrorMessageProps {
  message: string | null; // Allow null in case error is cleared
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  className = "error-message" // Default class
}) => {
  if (!message) {
    return null; // Don't render anything if message is null or empty
  }
  return <p className={className} style={{ color: 'red', padding: '10px', textAlign: 'center', border: '1px solid red', borderRadius: '4px', backgroundColor: '#ffebee' }}>{message}</p>;
};

export default ErrorMessage;