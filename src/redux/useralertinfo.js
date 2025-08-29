import { createSlice } from "@reduxjs/toolkit";

// Define initial state
const initialState = {
  alertType: "",
  price: "",
  inventory: "",
  supplierSelection: "all",
  selectedSuppliers: [],
  sms: true,
  email: false,
};

// Create slice
const userAlertInfoSlice = createSlice({
  name: "userAlertInfo",
  initialState,
  reducers: {
    setAlertInfo: (state, action) => {
      const {
        alertType,
        price,
        inventory,
        supplierSelection,
        selectedSuppliers,
        sms,
        email,
      } = action.payload;

      state.alertType = alertType || state.alertType;
      state.price = price || state.price;
      state.inventory = inventory || state.inventory;
      state.supplierSelection = supplierSelection || state.supplierSelection;
      state.selectedSuppliers = selectedSuppliers || state.selectedSuppliers;
      state.sms = sms ?? state.sms;
      state.email = email ?? state.email;
    },
    resetAlertInfo: (state) => {
      state = initialState; // Reset to initial state
    }
  },
});

export const { setAlertInfo, resetAlertInfo } = userAlertInfoSlice.actions;
export default userAlertInfoSlice.reducer;
