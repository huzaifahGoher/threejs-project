import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./slices/themeSlice";
import animationReducer from "./slices/animationSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    animation: animationReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
