import { createSlice } from "@reduxjs/toolkit";

type initialStateType = {
    mode: "light" | "dark"
}

const initialState : initialStateType = {
    mode: "dark"
}


const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        toggleTheme(state) {
            state.mode = state.mode === "dark" ? "light" : "dark";
        }
    }
});

export const {toggleTheme} =  themeSlice.actions;
export default themeSlice.reducer;