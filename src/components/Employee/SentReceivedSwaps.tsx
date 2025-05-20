
import React from 'react';
import ReceivedSwapRequests from './ReceivedSwapRequests';
import SentSwapRequests from './SentSwapRequests';

const SentReceivedSwaps: React.FC = () => { // Added React.FC
  return (
    <div className='main manage-leave-main'>
      <ReceivedSwapRequests />
      <SentSwapRequests />
    </div>
  );
};

export default SentReceivedSwaps;