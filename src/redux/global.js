import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "global",
  initialState: {
    loading: false,
    bootstrap: {}
  },
  reducers: {
    setBootstrap: (state,action) => {
      state.bootstrap = action.payload
    },
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

export const { toggleLoading,setBootstrap } = slice.actions;
export default slice.reducer;
