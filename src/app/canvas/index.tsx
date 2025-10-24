"use client";

import dynamic from "next/dynamic";
import Toolbar from "@/app/canvas/Toolbar";

const Canvas = dynamic(() => import('@/app/canvas/Canvas'), {
    ssr: false,
});

export default function CanvasWrapper(){


    return (
        <div className="min-h-screen">
            <div className="flex items-center justify-between py-4 px-6 bg-white border-b border-gray-100">
                <div className="text-cyan-500 font-bold text-lg">Canvas Editor</div>
                <button className="text-sm text-blue-500 font-semibold hover:bg-blue-50 cursor-pointer py-2 px-4 border border-blue-300 rounded-md">
                    Log JSON
                </button>
            </div>
            <div className="flex h-[calc(100vh-71px)]">
                <Toolbar />
                <div className="flex-1 flex justify-center items-center bg-gray-100 px-6 py-3">
                    <Canvas />
                </div>
            </div>
        </div>
    )
}