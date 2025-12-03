import React from "react";
import { useAppDispatch } from "@/store/hooks";
import { addShape, clearShapes } from "@/store/reducers/canvasSlice";
import useCanvasHistory from "@/hooks/useCanvasHistory";
import { ShapeType } from "@/app/types/canvas.dto";

// Shape configuration type
interface ShapeConfig {
    type: ShapeType;
    label: string;
    icon: React.ReactElement;
    defaultAttributes: Record<string, any>;
}

// Utility function to generate random position
const getRandomPosition = () => ({
    x: Math.random() * 400,
    y: Math.random() * 400,
});

// Shape configurations - Add new shapes here!
const SHAPE_CONFIGS: ShapeConfig[] = [
    {
        type: 'Rect',
        label: 'Rectangle',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="4" y="4" width="16" height="16" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        defaultAttributes: {
            width: 100,
            height: 60,
            fill: "#4a90e2",
            rotation: 0,
            draggable: true
        }
    },
    {
        type: 'Circle',
        label: 'Circle',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8" strokeWidth={2} />
            </svg>
        ),
        defaultAttributes: {
            radius: 50,
            fill: "#f08a5d",
            stroke: "#f08a5d",
            strokeWidth: 0,
            draggable: true
        }
    },
    {
        type: 'Arrow',
        label: 'Arrow',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
        ),
        defaultAttributes: {
            points: [0, 0, 100, 100],
            pointerLength: 8,
            pointerWidth: 8,
            fill: "black",
            stroke: "black",
            strokeWidth: 1,
            draggable: true
        }
    },
    {
        type: 'Star',
        label: 'Star',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
        ),
        defaultAttributes: {
            numPoints: 5,
            innerRadius: 30,
            outerRadius: 70,
            fill: "#FFD700",
            draggable: true
        }
    },
];

// Shape factory hook
const useShapeFactory = () => {
    const dispatch = useAppDispatch();
    const { updateHistory } = useCanvasHistory();

    const createShape = (config: ShapeConfig) => {
        const id = `${config.type.toLowerCase()}-${Date.now()}`;
        const position = getRandomPosition();

        const newShape = {
            type: config.type,
            attributes: {
                id,
                ...position,
                ...config.defaultAttributes
            }
        };

        dispatch(addShape(newShape));

        // Update history after shape is added
        setTimeout(() => {
            updateHistory();
        }, 0);
    };

    return { createShape };
};

// Reusable Shape Button Component
interface ShapeButtonProps {
    config: ShapeConfig;
    onClick: () => void;
}

const ShapeButton = ({ config, onClick }: ShapeButtonProps) => (
    <button
        onClick={onClick}
        className="flex items-center justify-center p-3 text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all border border-gray-200 hover:border-blue-300"
        title={config.label}
        aria-label={`Add ${config.label}`}
    >
        {config.icon}
    </button>
);

export default function Toolbar() {
    const dispatch = useAppDispatch();
    const { updateHistory } = useCanvasHistory();
    const { createShape } = useShapeFactory();

    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to empty the canvas?')) {
            dispatch(clearShapes());

            // Update history after clearing
            setTimeout(() => {
                updateHistory();
            }, 0);
        }
    };

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
                <div className="grid grid-cols-3 gap-2">
                    {SHAPE_CONFIGS.map((config) => (
                        <ShapeButton
                            key={config.type}
                            config={config}
                            onClick={() => createShape(config)}
                        />
                    ))}
                </div>
            </div>

            {/* Actions Section */}
            <div className="p-4 border-t border-gray-200 mt-auto">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Actions
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={handleClearAll}
                        className="flex items-center justify-center p-3 text-gray-700 bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all border border-gray-200 hover:border-red-300"
                        title="Clear All"
                        aria-label="Clear All Shapes"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </aside>
    );
}
