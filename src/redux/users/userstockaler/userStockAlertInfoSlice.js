import { createSlice } from "@reduxjs/toolkit";
import { 
  getUserStockAlertInfo, 
  setUserStockAlertInfo, 
  removeUserStockAlertInfo 
} from './userStockAlertInfoActions'

const stockAlertSlice = createSlice({
  name: "stockAlert",
  initialState: {
    alertInfo: {},
    getLoading: false,
    setLoading: false,
    removeLoading: false,
    getError: null,
    setError: null,
    removeError: null,
    setSuccess: false,
    removeSuccess: false,
  },
  reducers: {
    clearStockAlertState: (state) => {
      state.alertInfo = {};
      state.getLoading = false;
      state.setLoading = false;
      state.removeLoading = false;
      state.getError = null;
      state.setError = null;
      state.removeError = null;
      state.setSuccess = false;
      state.removeSuccess = false;
    },
    clearStockAlertInfo: (state) => {
      state.alertInfo = {};
      state.getLoading = false;
      state.setLoading = false;
      state.removeLoading = false;
      state.getError = null;
      state.setError = null;
      state.removeError = null;
      state.setSuccess = false;
      state.removeSuccess = false;
    },
    clearStockAlertErrors: (state) => {
      state.getError = null;
      state.setError = null;
      state.removeError = null;
      state.setSuccess = false;
      state.removeSuccess = false;
    },
    // NEW: Manual loading state reset for emergency situations
    resetLoadingStates: (state) => {
      state.getLoading = false;
      state.setLoading = false;
      state.removeLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handling get user stock alert info
      .addCase(getUserStockAlertInfo.pending, (state) => {
        state.getLoading = true;
        state.getError = null;
        state.setSuccess = false;
        state.removeSuccess = false;
      })
      .addCase(getUserStockAlertInfo.fulfilled, (state, action) => {
        state.getLoading = false;
        state.getError = null; // Clear any previous errors
        state.alertInfo = action.payload || {};
      })
      .addCase(getUserStockAlertInfo.rejected, (state, action) => {
        state.getLoading = false;
        state.getError = action.payload || { message: "خطای نامشخص" };
      })
      
      .addCase(setUserStockAlertInfo.pending, (state) => {
        state.setLoading = true;
        state.setError = null;
        state.setSuccess = false;
      })
      .addCase(setUserStockAlertInfo.fulfilled, (state, action) => {
        state.setLoading = false;
        state.setError = null; // Clear any previous errors
        state.alertInfo = action.payload || {};
        state.setSuccess = true;
        
        setTimeout(() => {
          state.setSuccess = false;
        }, 3000);
      })
      .addCase(setUserStockAlertInfo.rejected, (state, action) => {
        state.setLoading = false;
        state.setError = action.payload || { message: "خطای نامشخص" };
        state.setSuccess = false;
      })
      
      // Handling remove user stock alert info
      .addCase(removeUserStockAlertInfo.pending, (state) => {
        state.removeLoading = true;
        state.removeError = null;
        state.removeSuccess = false;
      })
      .addCase(removeUserStockAlertInfo.fulfilled, (state, action) => {
        state.removeLoading = false;
        state.removeError = null; // Clear any previous errors

        const defaultAlertInfo = {
          alertType: "not_selected",
          price: "",
          inventory: "",
          supplierSelection: "select",
          selectedSuppliers: [],
          sms: false,
          email: false,
        };
        
        state.alertInfo = action.payload?.userStockAlert || defaultAlertInfo;
        state.removeSuccess = true;
        
        setTimeout(() => {
          state.removeSuccess = false;
        }, 3000);
      })
      .addCase(removeUserStockAlertInfo.rejected, (state, action) => {
        state.removeLoading = false;
        state.removeError = action.payload || { message: "خطای نامشخص" };
        state.removeSuccess = false;
      });
  },
});

export const { 
  clearStockAlertState, 
  clearStockAlertInfo, 
  clearStockAlertErrors,
  resetLoadingStates 
} = stockAlertSlice.actions;

export default stockAlertSlice.reducer;