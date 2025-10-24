export interface BasicObjectAttributes {
    id: string;
    name?: string;
    width: number;
    height: number;
    x: number;
    y: number;
    rotation?: number;
    draggable?: boolean;
    fill?: string;
}

export interface CircleI {
    id: string;
    name?: string;
    x: number;
    y: number;
    radius: number;
    fill: string;
    stroke?: string;
    strokeWidth?: number;
    width?: number;
    height?: number;
    draggable?: boolean;
}

export interface ArrowI {
    id: string;
    name?: string;
    x: number;
    y: number;
    points: number[];
    pointerLength: number;
    pointerWidth: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    draggable?: boolean;
}

export interface ShapeI {
    type: 'rectangle' | 'circle' | 'arrow';
    attributes: BasicObjectAttributes | CircleI | ArrowI;
}
