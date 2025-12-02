import { useState, useRef, RefObject, useCallback, useEffect } from 'react';
import Konva from 'konva';
import useCanvasHistory from './useCanvasHistory';

interface OverlayRectState {
    visible: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    listening: boolean;
}

interface SelectionRectState {
    visible: boolean;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

interface UseCanvasEventsProps {
    transformerRef: RefObject<Konva.Transformer | null>;
    layerRef: RefObject<Konva.Layer | null>;
    selectedObjectIds: string[];
    onSelectionChange: (ids: string[]) => void;
}

export const useCanvasEvents = ({
    transformerRef,
    layerRef,
    selectedObjectIds,
    onSelectionChange,
}: UseCanvasEventsProps) => {
    const { updateHistory } = useCanvasHistory();
    const isSelecting = useRef(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);

    const [overlayRect, setOverlayRect] = useState<OverlayRectState>({
        visible: false,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        listening: true,
    });

    const [selectionRectangle, setSelectionRectangle] = useState<SelectionRectState>({
        visible: false,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
    });

    // ==================== Overlay Rectangle Management ====================
    const updateOverlayPosition = useCallback(() => {
        const transformer = transformerRef.current;
        if (!transformer) return;

        if (selectedObjectIds.length) {
            const cornerOffset = transformer.anchorSize();
            const rotateHandleOffset = transformer.rotateAnchorOffset() + cornerOffset;
            const box = transformer.getClientRect();

            const newRect = {
                visible: true,
                x: box.x + cornerOffset / 2,
                y: box.y + rotateHandleOffset - cornerOffset / 2,
                width: box.width - cornerOffset,
                height: box.height - rotateHandleOffset,
                listening: true,
            };

            setOverlayRect((prev) => {
                if (
                    prev.visible !== newRect.visible ||
                    Math.abs(prev.x - newRect.x) > 0.5 ||
                    Math.abs(prev.y - newRect.y) > 0.5 ||
                    Math.abs(prev.width - newRect.width) > 0.5 ||
                    Math.abs(prev.height - newRect.height) > 0.5 ||
                    prev.listening !== newRect.listening
                ) {
                    return newRect;
                }
                return prev;
            });
        } else {
            setOverlayRect((prev) => {
                if (prev.visible) {
                    return {
                        visible: false,
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0,
                        listening: true,
                    };
                }
                return prev;
            });
        }
    }, [transformerRef, selectedObjectIds]);

    const handleOverlayDragStart = useCallback(() => {
        const layer = layerRef.current;
        if (!layer) return;

        const stage = layer.getStage();
        if (!stage) return;

        const selectedNodes = stage.find((node: Konva.Node) =>
            selectedObjectIds.includes(node.id())
        );

        selectedNodes.forEach((node: Konva.Node) => {
            node.setAttr('initialPos', { x: node.x(), y: node.y() });
        });
    }, [layerRef, selectedObjectIds]);

    const handleOverlayDragMove = useCallback(
        (e: Konva.KonvaEventObject<DragEvent>) => {
            const layer = layerRef.current;
            const overlay = e.target;
            if (!layer) return;

            const stage = layer.getStage();
            if (!stage) return;

            const selectedNodes = stage.find((node: Konva.Node) =>
                selectedObjectIds.includes(node.id())
            );

            const dx = overlay.x() - overlayRect.x;
            const dy = overlay.y() - overlayRect.y;

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
        },
        [layerRef, selectedObjectIds, overlayRect.x, overlayRect.y]
    );

    const handleOverlayDragEnd = useCallback(
        (e: Konva.KonvaEventObject<DragEvent>) => {
            const layer = layerRef.current;
            const transformer = transformerRef.current;
            if (!layer || !transformer) return;

            const stage = layer.getStage();
            if (!stage) return;

            const selectedNodes = stage.find((node: Konva.Node) =>
                selectedObjectIds.includes(node.id())
            );

            selectedNodes.forEach((node: Konva.Node) => {
                node.setAttr('initialPos', null);
            });

            transformer.forceUpdate();

            const cornerOffset = transformer.anchorSize();
            const rotateHandleOffset = transformer.rotateAnchorOffset() + cornerOffset;
            const box = transformer.getClientRect();

            const newX = box.x + cornerOffset / 2;
            const newY = box.y + rotateHandleOffset - cornerOffset / 2;
            const newWidth = box.width - cornerOffset;
            const newHeight = box.height - rotateHandleOffset;

            e.target.position({ x: newX, y: newY });

            setOverlayRect({
                visible: true,
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight,
                listening: true,
            });

            layer.batchDraw();
            updateHistory();
        },
        [layerRef, transformerRef, selectedObjectIds, updateHistory]
    );

    // ==================== Selection Rectangle Management ====================
    const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
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
    }, []);

    const handleMouseMove = useCallback(
        (e: Konva.KonvaEventObject<MouseEvent>) => {
            if (!isSelecting.current) {
                return;
            }
            if (!dragStartPos) return;

            const pos = e.target.getStage()!.getPointerPosition()!;
            const dx = Math.abs(pos.x - dragStartPos.x);
            const dy = Math.abs(pos.y - dragStartPos.y);

            if (dx > 5 || dy > 5) {
                setIsDragging(true);
            }

            setSelectionRectangle((prev) => ({
                ...prev,
                x2: pos.x,
                y2: pos.y,
            }));
        },
        [dragStartPos]
    );

    const handleMouseUp = useCallback(() => {
        if (!isSelecting.current) {
            return;
        }
        isSelecting.current = false;

        const layer = layerRef.current;
        if (!layer) return;

        const selBox = {
            x: Math.min(selectionRectangle.x1, selectionRectangle.x2),
            y: Math.min(selectionRectangle.y1, selectionRectangle.y2),
            width: Math.abs(selectionRectangle.x2 - selectionRectangle.x1),
            height: Math.abs(selectionRectangle.y2 - selectionRectangle.y1),
        };

        if (selBox.width < 2 && selBox.height < 2) {
            return;
        }

        const allNodes = layer.getChildren();
        const shapes = allNodes.filter((node: Konva.Node) => {
            const className = node.getClassName();
            if (className === 'Transformer' || !node.id()) {
                return false;
            }

            const nodeBox = node.getClientRect();

            return !(
                nodeBox.x > selBox.x + selBox.width ||
                nodeBox.x + nodeBox.width < selBox.x ||
                nodeBox.y > selBox.y + selBox.height ||
                nodeBox.y + nodeBox.height < selBox.y
            );
        });

        const ids = shapes
            .map((shape: Konva.Node) => shape.id())
            .filter((id) => id && id !== 'selection-overlay');

        onSelectionChange(ids);

        setTimeout(() => {
            setSelectionRectangle((prev) => ({
                ...prev,
                visible: false,
            }));
        });
    }, [layerRef, selectionRectangle, onSelectionChange]);

    // ==================== Stage Click Handler ====================
    const handleStageClick = useCallback(
        (e: Konva.KonvaEventObject<MouseEvent>) => {
            if (isDragging) {
                setIsDragging(false);
                setDragStartPos(null);
                return;
            }

            if (e.target === e.target.getStage()) {
                onSelectionChange([]);
                return;
            }

            const clickedId = e.target.id();

            if (clickedId === 'selection-overlay') {
                return;
            }

            const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
            const isSelected = selectedObjectIds.includes(clickedId);

            if (!metaPressed && !isSelected) {
                onSelectionChange([clickedId]);
            } else if (metaPressed && isSelected) {
                onSelectionChange(selectedObjectIds.filter((id) => id !== clickedId));
            } else if (metaPressed && !isSelected) {
                onSelectionChange([...selectedObjectIds, clickedId]);
            }
        },
        [selectedObjectIds, isDragging, onSelectionChange]
    );

    // ==================== Transformer Management ====================
    useEffect(() => {
        const layer = layerRef.current;
        const transformer = transformerRef.current;
        if (!layer || !transformer) return;

        const stage = layer.getStage();
        if (!stage) return;

        // Remove all old group drag listeners
        const allNodes = stage.find((node: Konva.Node) => node.id());
        allNodes.forEach((node: Konva.Node) => {
            node.off('dragmove.group');
            node.off('dragend.group');
            node.off('dragstart.group');
        });

        const selectedNodes = stage.find((node: Konva.Node) =>
            selectedObjectIds.includes(node.id())
        );

        // Attach nodes to transformer
        transformer.nodes(selectedNodes);

        // Remove old transformer listeners
        transformer.off('transformstart.overlay');
        transformer.off('transform.overlay');
        transformer.off('transformend.update');

        // Transformer event listeners
        transformer.on('transformstart.overlay', () => {
            setOverlayRect((prev) => ({ ...prev, listening: false }));
        });

        transformer.on('transform.overlay', updateOverlayPosition);

        transformer.on('transformend.update', () => {
            setOverlayRect((prev) => ({ ...prev, listening: true }));
            updateOverlayPosition();
            transformer.forceUpdate();
            layer.batchDraw();
            updateHistory();
        });

        // Enable dragging on selected nodes
        selectedNodes.forEach((node: Konva.Node) => {
            node.draggable(true);

            // Group drag functionality for multiple selections
            if (selectedObjectIds.length > 1) {
                node.on('dragstart.group', function (this: Konva.Node) {
                    const pos = this.position();
                    this.setAttr('lastPos', { x: pos.x, y: pos.y });
                });

                node.on('dragmove.group', function (this: Konva.Node) {
                    // eslint-disable-next-line @typescript-eslint/no-this-alias
                    const draggedNode = this;
                    const pos = draggedNode.position();

                    const lastPos = draggedNode.getAttr('lastPos') || pos;
                    const dx = pos.x - lastPos.x;
                    const dy = pos.y - lastPos.y;

                    selectedNodes.forEach((otherNode: Konva.Node) => {
                        if (otherNode !== draggedNode) {
                            otherNode.move({ x: dx, y: dy });
                        }
                    });

                    draggedNode.setAttr('lastPos', { x: pos.x, y: pos.y });
                    layer.batchDraw();
                });

                node.on('dragend.group', function (this: Konva.Node) {
                    this.setAttr('lastPos', null);
                    transformer.forceUpdate();
                    updateOverlayPosition();
                    layer.batchDraw();
                    updateHistory();
                });
            }
        });

        // Initial overlay position update
        updateOverlayPosition();
        transformer.getLayer()?.batchDraw();
    }, [selectedObjectIds, transformerRef, layerRef, updateOverlayPosition, updateHistory]);

    return {
        // Overlay rectangle
        overlayRect,
        handleOverlayDragStart,
        handleOverlayDragMove,
        handleOverlayDragEnd,
        // Selection rectangle
        selectionRectangle,
        // Stage events
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleStageClick,
    };
};
