import Konva from 'konva';

declare global {
    interface Window {
        canvas: Konva.Stage;
    }
}

export {};
