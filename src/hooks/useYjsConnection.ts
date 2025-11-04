// hooks/useYjsConnection.ts
'use client';
import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export function useYjsConnection(roomName: string) {
    const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
    const [provider, setProvider] = useState<WebsocketProvider | null>(null);

    useEffect(() => {
        const ydocInstance = new Y.Doc();

        const providerInstance = new WebsocketProvider(
            'ws://172.21.48.1:1234', // your Yjs WebSocket server
            roomName,
            ydocInstance
        );

        const awareness = providerInstance.awareness;

        // Set local user info
        awareness.setLocalStateField('user', {
            name: 'Kamran',
            color: '#' + Math.floor(Math.random() * 16777215).toString(16)
        });

        providerInstance.on('status', (event) => {
            console.log(`🛰️ Yjs connection status: ${event.status}`);
        });

        // Set them in state to trigger re-render
        setYdoc(ydocInstance);
        setProvider(providerInstance);

        return () => {
            providerInstance.destroy();
            ydocInstance.destroy();
        };
    }, [roomName]);

    return { ydoc, provider };
}
