import { Stage, Layer } from 'react-konva';
import Shapes from "@/app/canvas/components/Shapes";

const Canvas = () => {
    return (
        <Stage
            width={window.innerWidth * 0.8}
            height={window.innerHeight * 0.9}
            style={{background: 'white', border: '1px solid gray'}}
        >
            <Layer>
                <Shapes />
            </Layer>
        </Stage>
    );
};

export default Canvas;
