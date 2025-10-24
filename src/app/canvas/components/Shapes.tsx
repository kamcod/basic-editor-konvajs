import {Rect, Circle, Arrow} from "react-konva";
import {useAppSelector} from "@/store/hooks";
import {useEffect} from "react";

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
    const { id, x, y, points, pointerLength, pointerWidth, fill, stroke, strokeWidth, draggable } = data;
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
        draggable={draggable ?? true}
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
    const { shapes } = useAppSelector(state => state.canvas);
    useEffect(() => {
        console.log('shapes data....', shapes);
    }, [shapes])
    return (
        <>
            {shapes.map((shape, index) => (
                renderShapes(shape, index)
            ))}
        </>
    )
}