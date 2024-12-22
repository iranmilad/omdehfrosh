import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "basketInfo",
  initialState: {
    values: {
      name: "",
      lastName: "",
      postalCode: "",
      province: "",
      city: "",
      phone: "",
      email: "",
      note: "",
      nationalCode: "",
      address: "",
    },
  },
  reducers: {
    updateBasketInfo: (state, action) => {
      state.values = action.payload;
    },
  },
});

export const { updateBasketInfo } = slice.actions;
export default slice.reducer;
