import { createSlice } from "@reduxjs/toolkit";

const bootstrapSlice = createSlice({
  name: "bootstrap",
  initialState: {
    bootstrapData: null,
    loadingBootstrap: false,
    errorBootstrap: null,
  },
  reducers: {
    setBootstrap: (state, action) => {
      state.bootstrapData = action.payload;
    },
    clearBootstrapState: (state) => {
      state.bootstrapData = null;
      state.loadingBootstrap = false;
      state.errorBootstrap = null;
    },
  },
});

export const { setBootstrap, clearBootstrapState } = bootstrapSlice.actions;
export default bootstrapSlice.reducer;