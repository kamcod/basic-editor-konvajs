import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {ShapeI} from "@/app/types/canvas.dto";

interface InitialStateI {
    shapes: ShapeI[];
    selectedObjectIds: string[];
}

const initialState: InitialStateI = {
    shapes: [],
    selectedObjectIds: [],
};

const canvasSlice = createSlice({
    name: 'canvas',
    initialState,
    reducers: {
        setShapes: (state, action: PayloadAction<ShapeI[]>) => {
            state.shapes.push(action.payload);
        },
        setSelectedObjectIds: (state, action: PayloadAction<string[]>) => {
            state.selectedObjectIds = action.payload;
        },
    },
});

export const { setShapes, setSelectedObjectIds } = canvasSlice.actions;
export default canvasSlice.reducer;