import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "cart",
  initialState: {
    items: null,
  },
  reducers: {
    updateItem: (state, action) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);
      if (existingItem) {
        existingItem.quantity = quantity;
      } else {
        state.items.push({ id, quantity });
      }
    },
    removeItem: (state, action) => {
      const { id } = action.payload;
      state.items = state.items.filter((item) => item.id !== id);
    },
    setInitial: (state,action) => {
        state.items = action.payload;
    }
  },
});

export const { updateItem, removeItem,setInitial } = slice.actions;
export default slice.reducer;
