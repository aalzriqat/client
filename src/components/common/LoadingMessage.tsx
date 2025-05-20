import React from 'react';

interface LoadingMessageProps {
  message?: string; // Make message optional, provide a default
  className?: string;
}

const LoadingMessage: React.FC<LoadingMessageProps> = ({ 
  message = "Loading...", // Default message
  className = "loading-message" // Default class
}) => <p className={className} style={{ fontStyle: 'italic', padding: '10px', textAlign: 'center' }}>{message}</p>;

export default LoadingMessage;