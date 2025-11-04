"use client";
import CanvasWrapper from "@/app/canvas";
import {useYjsConnection} from "@/hooks/useYjsConnection";
import {useEffect, useState} from "react";

export default function Home() {
  const { ydoc, provider } = useYjsConnection('canvas-real-time');
  const [text, setText] = useState("");
  const [remoteCursors, setRemoteCursors] = useState<any[]>([]);

  useEffect(() => {
    if (!provider) return;

    const awareness = provider.awareness;

    // Update your own cursor on mouse move
    const handleMouseMove = (e: MouseEvent) => {
      awareness.setLocalStateField('cursor', {
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Listen for others’ awareness changes
    const onAwarenessChange = () => {
      const states = Array.from(awareness.getStates().values())
          .filter((s: any) => s.cursor && s.user);
      setRemoteCursors(states);
    };

    awareness.on('change', onAwarenessChange);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      awareness.off('change', onAwarenessChange);
    };
  }, [provider]);

  // useEffect(() => {
  //   if (!ydoc) return;
  //
  //   // Get or create a shared Yjs text type
  //   const sharedText = ydoc.getText("sharedText");
  //
  //   // Observe remote changes
  //   const updateHandler = () => {
  //     const newValue = sharedText.toString();
  //     console.log("📝 Shared text changed:", newValue);
  //     setText(newValue);
  //   };
  //
  //   sharedText.observe(updateHandler);
  //
  //   // Initialize local state
  //   setText(sharedText.toString());
  //
  //   return () => {
  //     sharedText.unobserve(updateHandler);
  //   };
  // }, [ydoc]);

  return (
      <div className="relative">
        {/* Draw cursors of others */}
        {remoteCursors.map((state, i) => (
            <div
                key={i}
                style={{
                  position: 'absolute',
                  left: state.cursor.x,
                  top: state.cursor.y,
                  background: state.user.color,
                  borderRadius: '50%',
                  width: 10,
                  height: 10,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 500
                }}
            >
          <span
              style={{
                position: 'absolute',
                top: -20,
                left: 12,
                fontSize: 10,
                background: 'white',
                padding: '2px 4px',
                borderRadius: 4,
                boxShadow: '0 0 2px rgba(0,0,0,0.2)',
              }}
          >
            {state.user.name}
          </span>
            </div>
        ))}

        <CanvasWrapper />
      </div>
  );
}
