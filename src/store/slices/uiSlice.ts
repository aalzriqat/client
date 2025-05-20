import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface UIState {
  isGlobalLoading: boolean;
  // Potentially other global UI states like theme, modal visibility for a global modal, etc.
}

const initialState: UIState = {
  isGlobalLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setGlobalLoading(state, action: PayloadAction<boolean>) {
      state.isGlobalLoading = action.payload;
    },
    // Example: if you want specific actions for start/stop
    // startGlobalLoading(state) {
    //   state.isGlobalLoading = true;
    // },
    // stopGlobalLoading(state) {
    //   state.isGlobalLoading = false;
    // },
  },
});

export const { setGlobalLoading } = uiSlice.actions;
// export const { startGlobalLoading, stopGlobalLoading } = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectIsGlobalLoading = (state: RootState) => state.ui.isGlobalLoading;