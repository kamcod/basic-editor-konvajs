import React, { useCallback, useMemo } from "react";
import { Rect, Circle, Arrow, Star } from "react-konva";
import { useAppSelector } from "@/store/hooks";
import {BasicObjectAttributes, CircleI, ArrowI, ShapeI, StarI} from "@/app/types/canvas.dto";
import useCanvasHistory from "@/hooks/useCanvasHistory";

// Hook to get default shape props and handlers
const useDefaultShapeProps = () => {
    const { updateHistory } = useCanvasHistory();

    const handleDragEnd = useCallback(() => {
        updateHistory();
    }, [updateHistory]);

    const handleTransformEnd = useCallback(() => {
        updateHistory();
    }, [updateHistory]);

    // Function to get common props from shape data
    const getCommonProps = useCallback((data: BasicObjectAttributes) => ({
        id: data.id,
        name: data.name,
        x: data.x,
        y: data.y,
        draggable: data.draggable ?? true,
        rotation: data.rotation ?? 0,
        scaleX: data.scaleX ?? 1,
        scaleY: data.scaleY ?? 1,
        offsetX: data.offsetX ?? 0,
        offsetY: data.offsetY ?? 0,
        opacity: data.opacity ?? 1,
        fill: data.fill,
        onDragEnd: handleDragEnd,
        onTransformEnd: handleTransformEnd,
    }), [handleDragEnd, handleTransformEnd]);

    return { getCommonProps, handleDragEnd, handleTransformEnd };
};

// Rectangle Shape Component
const RectangleShape = React.memo(({ data }: { data: BasicObjectAttributes }) => {
    const { getCommonProps } = useDefaultShapeProps();
    const commonProps = getCommonProps(data);

    return (
        <Rect
            {...commonProps}
            width={data.width}
            height={data.height}
        />
    );
});

RectangleShape.displayName = 'RectangleShape';

// Circle Shape Component
const CircleShape = React.memo(({ data }: { data: CircleI }) => {
    const { getCommonProps } = useDefaultShapeProps();
    const commonProps = getCommonProps(data);

    return (
        <Circle
            {...commonProps}
            radius={data.radius}
            stroke={data.stroke}
            strokeWidth={data.strokeWidth}
        />
    );
});

CircleShape.displayName = 'CircleShape';

// Arrow Shape Component
const ArrowShape = React.memo(({ data }: { data: ArrowI }) => {
    const { getCommonProps } = useDefaultShapeProps();
    const commonProps = getCommonProps(data);

    return (
        <Arrow
            {...commonProps}
            points={data.points}
            pointerLength={data.pointerLength}
            pointerWidth={data.pointerWidth}
            stroke={data.stroke}
            strokeWidth={data.strokeWidth}
        />
    );
});

ArrowShape.displayName = 'ArrowShape';

// Star Shape Component
const StarShape = React.memo(({ data }: { data: StarI }) => {
    const { getCommonProps } = useDefaultShapeProps();
    const commonProps = getCommonProps(data);

    return (
        <Star
            {...commonProps}
            stroke={data.stroke}
            strokeWidth={data.strokeWidth}
            numPoints={data.numPoints ?? 5}
            innerRadius={data.innerRadius ?? 30}
            outerRadius={data.outerRadius ?? 70}
        />
    );
});

StarShape.displayName = 'StarShape';

// Shape renderer component with proper memoization
const ShapeRenderer = React.memo(({ shape }: { shape: ShapeI }) => {
    switch (shape.type) {
        case 'Rect':
            return <RectangleShape data={shape.attributes as BasicObjectAttributes} />;
        case 'Circle':
            return <CircleShape data={shape.attributes as CircleI} />;
        case 'Arrow':
            return <ArrowShape data={shape.attributes as ArrowI} />;
        case 'Star':
            return <StarShape data={shape.attributes as StarI} />;
        default:
            console.warn(`Unknown shape type: ${shape.type}`);
            return null;
    }
});

ShapeRenderer.displayName = 'ShapeRenderer';

// Main Shapes component
export default function Shapes() {
    const { shapes } = useAppSelector(state => state.canvas);

    // Memoize the rendered shapes to prevent unnecessary re-renders
    const renderedShapes = useMemo(() => {
        return shapes.map((shape) => (
            <ShapeRenderer key={shape.attributes.id} shape={shape} />
        ));
    }, [shapes]);

    return <>{renderedShapes}</>;
}
