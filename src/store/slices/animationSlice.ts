import { createSlice } from "@reduxjs/toolkit";

interface initialStateType {
  isPlaying: boolean;
}

const initialState: initialStateType = {
  isPlaying: true,
};

const animationSlice = createSlice({
  name: "animation",
  initialState,
  reducers: {
    toggleAnimation: (state) => {
      state.isPlaying = !state.isPlaying;
    },
  },
});

export const { toggleAnimation } = animationSlice.actions;
export default animationSlice.reducer;
