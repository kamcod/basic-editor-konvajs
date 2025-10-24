import {useAppDispatch} from "@/store/hooks";
import {addShape, clearShapes} from "@/store/reducers/canvasSlice";

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
            rotation: 0,
            draggable: true
        };
        dispatch(addShape({
            type: "rectangle",
            attributes: newRect
        }));
    }

    const addCircle = () => {
        const newCircle = {
            id: `circle-${Date.now()}`,
            x: Math.random() * 400,
            y: Math.random() * 400,
            radius: 50,
            fill: "#f08a5d",
            stroke: "#f08a5d",
            strokeWidth: 0,
            draggable: true
        };
        dispatch(addShape({
            type: "circle",
            attributes: newCircle
        }));
    }

    const addArrow = () => {
        const newArrow = {
            id: `arrow-${Date.now()}`,
            x: Math.random() * 400,
            y: Math.random() * 400,
            points: [0, 0, 100, 100],
            pointerLength: 8,
            pointerWidth: 8,
            fill: "black",
            stroke: "black",
            strokeWidth: 1,
            draggable: true
        };
        dispatch(addShape({
            type: "arrow",
            attributes: newArrow
        }));
    }

    const handleAddShapes = (shape: string) => {
        switch (shape) {
            case 'rectangle':
                addRectangle();
                break;
            case 'circle':
                addCircle();
                break;
            case 'arrow':
                addArrow();
                break;
            default:
                addRectangle();
        }
    }

    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to empty the canvas?')) {
            dispatch(clearShapes());
        }
    }

    return (
        <aside className="h-full w-64 bg-white border-r border-gray-200 flex flex-col">
            {/* Toolbar Header */}
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Tools
                </h2>
            </div>

            {/* Shapes Section */}
            <div className="p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Shapes
                </h3>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => handleAddShapes('rectangle')}
                        className="group flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all border border-gray-200 hover:border-blue-300"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="4" y="4" width="16" height="16" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Rectangle</span>
                    </button>

                    <button
                        onClick={() => handleAddShapes('circle')}
                        className="group flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all border border-gray-200 hover:border-blue-300"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="8" strokeWidth={2}/>
                        </svg>
                        <span>Circle</span>
                    </button>

                    <button
                        onClick={() => handleAddShapes('arrow')}
                        className="group flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all border border-gray-200 hover:border-blue-300"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <span>Arrow</span>
                    </button>
                </div>
            </div>

            {/* Actions Section */}
            <div className="p-4 border-t border-gray-200 mt-auto">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Actions
                </h3>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={handleClearAll}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all border border-gray-200 hover:border-red-300"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Clear All</span>
                    </button>
                </div>
            </div>
        </aside>
    )
}