"use client";
import React, { createContext, useContext, useRef, useState } from "react";
import Konva from "konva";

interface CanvasContextType {
    stageRef: React.RefObject<Konva.Stage | null>;
    layerRef: React.RefObject<Konva.Layer | null>;
    zoom: number;
    setZoom: (zoom: number) => void;
}

const CanvasContext = createContext<CanvasContextType | null>(null);

export function CanvasProvider({ children }: { children: React.ReactNode }) {
    const stageRef = useRef<Konva.Stage>(null);
    const layerRef = useRef<Konva.Layer>(null);
    const [zoom, setZoom] = useState(100);

    return (
        <CanvasContext.Provider value={{ stageRef, layerRef, zoom, setZoom }}>
            {children}
        </CanvasContext.Provider>
    );
}

export function useCanvas() {
    const context = useContext(CanvasContext);
    if (!context) {
        throw new Error("useCanvas must be used within CanvasProvider");
    }
    return context;
}
