import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./slices/themeSlice";
import animationReducer from "./slices/animationSlice";
import controlReducer from "./slices/controlsSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    animation: animationReducer,
    control: controlReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
