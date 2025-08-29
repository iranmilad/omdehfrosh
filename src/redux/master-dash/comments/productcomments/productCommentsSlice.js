import { createSlice } from "@reduxjs/toolkit";
import { batchImportProductComments } from "./productCommentsActions";

const productCommentsSlice = createSlice({
  name: "productComments",
  initialState: {
    comments: [],
    loading: false,
    error: null,
    successMessage: null, // For success message after batch import
  },
  reducers: {
    // Optional: Add more reducers if needed (e.g., clear error or success state)
    clearProductCommentsState: (state) => {
      state.comments = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportProductComments.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportProductComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload.productComments || []; // Storing the imported comments
        state.successMessage = action.payload.message || "Product comments imported successfully!";
      })
      .addCase(batchImportProductComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProductCommentsState } = productCommentsSlice.actions;
export default productCommentsSlice.reducer;
