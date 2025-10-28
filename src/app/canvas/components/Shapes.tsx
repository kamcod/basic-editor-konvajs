import React, {useEffect} from "react";
import {Rect, Circle, Arrow} from "react-konva";
import {useAppSelector} from "@/store/hooks";
import {BasicObjectAttributes, CircleI, ArrowI, ShapeI} from "@/app/types/canvas.dto";
import { useCanvas } from "@/contexts/CanvasContext";
import useCanvasHistory from "@/hooks/useCanvasHistory";

const Rectangle = ( { data }: { data: BasicObjectAttributes }) => {
    const { updateHistory } = useCanvasHistory();
    const { id, name, x, y, width, height, fill, rotation, draggable, scaleX, scaleY, offsetX, offsetY, opacity } = data;

    const handleDragEnd = () => {
        updateHistory();
    };

    const handleTransformEnd = () => {
        updateHistory();
    };

    return <Rect
        id={id}
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        name={name}
        rotation={rotation}
        draggable={draggable ?? true}
        scaleX={scaleX ?? 1}
        scaleY={scaleY ?? 1}
        offsetX={offsetX ?? 0}
        offsetY={offsetY ?? 0}
        opacity={opacity ?? 1}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
    />
}

const AddCircle = ( { data }: { data: CircleI }) => {
    const { updateHistory } = useCanvasHistory();
    const { id, name, x, y, radius, stroke, strokeWidth, fill, draggable, scaleX, scaleY, offsetX, offsetY, opacity } = data;

    const handleDragEnd = () => {
        updateHistory();
    };

    const handleTransformEnd = () => {
        updateHistory();
    };

    return <Circle
        id={id}
        name={name}
        x={x}
        y={y}
        radius={radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        draggable={draggable ?? true}
        scaleX={scaleX ?? 1}
        scaleY={scaleY ?? 1}
        offsetX={offsetX ?? 0}
        offsetY={offsetY ?? 0}
        opacity={opacity ?? 1}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
    />
}
const AddArrow = ( { data }: { data: ArrowI }) => {
    const { updateHistory } = useCanvasHistory();
    const { id, name, x, y, points, pointerLength, pointerWidth, fill, stroke, strokeWidth, draggable, rotation, scaleX, scaleY, offsetX, offsetY, opacity } = data;

    const handleDragEnd = () => {
        updateHistory();
    };

    const handleTransformEnd = () => {
        updateHistory();
    };

    return <Arrow
        id={id}
        name={name}
        x={x}
        y={y}
        points={points}
        pointerLength={pointerLength}
        pointerWidth={pointerWidth}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        draggable={draggable ?? true}
        rotation={rotation ?? 0}
        scaleX={scaleX ?? 1}
        scaleY={scaleY ?? 1}
        offsetX={offsetX ?? 0}
        offsetY={offsetY ?? 0}
        opacity={opacity ?? 1}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
    />
}
const renderShapes = (shape: ShapeI, index: number) => {
    switch (shape.type) {
        case 'Rect':
            return <Rectangle key={index} data={shape.attributes as BasicObjectAttributes} />
        case 'Circle':
            return <AddCircle key={index} data={shape.attributes as CircleI} />
        case 'Arrow':
            return <AddArrow key={index} data={shape.attributes as ArrowI} />
        default:
            return <Rectangle key={index} data={shape.attributes as BasicObjectAttributes} />
    }
};

export default function Shapes(){
    const { shapes } = useAppSelector(state => state.canvas);
    return (
        <>
            {shapes.map((shape, index) => (
                renderShapes(shape, index)
            ))}
        </>
    )
}