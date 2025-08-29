import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "cart",
  initialState: {
    items: [],
  },

  reducers: {
    updateItem: (state, action) => {
      const { productId, attributes, seller, count } = action.payload;
      const existingItem = state.items.find(
        (item) =>
          item.productId === productId &&
          JSON.stringify(item.attributes) === JSON.stringify(attributes) &&
          item.seller.id === seller.id
      );
      if (existingItem) {
        existingItem.count = count;
      } else {
        state.items.push({ productId, attributes, seller, count });
      }
    },
    removeItem: (state, action) => {
      const { productId, attributes, seller } = action.payload;
      state.items = state.items.filter(
        (item) =>
          !(item.productId === productId &&
            JSON.stringify(item.attributes) === JSON.stringify(attributes) &&
            item.seller.id === seller.id)
      );
    },
    setInitial: (state, action) => {
      if (Array.isArray(action.payload)) {
        state.items = action.payload;
      } else {
        state.items = []; // Fallback in case of invalid data
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { updateItem, removeItem, setInitial, clearCart } = slice.actions;
export default slice.reducer;