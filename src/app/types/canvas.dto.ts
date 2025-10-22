export interface BasicObjectAttributes {
    id: string;
    name?: string;
    width: number;
    height: number;
    x: number;
    y: number;
    rotation?: number;
    draggable: boolean;
}

interface CircleI extends BasicObjectAttributes {
    radius: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
}
export interface ShapeI {
    type: 'rectangle' | 'circle';
    attributes: BasicObjectAttributes | CircleI;
}
