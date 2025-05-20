import io, { Socket } from 'socket.io-client'; 
import store, { RootState } from '../store/store'; 
import {
    // Old handlers removed:
    // handleMatchFound, 
    // handleMatchConfirmedByOne,
    // handleMatchApproved,
    // handleMatchRejected,
    handleGenericSwapUpdate, // This is the primary handler for new system
    // setMyActiveSwapRequest // If direct manipulation of active swap is needed from socket event
} from '../store/slices/swapSlice';
import { APISwapRequest, NewSwapRequestStatusType } from '../apiServiceTypes';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000'; 
let socket: Socket | null = null; 

// These payload interfaces were for the old matchmaking system and might be deprecated
// interface MatchFoundSocketPayload { 
//     userRequest: APISwapRequest; 
//     matchedRequest: APISwapRequest; 
// }
// interface MatchConfirmedSocketPayload { 
//     confirmedRequest: APISwapRequest; 
// }
// interface MatchApprovedSocketPayload { 
//     userRequest: APISwapRequest; 
//     otherRequest: APISwapRequest; 
// }
// interface MatchRejectedSocketPayload { 
//     rejectedRequest: APISwapRequest;
//     requeuedRequest: APISwapRequest; 
//     rejectedByUsername?: string;
// }
// interface SwapCancelledSocketPayload { 
//     swapId: string;
//     newStatus: NewSwapRequestStatusType; 
//     otherMatchedRequestId?: string; 
//     newStatusForOther?: NewSwapRequestStatusType; 
// }

export const initSocket = () => {
  if (socket && socket.connected) {
    return socket;
  }

  const state: RootState = store.getState();
  const currentUserId = state.auth.user?._id;

  if (!currentUserId) {
    console.warn("SocketService: Cannot initialize socket without currentUserId.");
    return null;
  }

  console.log(`SocketService: Initializing socket connection for user ${currentUserId} to ${SOCKET_URL}`);
  socket = io(SOCKET_URL, { 
    query: { userId: currentUserId }, 
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
  });

  socket.on('connect', () => {
    console.log('SocketService: Connected successfully.', socket?.id);
  });

  // Generic event from backend indicating a swap request was updated
  // This is the primary event handler for the new direct swap system
  socket.on('swap_request_updated', (data: APISwapRequest) => { 
    console.log('SocketService: Received swap_request_updated', data);
    store.dispatch(handleGenericSwapUpdate(data));
  });
  
  // Specific events for the new direct swap lifecycle (examples)
  // The backend should emit these to relevant users (requester, recipient, admins)
  // All these can potentially use handleGenericSwapUpdate if the payload is the full APISwapRequest object
  socket.on(`swap_request_created_for_recipient_${currentUserId}`, (data: APISwapRequest) => {
    console.log(`SocketService: Received new swap request targeted at me:`, data);
    store.dispatch(handleGenericSwapUpdate(data)); 
  });

  socket.on(`swap_request_response_update_${currentUserId}`, (data: APISwapRequest) => {
    console.log(`SocketService: Update on a swap I'm involved in (response from other party):`, data);
    store.dispatch(handleGenericSwapUpdate(data));
  });

  socket.on(`swap_request_admin_review_update_${currentUserId}`, (data: APISwapRequest) => {
    console.log(`SocketService: Update on a swap I'm involved in (admin review):`, data);
    store.dispatch(handleGenericSwapUpdate(data));
  });
  
  socket.on(`swap_request_completed_${currentUserId}`, (data: { updatedSwapRequest: APISwapRequest, schedulesModified: boolean }) => {
    console.log(`SocketService: Swap request completed and schedules updated:`, data.updatedSwapRequest);
    store.dispatch(handleGenericSwapUpdate(data.updatedSwapRequest));
    if (data.schedulesModified) {
        console.log("SocketService: Schedules were modified, client should refetch if necessary.");
        // Example: if (store.getState().auth.user?._id === data.updatedSwapRequest.requester || store.getState().auth.user?._id === data.updatedSwapRequest.recipientUser) {
        //   store.dispatch(fetchEmployeeSchedule(store.getState().auth.user!._id));
        // }
    }
  });

  socket.on(`swap_request_cancelled_by_initiator_${currentUserId}`, (data: APISwapRequest) => {
    console.log(`SocketService: Received swap_request_cancelled_by_initiator_${currentUserId}`, data);
    store.dispatch(handleGenericSwapUpdate(data)); 
  });

  // General notification listener
  socket.on('notification', (data: { message: string, type?: string, details?: any, title?: string }) => {
    console.log('SocketService: Received notification', data);
    // Example: store.dispatch(addNotification({_id: new Date().toISOString(), userId: currentUserId, isRead: false, createdAt: new Date().toISOString(), ...data}));
  });

  socket.on('disconnect', (reason: string) => { 
    console.log('SocketService: Disconnected.', reason);
    if (reason === 'io server disconnect') {
      socket?.connect();
    }
  });

  socket.on('connect_error', (err: Error) => { 
    console.error('SocketService: Connection Error.', err.message, err.name, err.stack);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('SocketService: Disconnecting socket.');
    socket.disconnect();
    socket = null;
  }
};