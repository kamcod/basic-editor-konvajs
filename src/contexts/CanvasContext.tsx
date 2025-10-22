"use client";
import React, { createContext, useContext, useRef } from "react";
import Konva from "konva";

const CanvasContext = createContext<any>(null);

export function CanvasProvider({ children }: { children: React.ReactNode }) {
    const stageRef = useRef<Konva.Stage>(null);
    const layerRef = useRef<Konva.Layer>(null);

    return (
        <CanvasContext.Provider value={{ stageRef, layerRef }}>
            {children}
        </CanvasContext.Provider>
    );
}

export function useCanvas() {
    return useContext(CanvasContext);
}
