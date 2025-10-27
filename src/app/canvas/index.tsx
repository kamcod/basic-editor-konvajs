"use client";

import dynamic from "next/dynamic";
import Toolbar from "@/app/canvas/Toolbar";
import { useAppDispatch } from "@/store/hooks";
import { setShapes, setSelectedObjectIds } from "@/store/reducers/canvasSlice";
import { loadCanvasFromLocalStorage } from "@/utils/canvasUtils";

const Canvas = dynamic(() => import('@/app/canvas/Canvas'), {
    ssr: false,
});

export default function CanvasWrapper(){
    const dispatch = useAppDispatch();

    const handleLogJSON = () => {
        console.log("Canvas data logged");
    }

    const handleLoadCanvas = () => {
        const canvasData = loadCanvasFromLocalStorage();

        if (canvasData) {
            dispatch(setShapes(canvasData.shapes));
            dispatch(setSelectedObjectIds(canvasData.selectedObjectIds));
            console.log("%c ✓ Canvas loaded successfully!", "color: blue; font-weight: bold;");
        } else {
            alert("No saved canvas data found!");
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="flex items-center justify-between py-4 px-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Canvas Editor
                            </h1>
                            <p className="text-xs text-gray-500">Design & Create</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleLoadCanvas}
                            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Load Canvas
                        </button>
                        <button
                            onClick={handleLogJSON}
                            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                            </svg>
                            Export JSON
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex h-[calc(100vh-78px)]">
                <Toolbar />
                <div className="flex-1 flex justify-center items-center bg-gray-100 px-6 py-3">
                    <Canvas />
                </div>
            </div>
        </div>
    )
}