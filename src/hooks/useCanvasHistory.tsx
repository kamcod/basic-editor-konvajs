import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {extractCanvasJSON} from "@/utils/canvasUtils";
import {setSelectedObjectIds, setShapes, updateRedo, updateUndo} from "@/store/reducers/canvasSlice";
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
        const data = [...undoList];
        if(!data.length) return;
        const canvasString = data.pop();
        handleLoadCanvas(canvasString);
        dispatch(updateRedo(canvasString));
    };
    const handleRedo = () => {
        const data = [...redoList];
        if(!data.length) return;
        const canvasString = data.pop();
        handleLoadCanvas(canvasString);
        dispatch(updateUndo(canvasString));
    };

    return { updateHistory, handleUndo, handleRedo }
};

export default useCanvasHistory;