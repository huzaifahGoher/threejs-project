import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ControlsState {
  minPopulation: number;
  hightMultiplier: number;
}

const initialState: ControlsState = {
  minPopulation: 0,
  hightMultiplier: 0.5,
};

const controlsSlice = createSlice({
  name: "controls",
  initialState,
  reducers: {
    setMinPopulation: (state, action: PayloadAction<number>) => {
        state.minPopulation = action.payload;
    },
    setHeightMultiplier: (state, action: PayloadAction<number>)=>{
        state.hightMultiplier = action.payload;
    }
  },
});

export const {setMinPopulation, setHeightMultiplier} = controlsSlice.actions;
export default controlsSlice.reducer;