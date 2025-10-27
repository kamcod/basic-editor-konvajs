import { useCanvas } from "@/contexts/CanvasContext";

export default function ZoomBar(){
    const { stageRef, zoom, setZoom } = useCanvas();

    const ZOOM_STEP = 10;
    const MIN_ZOOM = 10;
    const MAX_ZOOM = 300;

    const handleZoomIn = () => {
        if (!stageRef.current) return;

        const newZoom = Math.min(zoom + ZOOM_STEP, MAX_ZOOM);
        const scale = newZoom / 100;

        stageRef.current.scale({ x: scale, y: scale });
        stageRef.current.batchDraw();
        setZoom(newZoom);
    };

    const handleZoomOut = () => {
        if (!stageRef.current) return;

        const newZoom = Math.max(zoom - ZOOM_STEP, MIN_ZOOM);
        const scale = newZoom / 100;

        stageRef.current.scale({ x: scale, y: scale });
        stageRef.current.batchDraw();
        setZoom(newZoom);
    };


    const handleResetZoom = () => {
        if (!stageRef.current) return;

        stageRef.current.scale({ x: 1, y: 1 });
        stageRef.current.position({ x: 0, y: 0 });
        stageRef.current.batchDraw();
        setZoom(100);
    };

    return (
        <div className="bg-white px-6 py-3 rounded-lg shadow-md flex items-center gap-4 border border-gray-200">
            <div className="flex items-center gap-2">
                {/* Zoom Out Button */}
                <button
                    onClick={handleZoomOut}
                    disabled={zoom <= MIN_ZOOM}
                    className={`p-2 rounded-lg transition-all ${
                        zoom <= MIN_ZOOM
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    title="Zoom Out"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                    </svg>
                </button>

                {/* Zoom Level Display */}
                <div className="min-w-[70px] text-center">
                    <span className="text-sm font-semibold text-gray-700">{zoom}%</span>
                </div>

                {/* Zoom In Button */}
                <button
                    onClick={handleZoomIn}
                    disabled={zoom >= MAX_ZOOM}
                    className={`p-2 rounded-lg transition-all ${
                        zoom >= MAX_ZOOM
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    title="Zoom In"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                </button>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            {/* Reset Zoom Button */}
            <button
                onClick={handleResetZoom}
                disabled={zoom === 100}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    zoom === 100
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Reset Zoom (100%)"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-sm font-medium">Reset</span>
            </button>
        </div>
    )
}