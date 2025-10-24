import {useAppDispatch} from "@/store/hooks";

export default function Toolbar(){
    const dispatch = useAppDispatch();

    const addRectangle = () => {
        const newRect = {
            id: `rect-${Date.now()}`,
            x: Math.random() * 400,
            y: Math.random() * 400,
            width: 100,
            height: 60,
            fill: "#4a90e2",
            rotation: 0
        };
        // dispatch(setShapes(newRect));
    }
    const handleAddShapes = (shape: string) => {
        switch (shape.type) {
            case 'rectangle':
                addRectangle();
                break;
            case 'circle':
                addRectangle();
                break;
            case 'arrow':
                addRectangle();
                break;
            default:
                addRectangle();
        }
    }
    return (
        <div className="h-full w-30 flex flex-col gap-2 items-center py-6 border-r border-gray-200">
            <div className="font-semibold underline">Shapes</div>
            <button className="text-sm p-1 border border-gray-300 rounded-md" onClick={() => handleAddShapes('rectangle')}>Rectangle</button>
            <button className="text-sm p-1 border border-gray-300 rounded-md" onClick={() => handleAddShapes('circle')}>Circle</button>
            <button className="text-sm p-1 border border-gray-300 rounded-md" onClick={() => handleAddShapes('arrow')}>Arrow</button>
        </div>
    )
}