import { Stage, Layer, Rect, Transformer } from 'react-konva';
import Shapes from "@/app/canvas/components/Shapes";
import {useRef, useState, useEffect} from "react";
import { useCanvas } from "@/contexts/CanvasContext";

const Canvas = () => {
    const isSelecting = useRef(false);
    const transformerRef = useRef();
    const { stageRef, layerRef } = useCanvas();
    const [selectedIds, setSelectedIds] = useState([]);
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
            .find<Konva.Rect>((node) => selectedIds.includes(node.id()));

        transformer.nodes(selectedNodes);
        transformer.getLayer()?.batchDraw();
    }, [selectedIds]);

    // Click handler for stage
    const handleStageClick = (e) => {

        // If click on empty area - remove all selections
        if (e.target === e.target.getStage()) {
            setSelectedIds([]);
            return;
        }

        const clickedId = e.target.id();

        // Do we pressed shift or ctrl?
        const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
        const isSelected = selectedIds.includes(clickedId);

        if (!metaPressed && !isSelected) {
            // If no key pressed and the node is not selected
            // select just one
            setSelectedIds([clickedId]);
        } else if (metaPressed && isSelected) {
            // If we pressed keys and node was selected
            // we need to remove it from selection
            setSelectedIds(selectedIds.filter(id => id !== clickedId));
        } else if (metaPressed && !isSelected) {
            // Add the node into selection
            setSelectedIds([...selectedIds, clickedId]);
        }
    };

    const handleMouseDown = (e) => {
        if (e.target !== e.target.getStage()) {
            return;
        }

        isSelecting.current = true;
        const pos = e.target.getStage().getPointerPosition();
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

        const pos = e.target.getStage().getPointerPosition();
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

        setTimeout(() => {
            setSelectionRectangle({
                ...selectionRectangle,
                visible: false,
            });
        });
    }

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
