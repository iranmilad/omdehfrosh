import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "global",
  initialState: {
    loading: false
  },
  reducers: {
    toggleLoading: (state,action) => {
        state.loading = !state.loading
        if(state.loading){
          document.body.style.overflow = "hidden"
        }
        else{
          document.body.style.overflow = ""
        }
    }
  },
});

export const { toggleLoading } = slice.actions;
export default slice.reducer;
