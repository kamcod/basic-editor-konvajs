"use client";

import dynamic from "next/dynamic";
import Toolbar from "@/app/canvas/Toolbar";

const Canvas = dynamic(() => import('@/app/canvas/Canvas'), {
    ssr: false,
});

export default function CanvasWrapper(){


    return (
        <div className="flex">
            <Toolbar />
            <div className="w-full bg-gray-50 flex justify-center items-center">
                <Canvas />
            </div>
        </div>
    )
}