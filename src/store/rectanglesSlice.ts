import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RectShape {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
}

interface RectanglesState {
    rectangles: RectShape[];
    selectedId: string | null;
}

const initialState: RectanglesState = {
    rectangles: [],
    selectedId: null,
};

const rectanglesSlice = createSlice({
    name: 'rectangles',
    initialState,
    reducers: {
        addRectangle: (state, action: PayloadAction<RectShape>) => {
            state.rectangles.push(action.payload);
        },
        updateRectangle: (state, action: PayloadAction<{ id: string; updates: Partial<RectShape> }>) => {
            const index = state.rectangles.findIndex(rect => rect.id === action.payload.id);
            if (index !== -1) {
                state.rectangles[index] = { ...state.rectangles[index], ...action.payload.updates };
            }
        },
        deleteRectangle: (state, action: PayloadAction<string>) => {
            state.rectangles = state.rectangles.filter(rect => rect.id !== action.payload);
        },
        setSelectedId: (state, action: PayloadAction<string | null>) => {
            state.selectedId = action.payload;
        },
    },
});

export const { addRectangle, updateRectangle, deleteRectangle, setSelectedId } = rectanglesSlice.actions;
export default rectanglesSlice.reducer;