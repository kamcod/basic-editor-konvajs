import { Stage, Layer, Rect, Transformer } from 'react-konva';
import Shapes from "@/app/canvas/components/Shapes";
import { useRef, useEffect } from "react";
import { useCanvas } from "@/contexts/CanvasContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSelectedObjectIds, setShapes } from "@/store/reducers/canvasSlice";
import Konva from "konva";
import useCanvasHistory from "@/hooks/useCanvasHistory";
import { useCanvasEvents } from "@/hooks/useCanvasEvents";
import {useYjsConnection} from "@/hooks/useYjsConnection";

const Canvas = () => {
    const { ydoc, provider } = useYjsConnection('canvas-real-time');

    const transformerRef = useRef<Konva.Transformer>(null);
    const selectionOverlayRef = useRef<Konva.Rect>(null);
    const { stageRef, layerRef, zoom, setYdoc } = useCanvas();
    const dispatch = useAppDispatch();
    const { updateHistory } = useCanvasHistory({ ydoc });
    const initialStateSaved = useRef(false);

    // Set ydoc in context so all components can access it
    useEffect(() => {
        if (ydoc) {
            setYdoc(ydoc);
        }
    }, [ydoc, setYdoc]);

    const { selectedObjectIds } = useAppSelector(state => state.canvas);

    useEffect(() => {
        if (!ydoc) return;

        const canvasState = ydoc.getMap('canvasState');

        // Load initial state if available
        const shapes = canvasState.get('shapes');
        const selectedObjectIds = canvasState.get('selectedObjectIds');

        console.log('canvas state from collaboration', shapes, selectedObjectIds);
        if (shapes && Array.isArray(shapes) && shapes.length > 0) {
            dispatch(setShapes(shapes));
            if (selectedObjectIds && Array.isArray(selectedObjectIds)) {
                dispatch(setSelectedObjectIds(selectedObjectIds));
            }
            console.log('🟦 Loaded initial canvas state from Yjs');
        }

        // Observe changes from other users
        const observer = (event: any, transaction: any) => {
            // Ignore local updates (our own changes)
            if (transaction.origin === 'local-update') {
                return;
            }

            // This is a remote update from another user
            const updatedShapes = canvasState.get('shapes');
            const updatedSelectedIds = canvasState.get('selectedObjectIds');

            if (updatedShapes && Array.isArray(updatedShapes)) {
                dispatch(setShapes(updatedShapes));
                if (updatedSelectedIds && Array.isArray(updatedSelectedIds)) {
                    dispatch(setSelectedObjectIds(updatedSelectedIds));
                }
                console.log('🟦 Received remote canvas update from Yjs:', updatedShapes.length, 'shapes');
            }
        };

        canvasState.observe(observer);

        return () => {
            canvasState.unobserve(observer);
        };
    }, [ydoc, dispatch]);

    // Save initial state to undo on mount
    useEffect(() => {
        if (!initialStateSaved.current && stageRef.current) {
            updateHistory();
            initialStateSaved.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Expose stage to window for debugging
    useEffect(() => {
        if (stageRef.current) {
            window.canvas = stageRef.current;
            console.log("%c >>> Canvas exposed to window.canvas for debugging", "color: purple; font-weight: bold;");
        }
    }, [stageRef]);

    // Selection change handler
    const handleSelectionChange = (ids: string[]) => {
        dispatch(setSelectedObjectIds(ids));
    };

    // Use unified canvas events hook
    const {
        overlayRect,
        handleOverlayDragStart,
        handleOverlayDragMove,
        handleOverlayDragEnd,
        selectionRectangle,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleStageClick,
    } = useCanvasEvents({
        transformerRef,
        layerRef,
        selectedObjectIds,
        onSelectionChange: handleSelectionChange,
    });

    return (
        <div
            className="overflow-auto"
            style={{
                maxWidth: window.innerWidth * 0.8,
                maxHeight: window.innerHeight * 0.7,
                background: 'white'
            }}
        >
            <Stage
                ref={stageRef}
                width={window.innerWidth * 0.8 * (zoom / 100)}
                height={window.innerHeight * 0.7 * (zoom / 100)}
                style={{ background: 'white' }}
                onClick={handleStageClick}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
            >
                <Layer ref={layerRef}>
                    <Shapes />

                    {/* Selection rectangle */}
                    {selectionRectangle.visible && (
                        <Rect
                            x={Math.min(selectionRectangle.x1, selectionRectangle.x2)}
                            y={Math.min(selectionRectangle.y1, selectionRectangle.y2)}
                            width={Math.abs(selectionRectangle.x2 - selectionRectangle.x1)}
                            height={Math.abs(selectionRectangle.y2 - selectionRectangle.y1)}
                            fill="rgba(59, 130, 246, 0.1)"
                            stroke="rgba(59, 130, 246, 0.4)"
                            strokeWidth={1}
                            dash={[4, 4]}
                            listening={false}
                        />
                    )}

                    {/* Draggable overlay for empty space between shapes */}
                    {overlayRect.visible && (
                        <Rect
                            id="selection-overlay"
                            ref={selectionOverlayRef}
                            x={overlayRect.x}
                            y={overlayRect.y}
                            width={overlayRect.width}
                            height={overlayRect.height}
                            fill="transparent"
                            draggable={overlayRect.listening}
                            listening={overlayRect.listening}
                            onDragStart={handleOverlayDragStart}
                            onDragMove={handleOverlayDragMove}
                            onDragEnd={handleOverlayDragEnd}
                        />
                    )}

                    {/* Transformer for selected objects */}
                    <Transformer
                        ref={transformerRef}
                        borderStroke="#3b82f6"
                        borderStrokeWidth={2}
                        anchorStroke="#3b82f6"
                        anchorFill="#ffffff"
                        anchorSize={8}
                        anchorCornerRadius={2}
                        boundBoxFunc={(oldBox, newBox) => {
                            // Limit resize
                            if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                            }
                            return newBox;
                        }}
                    />
                </Layer>
            </Stage>
        </div>
    );
};

export default Canvas;
