import { Stage, Layer, Rect } from 'react-konva';
import Shapes from "@/app/canvas/components/Shapes";
import {useRef, useState} from "react";

const Canvas = () => {
    const isSelecting = useRef(false);
    const [selectionRectangle, setSelectionRectangle] = useState({
        visible: false,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
    });

    const handleMouseDown = (e) => {
        // Do nothing if we mousedown on any shape
        if (e.target !== e.target.getStage()) {
            return;
        }

        // Start selection rectangle
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
        // Do nothing if we didn't start selection
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
        // Do nothing if we didn't start selection
        if (!isSelecting.current) {
            return;
        }
        isSelecting.current = false;

        // Update visibility in timeout, so we can check it in click event
        setTimeout(() => {
            setSelectionRectangle({
                ...selectionRectangle,
                visible: false,
            });
        });
    }

    return (
        <Stage
            width={window.innerWidth * 0.8}
            height={window.innerHeight * 0.9}
            style={{background: 'white', border: '1px solid gray'}}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
        >
            <Layer>
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
            </Layer>
        </Stage>
    );
};

export default Canvas;
