"use client";
import CanvasWrapper from "@/app/canvas";
import {useYjsConnection} from "@/hooks/useYjsConnection";
import {useEffect, useState} from "react";

export default function Home() {
  const { ydoc, provider } = useYjsConnection('canvas-real-time');
  const [remoteCursors, setRemoteCursors] = useState<any[]>([]);

  useEffect(() => {
    if (!provider) return;

    const awareness = provider.awareness;
    const STALE_CURSOR_TIMEOUT = 5000; // 5 seconds

    // Clear any old cursor data on mount
    awareness.setLocalStateField('cursor', null);

    // Update your own cursor on mouse move
    const handleMouseMove = (e: MouseEvent) => {
      awareness.setLocalStateField('cursor', {
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Listen for others' awareness changes
    const onAwarenessChange = () => {
      const localClientId = awareness.clientID;
      const now = Date.now();

      const states = Array.from(awareness.getStates().entries())
          .filter(([clientId, state]: [number, any]) => {
            // Filter out: local client, states without cursor or user
            if (clientId === localClientId) return false;
            if (!state.cursor || !state.user) return false;

            // Filter out stale cursors (older than STALE_CURSOR_TIMEOUT)
            if (state.cursor.timestamp && (now - state.cursor.timestamp) > STALE_CURSOR_TIMEOUT) {
              return false;
            }

            return true;
          })
          .map(([clientId, state]) => ({ ...state, clientId }));
      setRemoteCursors(states);
    };

    awareness.on('change', onAwarenessChange);

    // Initial cleanup - clear stale cursors on mount
    onAwarenessChange();

    // Periodically clean up stale cursors
    const cleanupInterval = setInterval(() => {
      onAwarenessChange();
    }, 1000);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      awareness.off('change', onAwarenessChange);
      clearInterval(cleanupInterval);
      // Clear cursor when component unmounts
      awareness.setLocalStateField('cursor', null);
    };
  }, [provider]);

  return (
      <div className="relative">
        {/* Draw cursors of others */}
        {remoteCursors.map((state) => (
            <div
                key={state.clientId}
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
