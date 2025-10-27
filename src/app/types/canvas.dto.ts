export interface BasicObjectAttributes {
    id: string;
    name?: string;
    width?: number;
    height?: number;
    x: number;
    y: number;
    rotation?: number;
    draggable?: boolean;
    fill?: string;
    scaleX?: number;
    scaleY?: number;
    offsetX?: number;
    offsetY?: number;
    opacity?: number;
}

export interface CircleI extends BasicObjectAttributes{
    radius: number;
    stroke?: string;
    strokeWidth?: number;
}

export interface ArrowI extends BasicObjectAttributes {
    points: number[];
    pointerLength: number;
    pointerWidth: number;
    stroke: string;
    strokeWidth: number;
}

export type ShapeType = 'Rect' | 'Circle' | 'Arrow'
export interface ShapeI {
    type: ShapeType;
    attributes: BasicObjectAttributes | CircleI | ArrowI;
}
