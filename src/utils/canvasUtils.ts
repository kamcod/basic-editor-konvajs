import Konva from "konva";
import { ShapeI } from "@/app/types/canvas.dto";

export const extractCanvasJSON = (stage: Konva.Stage | null): { shapes: ShapeI[], selectedObjectIds: string[] } | null => {
    if (!stage) {
        return null;
    }

    const layer = stage.findOne('Layer') as Konva.Layer | null;
    if (!layer) {
        return null;
    }

    const shapes: ShapeI[] = [];
    const selectedObjectIds: string[] = [];

    // Get transformer to check selected nodes
    const transformer = layer.findOne('Transformer') as Konva.Transformer | undefined;
    const selectedNodes = transformer ? transformer.nodes() : [];
    const selectedIds = selectedNodes.map(node => node.id());

    // Iterate through all children and extract shape data
    layer.getChildren().forEach((node: Konva.Node) => {
        const className = node.getClassName();
        const id = node.id();

        // Skip transformer and selection overlay
        if (!id || className === 'Transformer' || id === 'selection-overlay') {
            return;
        }

        // Check if node is selected
        if (selectedIds.includes(id)) {
            selectedObjectIds.push(id);
        }

        // Extract shape data based on type
        if (className === 'Rect') {
            const rect = node as Konva.Rect;
            const fill = rect.fill();
            shapes.push({
                type: 'rectangle',
                attributes: {
                    id: rect.id(),
                    name: rect.name(),
                    x: rect.x(),
                    y: rect.y(),
                    width: rect.width(),
                    height: rect.height(),
                    fill: typeof fill === 'string' ? fill : '#4a90e2',
                    rotation: rect.rotation(),
                    draggable: rect.draggable(),
                    scaleX: rect.scaleX(),
                    scaleY: rect.scaleY(),
                    offsetX: rect.offsetX(),
                    offsetY: rect.offsetY(),
                    opacity: rect.opacity(),
                }
            });
        } else if (className === 'Circle') {
            const circle = node as Konva.Circle;
            const fill = circle.fill();
            const stroke = circle.stroke();
            shapes.push({
                type: 'circle',
                attributes: {
                    id: circle.id(),
                    name: circle.name(),
                    x: circle.x(),
                    y: circle.y(),
                    radius: circle.radius(),
                    fill: typeof fill === 'string' ? fill : '#f08a5d',
                    stroke: typeof stroke === 'string' ? stroke : '#f08a5d',
                    strokeWidth: circle.strokeWidth() || 0,
                    draggable: circle.draggable(),
                    scaleX: circle.scaleX(),
                    scaleY: circle.scaleY(),
                    offsetX: circle.offsetX(),
                    offsetY: circle.offsetY(),
                    opacity: circle.opacity(),
                }
            });
        } else if (className === 'Arrow') {
            const arrow = node as Konva.Arrow;
            const fill = arrow.fill();
            const stroke = arrow.stroke();
            shapes.push({
                type: 'arrow',
                attributes: {
                    id: arrow.id(),
                    name: arrow.name(),
                    x: arrow.x(),
                    y: arrow.y(),
                    points: arrow.points(),
                    pointerLength: arrow.pointerLength(),
                    pointerWidth: arrow.pointerWidth(),
                    fill: typeof fill === 'string' ? fill : 'black',
                    stroke: typeof stroke === 'string' ? stroke : 'black',
                    strokeWidth: arrow.strokeWidth() || 1,
                    draggable: arrow.draggable(),
                    rotation: arrow.rotation(),
                    scaleX: arrow.scaleX(),
                    scaleY: arrow.scaleY(),
                    offsetX: arrow.offsetX(),
                    offsetY: arrow.offsetY(),
                    opacity: arrow.opacity(),
                }
            });
        }
    });

    return { shapes, selectedObjectIds };
};

const CANVAS_STORAGE_KEY = 'canvas_state';

export const logCanvasJSON = (stage: Konva.Stage | null) => {
    const canvasData = extractCanvasJSON(stage);
    if (!canvasData) {
        return;
    }

    const jsonString = JSON.stringify(canvasData, null, 2);

    // Save to localStorage
    try {
        localStorage.setItem(CANVAS_STORAGE_KEY, jsonString);
        console.log("%c >>> Canvas Updated & Saved to LocalStorage!!!", "color: green; font-weight: bold;");
    } catch (error) {
        console.error("Failed to save to localStorage:", error);
        console.log("%c >>> Canvas Updated (Not Saved)!!!", "color: orange; font-weight: bold;");
    }

    console.log(canvasData);
};

export const loadCanvasFromLocalStorage = (): { shapes: ShapeI[], selectedObjectIds: string[] } | null => {
    try {
        const storedData = localStorage.getItem(CANVAS_STORAGE_KEY);
        if (!storedData) {
            console.warn("No canvas data found in localStorage");
            return null;
        }

        const canvasData = JSON.parse(storedData);
        console.log("%c >>> Loading Canvas from LocalStorage!!!", "color: blue; font-weight: bold;");
        console.log("Shapes to load:", canvasData.shapes?.length || 0);
        console.log(canvasData);

        return canvasData;
    } catch (error) {
        console.error("Failed to load from localStorage:", error);
        return null;
    }
};

export const clearCanvasFromLocalStorage = () => {
    try {
        localStorage.removeItem(CANVAS_STORAGE_KEY);
        console.log("Canvas data cleared from localStorage");
    } catch (error) {
        console.error("Failed to clear localStorage:", error);
    }
};
