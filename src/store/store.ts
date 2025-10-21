import { configureStore } from '@reduxjs/toolkit';
import rectanglesReducer from './rectanglesSlice';

export const store = configureStore({
    reducer: {
        rectangles: rectanglesReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;