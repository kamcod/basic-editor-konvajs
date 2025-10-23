import { Stage, Layer, Rect, Transformer } from 'react-konva';
import Shapes from "@/app/canvas/components/Shapes";
import {useRef, useState, useEffect} from "react";
import { useCanvas } from "@/contexts/CanvasContext";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {setSelectedObjectIds} from "@/store/reducers/canvasSlice";

const Canvas = () => {
    const isSelecting = useRef(false);
    const transformerRef = useRef();
    const { stageRef, layerRef } = useCanvas();
    const dispatch = useAppDispatch();

    const { selectedObjectIds } = useAppSelector(state => state.canvas);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
    const [selectionRectangle, setSelectionRectangle] = useState({
        visible: false,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
    });

    useEffect(() => {
        const layer = layerRef.current;
        const transformer = transformerRef.current;
        if (!layer || !transformer) return;

        const stage = layer.getStage();
        const selectedNodes = stage
            .find<Konva.Rect>((node) => selectedObjectIds.includes(node.id()));

        transformer.nodes(selectedNodes);
        transformer.getLayer()?.batchDraw();
    }, [selectedObjectIds]);

    const handleMouseDown = (e) => {

        if (e.target !== e.target.getStage()) {
            return;
        }

        const pos = e.target.getStage().getPointerPosition();
        setDragStartPos(pos);
        setIsDragging(false);

        isSelecting.current = true;
        setSelectionRectangle({
            visible: true,
            x1: pos.x,
            y1: pos.y,
            x2: pos.x,
            y2: pos.y,
        });
    };

    const handleMouseMove = (e) => {
        if (!isSelecting.current) {
            return;
        }
        if (!dragStartPos) return;

        const pos = e.target.getStage().getPointerPosition();
        const dx = Math.abs(pos.x - dragStartPos.x);
        const dy = Math.abs(pos.y - dragStartPos.y);

        // if mouse moved more than a few pixels, it's a drag
        if (dx > 5 || dy > 5) {
            setIsDragging(true);
        }

        setSelectionRectangle({
            ...selectionRectangle,
            x2: pos.x,
            y2: pos.y,
        });
    };

    const handleMouseUp = () => {
        if (!isSelecting.current) {
            return;
        }
        isSelecting.current = false;

        // Select all objects or shapes under the selection rectangle
        const layer = layerRef.current;
        if (!layer) return;

        const selBox = {
            x: Math.min(selectionRectangle.x1, selectionRectangle.x2),
            y: Math.min(selectionRectangle.y1, selectionRectangle.y2),
            width: Math.abs(selectionRectangle.x2 - selectionRectangle.x1),
            height: Math.abs(selectionRectangle.y2 - selectionRectangle.y1),
        };

        // Only proceed if selection box has meaningful size
        if (selBox.width < 2 && selBox.height < 2) {
            return;
        }

        // Find all shapes that intersect with selection rectangle
        const allNodes = layer.getChildren();
        const shapes = allNodes.filter((node) => {
            // Skip transformer and selection rectangle itself
            const className = node.getClassName();
            if (className === 'Transformer' || !node.id()) {
                return false;
            }

            const nodeBox = node.getClientRect();

            // Check if boxes intersect
            return !(
                nodeBox.x > selBox.x + selBox.width ||
                nodeBox.x + nodeBox.width < selBox.x ||
                nodeBox.y > selBox.y + selBox.height ||
                nodeBox.y + nodeBox.height < selBox.y
            );
        });

        const ids = shapes.map(shape => shape.id()).filter(Boolean);
        dispatch(setSelectedObjectIds(ids))

        setTimeout(() => {
            setSelectionRectangle({
                ...selectionRectangle,
                visible: false,
            });
        });
    }

    // Click handler for stage
    const handleStageClick = (e) => {
        if (isDragging) {
            setIsDragging(false);
            setDragStartPos(null);
            return;
        }

        // If click on empty area - remove all selections
        if (e.target === e.target.getStage()) {
            dispatch(setSelectedObjectIds([]))
            return;
        }

        const clickedId = e.target.id();

        // Do we pressed shift or ctrl?
        const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
        const isSelected = selectedObjectIds.includes(clickedId);

        if (!metaPressed && !isSelected) {
            // If no key pressed and the node is not selected
            // select just one
            dispatch(setSelectedObjectIds([clickedId]))
        } else if (metaPressed && isSelected) {
            // If we pressed keys and node was selected
            // we need to remove it from selection
            dispatch(setSelectedObjectIds(selectedObjectIds.filter(id => id !== clickedId)))
        } else if (metaPressed && !isSelected) {
            // Add the node into selection
            dispatch(setSelectedObjectIds([...selectedObjectIds, clickedId]))
        }
    };

    return (
        <Stage
            ref={stageRef}
            width={window.innerWidth * 0.8}
            height={window.innerHeight * 0.9}
            style={{background: 'white', border: '1px solid gray'}}
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
                        fill="rgba(0,0,255,0.5)"
                        listening={false}
                    />
                )}

                <Transformer
                    ref={transformerRef}
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
    );
};

export default Canvas;
