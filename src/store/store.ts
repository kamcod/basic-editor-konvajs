import { configureStore } from '@reduxjs/toolkit';
import canvasSlice from "@/store/reducers/canvasSlice";

export const store = configureStore({
    reducer: {
        canvas: canvasSlice
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;