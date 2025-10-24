import {Rect, Circle, Arrow} from "react-konva";
import {useAppSelector} from "@/store/hooks";
import {BasicObjectAttributes, CircleI, ArrowI, ShapeI} from "@/app/types/canvas.dto";

const Rectangle = ( { data }: { data: BasicObjectAttributes }) => {
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

const AddCircle = ( { data }: { data: CircleI }) => {
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
const AddArrow = ( { data }: { data: ArrowI }) => {
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
const renderShapes = (shape: ShapeI, index: number) => {
    switch (shape.type) {
        case 'rectangle':
            return <Rectangle key={index} data={shape.attributes as BasicObjectAttributes} />
        case 'circle':
            return <AddCircle key={index} data={shape.attributes as CircleI} />
        case 'arrow':
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