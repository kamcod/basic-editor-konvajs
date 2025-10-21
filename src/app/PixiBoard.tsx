"use client";

import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { Viewport } from "pixi-viewport";

export default function PixiBoard() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // 🧩 Create PIXI App
        const app = new PIXI.Application();

        // Initialize with resize + background color
        app.init({
            resizeTo: window,
            backgroundColor: 0xf9fafb,
            antialias: true,
        }).then(() => {
            // ✅ In Pixi v8, use app.canvas instead of app.view
            containerRef.current?.appendChild(app.canvas);

            // 🧭 Create Infinite Viewport
            const viewport = new Viewport({
                screenWidth: window.innerWidth,
                screenHeight: window.innerHeight,
                worldWidth: 5000,
                worldHeight: 5000,
                events: app.renderer.events, // Required for Pixi v8+
            });

            app.stage.addChild(viewport);

            // Enable panning, zooming, and inertia
            viewport.drag().pinch().wheel().decelerate();

            // 🟨 Create Rectangle
            const rect = new PIXI.Graphics();
            rect.lineStyle(2, 0xd1d5db);
            rect.beginFill(0xffeb3b);
            rect.drawRoundedRect(0, 0, 200, 120, 12);
            rect.endFill();

            // 📝 Add Text
            const text = new PIXI.Text({
                text: "Hello Pixi.js",
                style: {
                    fontFamily: "Arial",
                    fontSize: 22,
                    fill: 0x333333,
                },
            });
            text.x = 30;
            text.y = 45;

            // Group rectangle + text in a container
            const frame = new PIXI.Container();
            frame.addChild(rect);
            frame.addChild(text);
            frame.x = 300;
            frame.y = 300;

            viewport.addChild(frame);

            // 🖱️ Make it draggable
            frame.eventMode = "static";
            frame.cursor = "grab";

            frame.on("pointerdown", (e) => {
                frame.dragging = true;
                frame.dragData = e.data;
                frame.dragStart = e.data.getLocalPosition(frame.parent);
                frame.cursor = "grabbing";
            });

            frame.on("pointerup", () => {
                frame.dragging = false;
                frame.cursor = "grab";
            });

            frame.on("pointerupoutside", () => {
                frame.dragging = false;
                frame.cursor = "grab";
            });

            frame.on("pointermove", (e) => {
                if (!frame.dragging) return;
                const pos = e.data.getLocalPosition(frame.parent);
                frame.x += pos.x - frame.dragStart.x;
                frame.y += pos.y - frame.dragStart.y;
                frame.dragStart = pos;
            });

            // ✅ Cleanup on unmount
            return () => {
                app.destroy(true, true);
                containerRef.current?.removeChild(app.canvas);
            };
        });
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-screen h-screen overflow-hidden"
            style={{ background: "#f9fafb" }}
        />
    );
}
