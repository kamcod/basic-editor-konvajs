import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {ShapeI} from "@/app/types/canvas.dto";

const DUMMY_SHAPES: ShapeI[] = [
    {
        type: 'Rect',
        attributes: {
            id: `rect-${Date.now()}`,
            x: 100,
            y: 100,
            width: 100,
            height: 60,
            fill: "#4a90e2",
            rotation: 0,
            draggable: true
        }
    },
    {
        type: 'Circle',
        attributes: {
            id: `circle-${Date.now()}`,
            x: 300,
            y: 500,
            radius: 100,
            fill: "#4a90e2",
            stroke: "#4a90e2",
            strokeWidth: 0,
            draggable: true
        }
    },
    {
        type: 'Arrow',
        attributes: {
            id: `arrow-${Date.now()}`,
            x: 400,
            y: 550,
            points: [0, 0, 100, 100],
            pointerLength: 10,
            pointerWidth: 10,
            fill: "black",
            stroke: "black",
            strokeWidth: 1,
            draggable: true
        }
    }
]

interface InitialStateI {
    shapes: ShapeI[];
    selectedObjectIds: string[];
    undo: any[],
    redo: any[]
}

const initialState: InitialStateI = {
    shapes: DUMMY_SHAPES,
    selectedObjectIds: [],
    undo: [],
    redo: []
};

const canvasSlice = createSlice({
    name: 'canvas',
    initialState,
    reducers: {
        setShapes: (state, action: PayloadAction<ShapeI[]>) => {
            state.shapes = action.payload;
        },
        addShape: (state, action: PayloadAction<ShapeI>) => {
            state.shapes.push(action.payload);
        },
        clearShapes: (state) => {
            state.shapes = [];
            state.selectedObjectIds = [];
        },
        setSelectedObjectIds: (state, action: PayloadAction<string[]>) => {
            state.selectedObjectIds = action.payload;
        },
        updateUndo: (state, action: PayloadAction<string>) => {
            state.undo.push(action.payload);
            // Clear entire redo stack when a new action happens
            state.redo = [];
        },
        pushToRedo: (state, action: PayloadAction<string>) => {
            state.redo.push(action.payload);
        },
        popFromUndo: (state) => {
            state.undo.pop();
        },
        popFromRedo: (state) => {
            state.redo.pop();
        },
        pushToUndoWithoutClearingRedo: (state, action: PayloadAction<string>) => {
            state.undo.push(action.payload);
        }
    },
});

export const { setShapes, addShape, clearShapes, setSelectedObjectIds, updateUndo, pushToRedo, popFromUndo, popFromRedo, pushToUndoWithoutClearingRedo } = canvasSlice.actions;
export default canvasSlice.reducer;