"use client";

import React, { useRef, useEffect } from "react";
import { Stage, Layer, Rect, Transformer } from "react-konva";
import Konva from "konva";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setSelectedId, addRectangle } from "@/store/rectanglesSlice";

export default function Canvas() {
    const rectangles = useAppSelector(state => state.rectangles.rectangles);
    const selectedId = useAppSelector(state => state.rectangles.selectedId);
    const dispatch = useAppDispatch();
    const transformerRef = useRef<Konva.Transformer>(null);
    const layerRef = useRef<Konva.Layer>(null);

    // Attach transformer when selection changes
    useEffect(() => {
        const stage = layerRef.current?.getStage();
        if (!stage || !transformerRef.current) return;

        const selectedNode = stage.findOne(`#${selectedId}`);
        if (selectedNode) {
            transformerRef.current.nodes([selectedNode as Konva.Node]);
        } else {
            transformerRef.current.nodes([]);
        }

        transformerRef.current.getLayer()?.batchDraw();
    }, [selectedId]);

    const handleAddRectangle = () => {
        const newRect = {
            id: `rect-${Date.now()}`,
            x: Math.random() * 400,
            y: Math.random() * 400,
            width: 100,
            height: 60,
            fill: "#4a90e2",
        };
        dispatch(addRectangle(newRect));
    };

    return (
        <div className="p-4">
            <button
                onClick={handleAddRectangle}
                style={{ marginBottom: 10, padding: "6px 12px" }}
            >
                Add Rectangle
            </button>

            <Stage
                width={500}
                height={500}
                style={{
                    border: "1px solid red",
                    width: "500px",
                    background: "#f0f0f0",
                }}
                onMouseDown={(e) => {
                    // Deselect when clicking empty area
                    const clickedOnEmpty = e.target === e.target.getStage();
                    if (clickedOnEmpty) {
                        dispatch(setSelectedId(null));
                    }
                }}
            >
                <Layer ref={layerRef}>
                    {rectangles.map((rect) => (
                        <Rect
                            key={rect.id}
                            id={rect.id} // ✅ important for Transformer
                            x={rect.x}
                            y={rect.y}
                            width={rect.width}
                            height={rect.height}
                            fill={rect.fill}
                            stroke={rect.id === selectedId ? "black" : undefined} // highlight selected
                            strokeWidth={2}
                            draggable
                            onClick={(e) => {
                                console.log(e.target);
                                dispatch(setSelectedId(rect.id))
                            }}
                            onTap={() => dispatch(setSelectedId(rect.id))} // mobile
                        />
                    ))}

                    <Transformer
                        ref={transformerRef}
                        rotateEnabled={true}
                        resizeEnabled={true}
                        boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 20 || newBox.height < 20) {
                                return oldBox;
                            }
                            return newBox;
                        }}
                    />
                </Layer>
            </Stage>
        </div>
    );
}
