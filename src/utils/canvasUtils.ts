import Konva from "konva";
import {ShapeI, ShapeType} from "@/app/types/canvas.dto";

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
        const shapeType = className as ShapeType;
        shapes.push({
            type: shapeType,
            attributes: node.attrs
        });
    });

    return { shapes, selectedObjectIds };
};

const CANVAS_STORAGE_KEY = 'canvas_state';
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
