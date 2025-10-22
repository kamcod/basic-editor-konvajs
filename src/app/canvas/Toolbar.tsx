import {useAppDispatch} from "@/store/hooks";
import {addRectangle} from "@/store/rectanglesSlice";

export default function Toolbar(){
    const dispatch = useAppDispatch();

    const handleAddRect = () => {
        const newRect = {
            id: `rect-${Date.now()}`,
            x: Math.random() * 400,
            y: Math.random() * 400,
            width: 100,
            height: 60,
            fill: "#4a90e2",
            rotation: 0
        };
        dispatch(addRectangle(newRect));
    }
    return (
        <div className="min-h-screen w-30 flex flex-col gap-2 items-center py-6 border-r border-gray-200">
            <div className="font-semibold underline">Shapes</div>
            <button className="text-sm p-1 border border-gray-300 rounded-md" onClick={handleAddRect}>Rectangle</button>
            <button className="text-sm p-1 border border-gray-300 rounded-md" onClick={handleAddRect}>Circle</button>
        </div>
    )
}