import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ControlsState {
  minPopulation: number;
  heightMultiplier: number;
}

const initialState: ControlsState = {
  minPopulation: 0,
  heightMultiplier: 0.5,
};

const controlsSlice = createSlice({
  name: "controls",
  initialState,
  reducers: {
    setMinPopulation: (state, action: PayloadAction<number>) => {
        state.minPopulation = action.payload;
    },
    setHeightMultiplier: (state, action: PayloadAction<number>)=>{
        state.heightMultiplier = action.payload;
    }
  },
});

export const {setMinPopulation, setHeightMultiplier} = controlsSlice.actions;
export default controlsSlice.reducer;