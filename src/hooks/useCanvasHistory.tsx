import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {extractCanvasJSON} from "@/utils/canvasUtils";
import {setSelectedObjectIds, setShapes, updateUndo, pushToRedo, popFromUndo, popFromRedo, pushToUndoWithoutClearingRedo} from "@/store/reducers/canvasSlice";
import {useCanvas} from "@/contexts/CanvasContext";

const useCanvasHistory = () => {
    const dispatch = useAppDispatch();
    const { layerRef } = useCanvas();
    const { undo: undoList, redo: redoList } = useAppSelector(state => state.canvas);


    const CANVAS_STORAGE_KEY = 'canvas_state';

    const handleLoadCanvas = (canvasString: string) => {
        const canvasData = JSON.parse(canvasString)
        dispatch(setShapes(canvasData.shapes));
        dispatch(setSelectedObjectIds(canvasData.selectedObjectIds));
    }

    const updateHistory = () => {
        const layer = layerRef.current;
        if(!layer) return;

        const stage = layer.getStage();
        const canvasData = extractCanvasJSON(stage);
        if (!canvasData) {
            return;
        }

        const jsonString = JSON.stringify(canvasData, null, 2);
        dispatch(updateUndo(jsonString));

        // Save to localStorage
        try {
            localStorage.setItem(CANVAS_STORAGE_KEY, jsonString);
            console.log("%c >>> Canvas Updated & Saved to LocalStorage!!!", "color: green; font-weight: bold;");
        } catch (error) {
            console.error("Failed to save to localStorage:", error);
            console.log("%c >>> Canvas Updated (Not Saved)!!!", "color: orange; font-weight: bold;");
        }

        console.log(canvasData);
    };

    const handleUndo = () => {
        // Need at least 2 states: current state and previous state
        if(undoList.length < 2) return;

        // Get the current state (last item in undo)
        const currentState = undoList[undoList.length - 1];

        // Remove it from undo
        dispatch(popFromUndo());

        // Add it to redo
        dispatch(pushToRedo(currentState));

        // Load the previous state (which is now the last item in undo)
        const previousState = undoList[undoList.length - 2];
        handleLoadCanvas(previousState);
    };

    const handleRedo = () => {
        if(!redoList.length) return;

        // Get the state to restore from redo
        const stateToRestore = redoList[redoList.length - 1];

        // Remove it from redo
        dispatch(popFromRedo());

        // Add it to undo (without clearing redo)
        dispatch(pushToUndoWithoutClearingRedo(stateToRestore));

        // Load the state
        handleLoadCanvas(stateToRestore);
    };

    return { updateHistory, handleUndo, handleRedo }
};

export default useCanvasHistory;