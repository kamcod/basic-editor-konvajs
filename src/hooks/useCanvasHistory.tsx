import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {extractCanvasJSON} from "@/utils/canvasUtils";
import {setSelectedObjectIds, setShapes, saveState, moveToRedo, moveToUndo} from "@/store/reducers/canvasSlice";
import {useCanvas} from "@/contexts/CanvasContext";
import * as Y from 'yjs';
import {useCallback, useRef, useEffect} from "react";

interface UseCanvasHistoryProps {
    ydoc?: Y.Doc | null;
}

const useCanvasHistory = ({ ydoc: ydocProp }: UseCanvasHistoryProps = {}) => {
    const dispatch = useAppDispatch();
    const { layerRef, ydoc: ydocContext } = useCanvas();
    const { undo: undoList, redo: redoList } = useAppSelector(state => state.canvas);
    const yjsSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Use provided ydoc or fall back to context ydoc
    const ydoc = ydocProp || ydocContext;


    const CANVAS_STORAGE_KEY = 'canvas_state';

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (yjsSyncTimeoutRef.current) {
                clearTimeout(yjsSyncTimeoutRef.current);
            }
        };
    }, []);

    // Debounced Yjs sync function
    const syncToYjs = useCallback((canvasData: any) => {
        if (!ydoc) {
            console.warn("%c >>> Cannot sync to Yjs: ydoc is null", "color: orange; font-weight: bold;");
            return;
        }

        // Clear existing timeout
        if (yjsSyncTimeoutRef.current) {
            clearTimeout(yjsSyncTimeoutRef.current);
        }

        // Set new timeout for debounced sync
        yjsSyncTimeoutRef.current = setTimeout(() => {
            try {
                ydoc.transact(() => {
                    const canvasState = ydoc.getMap('canvasState');
                    canvasState.set('shapes', canvasData.shapes);
                    canvasState.set('selectedObjectIds', canvasData.selectedObjectIds);
                    canvasState.set('timestamp', Date.now());
                }, 'local-update'); // Mark as local update
                console.log("%c >>> Canvas Synced to Yjs!!!", "color: purple; font-weight: bold;", {
                    shapesCount: canvasData.shapes.length,
                    selectedCount: canvasData.selectedObjectIds.length
                });
            } catch (error) {
                console.error("Failed to sync to Yjs:", error);
            }
        }, 100); // 100ms debounce
    }, [ydoc]);

    const handleLoadCanvas = (canvasString: string) => {
        const canvasData = JSON.parse(canvasString)
        dispatch(setShapes(canvasData.shapes));
        dispatch(setSelectedObjectIds(canvasData.selectedObjectIds));
    }

    const updateHistory = useCallback(() => {
        const layer = layerRef.current;
        if(!layer) return;

        const stage = layer.getStage();
        const canvasData = extractCanvasJSON(stage);
        if (!canvasData) {
            return;
        }

        const jsonString = JSON.stringify(canvasData, null, 2);
        dispatch(saveState(jsonString));

        // Save to localStorage
        try {
            localStorage.setItem(CANVAS_STORAGE_KEY, jsonString);
            console.log("%c >>> Canvas Updated & Saved to LocalStorage!!!", "color: green; font-weight: bold;");
        } catch (error) {
            console.error("Failed to save to localStorage:", error);
            console.log("%c >>> Canvas Updated (Not Saved)!!!", "color: orange; font-weight: bold;");
        }

        // Debounced sync to Yjs for real-time collaboration
        syncToYjs(canvasData);

        console.log(canvasData);
    }, [layerRef, dispatch, syncToYjs]);

    const handleUndo = () => {
        // Need at least 2 states: current state and previous state
        if(undoList.length < 2) return;

        // Get the previous state BEFORE moving (it's the second-to-last item)
        const previousState = undoList[undoList.length - 2];

        // Move current state from undo to redo
        dispatch(moveToRedo());

        // Load the previous state
        handleLoadCanvas(previousState);
    };

    const handleRedo = () => {
        if(!redoList.length) return;

        // Get the state to restore BEFORE moving (it's the last item in redo)
        const stateToRestore = redoList[redoList.length - 1];

        // Move state from redo to undo
        dispatch(moveToUndo());

        // Load the state
        handleLoadCanvas(stateToRestore);
    };

    return { updateHistory, handleUndo, handleRedo }
};

export default useCanvasHistory;