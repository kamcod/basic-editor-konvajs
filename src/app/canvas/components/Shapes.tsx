import {Rect, Circle} from "react-konva";
import {ShapeI} from "@/app/types/canvas.dto";

const shapes: ShapeI[] = [
    {
        type: 'rectangle',
        attributes: {
            id: `rect-${Date.now()}`,
            x: Math.random() * 400,
            y: Math.random() * 400,
            width: 100,
            height: 60,
            fill: "#4a90e2",
            rotation: 0,
        }
    },
    {
        type: 'circle',
        attributes: {
            id: `rect-${Date.now()}`,
            x: Math.random() * 400,
            y: Math.random() * 400,
            radius: 100,
            fill: "#4a90e2"
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
        x={x}
        y={y}
        radius={radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        draggable={draggable ?? true}
    />
}
const renderShapes = (shape, index) => {
    switch (shape.type) {
        case 'rectangle':
            return <Rectangle key={index} data={shape.attributes} />
        case 'circle':
            return <AddCircle key={index} data={shape.attributes} />
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