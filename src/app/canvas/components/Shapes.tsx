import {Rect, Circle, Arrow} from "react-konva";
import {ShapeI} from "@/app/types/canvas.dto";

const shapes: ShapeI[] = [
    {
        type: 'rectangle',
        attributes: {
            id: `rect-${Date.now()}`,
            x: 100,
            y: 100,
            width: 100,
            height: 60,
            fill: "#4a90e2",
            rotation: 0,
        }
    },
    {
        type: 'circle',
        attributes: {
            id: `circle-${Date.now()}`,
            x: 300,
            y: 500,
            radius: 100,
            fill: "#4a90e2"
        }
    },
    {
        type: 'arrow',
        attributes: {
            id: `arrow-${Date.now()}`,
            x: 400,
            y: 550,
            points: [0, 0, 100, 100],
            pointerLength: 10,
            pointerWidth: 10,
            fill: "black",
            stroke: "black",
            strokeWidth: 1
        }
    }
];

const Rectangle = ( { data }) => {
    const { id, name, x, y, width, height, fill, rotation, draggable } = data;
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
    />
}

const AddCircle = ( { data }) => {
    const { id, x, y, radius, stroke, strokeWidth, fill, draggable } = data;
    return <Circle
        id={id}
        x={x}
        y={y}
        radius={radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        draggable={draggable ?? true}
    />
}
const AddArrow = ( { data }) => {
    const { id, x, y, points, pointerLength, pointerWidth, fill, stroke, strokeWidth } = data;
    return <Arrow
        id={id}
        x={x}
        y={y}
        points={points}
        pointerLength={pointerLength}
        pointerWidth={pointerWidth}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
    />
}
const renderShapes = (shape, index) => {
    switch (shape.type) {
        case 'rectangle':
            return <Rectangle key={index} data={shape.attributes} />
        case 'circle':
            return <AddCircle key={index} data={shape.attributes} />
        case 'arrow':
            return <AddArrow key={index} data={shape.attributes} />
        default:
            return <Rectangle key={index} data={shape.attributes} />
    }
};

export default function Shapes(){
    return (
        <>
            {shapes.map((shape, index) => (
                renderShapes(shape, index)
            ))}
        </>
    )
}