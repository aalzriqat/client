
import React from 'react';
import ReceivedSwapRequests from './ReceivedSwapRequests';
import SentSwapRequests from './SentSwapRequests';

const SentReceivedSwaps = () => {
  return (
    <div className='manage-leave-main'>
      <ReceivedSwapRequests />
      <SentSwapRequests />
    </div>
  );
};

export default SentReceivedSwaps;