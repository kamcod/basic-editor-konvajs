import { Stage, Layer, Rect, Transformer } from 'react-konva';
import Shapes from "@/app/canvas/components/Shapes";
import {useRef, useState, useEffect} from "react";
import { useCanvas } from "@/contexts/CanvasContext";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {setSelectedObjectIds} from "@/store/reducers/canvasSlice";
import Konva from "konva";
import useCanvasHistory from "@/hooks/useCanvasHistory";
import {useYjsConnection} from "@/hooks/useYjsConnection";

const Canvas = () => {
    const { ydoc, provider } = useYjsConnection('canvas-real-time');

    const isSelecting = useRef(false);
    const transformerRef = useRef<Konva.Transformer>(null);
    const selectionOverlayRef = useRef<Konva.Rect>(null);
    const { stageRef, layerRef, zoom } = useCanvas();
    const dispatch = useAppDispatch();
    const { updateHistory } = useCanvasHistory();
    const initialStateSaved = useRef(false);

    const { selectedObjectIds } = useAppSelector(state => state.canvas);

    useEffect(() => {
        if (!ydoc) return;
        const shapes = ydoc.getMap('shapes');

        // When any user adds/moves a shape
        shapes.observeDeep(() => {
            console.log('🟦 Updated shapes:', Array.from(shapes.entries()));
        });

        // Example: add a shape
        shapes.set('rect1', { x: 100, y: 100, width: 80, height: 50, fill: 'blue' });
    }, [ydoc]);

    // Save initial state to undo on mount
    useEffect(() => {
        if (!initialStateSaved.current && stageRef.current) {
            updateHistory();
            initialStateSaved.current = true;
        }
    }, [stageRef.current]);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
    const [selectionRectangle, setSelectionRectangle] = useState({
        visible: false,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
    });
    const [overlayRect, setOverlayRect] = useState<{
        visible: boolean;
        x: number;
        y: number;
        width: number;
        height: number;
    }>({
        visible: false,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });

    // Expose stage to window for debugging
    useEffect(() => {
        if (stageRef.current) {
            window.canvas = stageRef.current;
            console.log("%c >>> Canvas exposed to window.canvas for debugging", "color: purple; font-weight: bold;");
        }
    }, [stageRef]);

    useEffect(() => {
        const layer = layerRef.current;
        const transformer = transformerRef.current;
        if (!layer || !transformer) return;

        const stage = layer.getStage();

        // First, remove all group drag listeners from ALL nodes
        const allNodes = stage.find((node: Konva.Node) => node.id());
        allNodes.forEach((node: Konva.Node) => {
            node.off('dragmove.group');
            node.off('dragend.group');
            node.off('dragstart.group');
        });

        const selectedNodes = stage
            .find((node: Konva.Node) => selectedObjectIds.includes(node.id()));

        // Attach nodes to transformer
        transformer.nodes(selectedNodes);

        // Remove old transformer listeners
        transformer.off('transform.overlay');

        // Update overlay position function
        const updateOverlayPosition = () => {
            if (selectedObjectIds.length) {
                const cornerOffset = transformer.anchorSize();
                const rotateHandleOffset = transformer.rotateAnchorOffset() + cornerOffset;
                const box = transformer.getClientRect();
                setOverlayRect({
                    visible: true,
                    x: box.x + cornerOffset/2,
                    y: box.y + rotateHandleOffset - cornerOffset/2,
                    width: box.width - cornerOffset,
                    height: box.height - rotateHandleOffset,
                });
            } else {
                setOverlayRect({
                    visible: false,
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                });
            }
        };

        // Listen to transformer events to update overlay
        transformer.on('transform.overlay', updateOverlayPosition);

        // Enable dragging on all selected nodes
        selectedNodes.forEach((node: Konva.Node) => {
            node.draggable(true);

            // Add group drag functionality only if multiple items are selected
            if (selectedObjectIds.length > 1) {
                node.on('dragstart.group', function(this: Konva.Node) {
                    // Initialize lastPos when drag starts
                    const pos = this.position();
                    this.setAttr('lastPos', { x: pos.x, y: pos.y });
                });

                node.on('dragmove.group', function(this: Konva.Node) {
                    // Get the current node that's being dragged
                    // eslint-disable-next-line @typescript-eslint/no-this-alias
                    const draggedNode = this;
                    const pos = draggedNode.position();

                    // Calculate the delta from the node's last position
                    const lastPos = draggedNode.getAttr('lastPos') || pos;
                    const dx = pos.x - lastPos.x;
                    const dy = pos.y - lastPos.y;

                    // Move all other selected nodes by the same delta
                    selectedNodes.forEach((otherNode: Konva.Node) => {
                        if (otherNode !== draggedNode) {
                            otherNode.move({ x: dx, y: dy });
                        }
                    });

                    // Store current position for next calculation
                    draggedNode.setAttr('lastPos', { x: pos.x, y: pos.y });

                    layer.batchDraw();
                });

                node.on('dragend.group', function(this: Konva.Node) {
                    // Clean up and update transformer
                    this.setAttr('lastPos', null);
                    transformer.forceUpdate();
                    updateOverlayPosition();
                    layer.batchDraw();

                    // Log canvas state after group drag
                    updateHistory();
                });
            }
        });

        // Initial overlay position update
        updateOverlayPosition();

        transformer.getLayer()?.batchDraw();
    }, [selectedObjectIds]);

    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {

        if (e.target !== e.target.getStage()) {
            return;
        }

        const pos = e.target.getStage()!.getPointerPosition()!;
        setDragStartPos(pos);
        setIsDragging(false);

        isSelecting.current = true;
        setSelectionRectangle({
            visible: true,
            x1: pos.x,
            y1: pos.y,
            x2: pos.x,
            y2: pos.y,
        });
    };

    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!isSelecting.current) {
            return;
        }
        if (!dragStartPos) return;

        const pos = e.target.getStage()!.getPointerPosition()!;
        const dx = Math.abs(pos.x - dragStartPos.x);
        const dy = Math.abs(pos.y - dragStartPos.y);

        // if mouse moved more than a few pixels, it's a drag
        if (dx > 5 || dy > 5) {
            setIsDragging(true);
        }

        setSelectionRectangle({
            ...selectionRectangle,
            x2: pos.x,
            y2: pos.y,
        });
    };

    const handleMouseUp = () => {
        if (!isSelecting.current) {
            return;
        }
        isSelecting.current = false;

        // Select all objects or shapes under the selection rectangle
        const layer = layerRef.current;
        if (!layer) return;

        const selBox = {
            x: Math.min(selectionRectangle.x1, selectionRectangle.x2),
            y: Math.min(selectionRectangle.y1, selectionRectangle.y2),
            width: Math.abs(selectionRectangle.x2 - selectionRectangle.x1),
            height: Math.abs(selectionRectangle.y2 - selectionRectangle.y1),
        };

        // Only proceed if selection box has meaningful size
        if (selBox.width < 2 && selBox.height < 2) {
            return;
        }

        // Find all shapes that intersect with selection rectangle
        const allNodes = layer.getChildren();
        const shapes = allNodes.filter((node: Konva.Node) => {
            // Skip transformer and selection rectangle itself
            const className = node.getClassName();
            if (className === 'Transformer' || !node.id()) {
                return false;
            }

            const nodeBox = node.getClientRect();

            // Check if boxes intersect
            return !(
                nodeBox.x > selBox.x + selBox.width ||
                nodeBox.x + nodeBox.width < selBox.x ||
                nodeBox.y > selBox.y + selBox.height ||
                nodeBox.y + nodeBox.height < selBox.y
            );
        });

        const ids = shapes.map((shape: Konva.Node) => shape.id()).filter(id => id && id !== "selection-overlay");
        dispatch(setSelectedObjectIds(ids))

        setTimeout(() => {
            setSelectionRectangle({
                ...selectionRectangle,
                visible: false,
            });
        });
    }

    // Click handler for stage
    const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (isDragging) {
            setIsDragging(false);
            setDragStartPos(null);
            return;
        }

        // If click on empty area - remove all selections
        if (e.target === e.target.getStage()) {
            dispatch(setSelectedObjectIds([]))
            return;
        }

        const clickedId = e.target.id();

        // Skip overlay rect
        if (clickedId === 'selection-overlay') {
            return;
        }

        // Do we pressed shift or ctrl?
        const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
        const isSelected = selectedObjectIds.includes(clickedId);

        if (!metaPressed && !isSelected) {
            // If no key pressed and the node is not selected
            // select just one
            dispatch(setSelectedObjectIds([clickedId]))
        } else if (metaPressed && isSelected) {
            // If we pressed keys and node was selected
            // we need to remove it from selection
            dispatch(setSelectedObjectIds(selectedObjectIds.filter(id => id !== clickedId)))
        } else if (metaPressed && !isSelected) {
            // Add the node into selection
            dispatch(setSelectedObjectIds([...selectedObjectIds, clickedId]))
        }
    };

    const handleOverlayDragStart = () => {
        const layer = layerRef.current;
        if (!layer) return;

        const stage = layer.getStage();
        const selectedNodes = stage.find((node: Konva.Node) => selectedObjectIds.includes(node.id()));

        // Store initial positions of all selected nodes
        selectedNodes.forEach((node: Konva.Node) => {
            node.setAttr('initialPos', { x: node.x(), y: node.y() });
        });
    };

    const handleOverlayDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
        const layer = layerRef.current;
        const overlay = e.target;
        if (!layer) return;

        const stage = layer.getStage();
        const selectedNodes = stage.find((node: Konva.Node) => selectedObjectIds.includes(node.id()));

        // Calculate delta from initial overlay position
        const dx = overlay.x() - overlayRect.x;
        const dy = overlay.y() - overlayRect.y;

        // Move all selected nodes by the same delta from their initial positions
        selectedNodes.forEach((node: Konva.Node) => {
            const initialPos = node.getAttr('initialPos');
            if (initialPos) {
                node.position({
                    x: initialPos.x + dx,
                    y: initialPos.y + dy,
                });
            }
        });

        layer.batchDraw();
    };

    const handleOverlayDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
        const layer = layerRef.current;
        const transformer = transformerRef.current;
        if (!layer || !transformer) return;

        const stage = layer.getStage();
        const selectedNodes = stage.find((node: Konva.Node) => selectedObjectIds.includes(node.id()));

        // Clean up initial positions
        selectedNodes.forEach((node: Konva.Node) => {
            node.setAttr('initialPos', null);
        });

        // Update overlay position to match new transformer bounds
        const cornerOffset = transformer.anchorSize();
        const rotateHandleOffset = transformer.rotateAnchorOffset() + cornerOffset;
        const box = transformer.getClientRect();

        const newX = box.x + cornerOffset/2;
        const newY = box.y + rotateHandleOffset - cornerOffset/2;
        const newWidth = box.width - cornerOffset;
        const newHeight = box.height - rotateHandleOffset;

        setOverlayRect({
            visible: true,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
        });

        // Reset overlay rect position to match the new calculated position
        e.target.position({ x: newX, y: newY });

        transformer.forceUpdate();
        layer.batchDraw();

        // Log canvas state after overlay drag
        updateHistory();
    };

    return (
        <div
            className="overflow-auto"
            style={{
                maxWidth: window.innerWidth * 0.8,
                maxHeight: window.innerHeight * 0.7,
                background: 'white'
            }}
        >
            <Stage
                ref={stageRef}
                width={window.innerWidth * 0.8 * (zoom / 100)}
                height={window.innerHeight * 0.7 * (zoom / 100)}
                style={{background: 'white'}}
                onClick={handleStageClick}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
            >
                <Layer ref={layerRef}>
                    <Shapes />
                    {/* Selection rectangle */}
                    {selectionRectangle.visible && (
                        <Rect
                            x={Math.min(selectionRectangle.x1, selectionRectangle.x2)}
                            y={Math.min(selectionRectangle.y1, selectionRectangle.y2)}
                            width={Math.abs(selectionRectangle.x2 - selectionRectangle.x1)}
                            height={Math.abs(selectionRectangle.y2 - selectionRectangle.y1)}
                            fill="rgba(59, 130, 246, 0.1)"
                            stroke="rgba(59, 130, 246, 0.4)"
                            strokeWidth={1}
                            dash={[4, 4]}
                            listening={false}
                        />
                    )}

                    <Transformer
                        ref={transformerRef}
                        borderStroke="#3b82f6"
                        borderStrokeWidth={2}
                        anchorStroke="#3b82f6"
                        anchorFill="#ffffff"
                        anchorSize={8}
                        anchorCornerRadius={2}
                        boundBoxFunc={(oldBox, newBox) => {
                            // Limit resize
                            if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                            }
                            return newBox;
                        }}
                    />

                    {/* Draggable overlay for empty space between shapes */}
                    {overlayRect.visible && (
                        <Rect
                            id="selection-overlay"
                            ref={selectionOverlayRef}
                            x={overlayRect.x}
                            y={overlayRect.y}
                            width={overlayRect.width}
                            height={overlayRect.height}
                            fill="transparent"
                            draggable
                            onDragStart={handleOverlayDragStart}
                            onDragMove={handleOverlayDragMove}
                            onDragEnd={handleOverlayDragEnd}
                        />
                    )}
                </Layer>
            </Stage>
        </div>
    );
};

export default Canvas;
