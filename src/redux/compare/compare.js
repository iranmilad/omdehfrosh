import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [], // now it's an array of { category, items }
};

const compareSlice = createSlice({
  name: "compare",
  initialState,
  reducers: {
    addToCompare: (state, action) => {
      const { category, id } = action.payload;

      const existingCategory = state.items.find((c) => c.category === category);

      if (existingCategory) {
        if (
          !existingCategory.items.includes(id) &&
          existingCategory.items.length < 4
        ) {
          existingCategory.items.push(id);
        }
      } else {
        state.items.push({ category, items: [id] });
      }
    },
    removeFromCompare: (state, action) => {
      const { category, id } = action.payload;

      const existingCategory = state.items.find((c) => c.category === category);
      if (existingCategory) {
        existingCategory.items = existingCategory.items.filter((item) => item !== id);
        if (existingCategory.items.length === 0) {
          // Optional: remove the category if it's now empty
          state.items = state.items.filter((c) => c.category !== category);
        }
      }
    },
    setCompareList: (state, action) => {
      state.items = action.payload;
    },
    clearCompareList: (state, action) => {
      const category = action?.payload;
      if (category) {
        state.items = state.items.filter((c) => c.category !== category);
      } else {
        state.items = [];
      }
    },
  },
});

export const {
  addToCompare,
  removeFromCompare,
  setCompareList,
  clearCompareList,
} = compareSlice.actions;

export default compareSlice.reducer;
