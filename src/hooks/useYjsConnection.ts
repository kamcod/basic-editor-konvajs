// hooks/useYjsConnection.ts
'use client';
import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';

export function useYjsConnection(roomName: string) {
    const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
    const [provider, setProvider] = useState<HocuspocusProvider | null>(null);

    useEffect(() => {
        const ydocInstance = new Y.Doc();

        const providerInstance = new HocuspocusProvider({
            url: 'ws://172.16.11.31:1234', // Your Hocuspocus server URL
            name: roomName, // Room/document name
            document: ydocInstance,

            // Optional: Add authentication
            // token: 'your-auth-token',

            // Connection event handlers
            onConnect: () => {
                console.log('%c 🛰️ Connected to Hocuspocus server', 'color: green; font-weight: bold;');
            },
            onDisconnect: ({ event }) => {
                console.log('%c 🛰️ Disconnected from Hocuspocus server', 'color: red; font-weight: bold;', event);
            },
            onStatus: ({ status }) => {
                console.log(`🛰️ Hocuspocus status: ${status}`);
            },
            onSynced: ({ state }) => {
                console.log('%c 🛰️ Hocuspocus synced:', 'color: blue; font-weight: bold;', state);
            },
        });

        const awareness = providerInstance.awareness;

        // Set local user info
        if (awareness) {
            awareness.setLocalStateField('user', {
                name: 'Kamran',
                color: '#' + Math.floor(Math.random() * 16777215).toString(16)
            });
        }

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
