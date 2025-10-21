"use client";

import dynamic from "next/dynamic";
import { useAppDispatch } from "@/store/hooks";
import { addRectangle } from "@/store/rectanglesSlice";

const Canvas = dynamic(() => import('@/app/konva/Canvas'), {
    ssr: false,
});

export default function CanvasWrapper(){
    const dispatch = useAppDispatch();

    const handleAddRect = () => {
        const newRect = {
            id: `rect-${Date.now()}`,
            x: Math.random() * 400,
            y: Math.random() * 400,
            width: 100,
            height: 60,
            fill: "#4a90e2",
        };
        dispatch(addRectangle(newRect));
    }

    return (
        <div className="flex gap-4">
            {/*Side bar*/}
            <div className="min-h-screen w-30 flex flex-col gap-2 items-center py-6 border-r border-gray-200">
                <button onClick={handleAddRect}>Add Rectangle</button>
            </div>
            <Canvas />
        </div>
    )
}