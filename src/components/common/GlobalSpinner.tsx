import React from 'react';
import { useAppSelector } from '../../store/hooks'; // Updated import
import { selectIsGlobalLoading } from '../../store/slices/uiSlice'; // Updated import
import Spinner from './Spinner'; // Assuming Spinner.tsx is typed

const GlobalSpinner: React.FC = () => {
  const isGlobalLoading = useAppSelector(selectIsGlobalLoading);

  if (!isGlobalLoading) {
    return null;
  }

  // Ensure spinnerOverlayStyle is defined or imported if it's in a separate CSS/CSS-in-JS file
  const spinnerOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Darkened overlay for better visibility
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999, // Ensure it's on top of other content
  };

  return (
    <div style={spinnerOverlayStyle}>
      <Spinner />
    </div>
  );
};

export default GlobalSpinner;