import { createSlice } from "@reduxjs/toolkit";
import { getBootstrap } from "./bootstrapActions";

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
  extraReducers: (builder) => {
    builder
      .addCase(getBootstrap.pending, (state) => {
        state.loadingBootstrap = true;
        state.errorBootstrap = null;
      })
      .addCase(getBootstrap.fulfilled, (state, action) => {
        state.loadingBootstrap = false;
        state.bootstrapData = action.payload || null;
      })
      .addCase(getBootstrap.rejected, (state, action) => {
        state.loadingBootstrap = false;
        state.errorBootstrap = action.payload;
      });
  },
});

export const { setBootstrap, clearBootstrapState } = bootstrapSlice.actions;
export default bootstrapSlice.reducer;