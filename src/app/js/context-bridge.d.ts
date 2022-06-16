import type { SendMessageOptions, SendMessageReturn } from '../../electron/ipc';

declare global {
    interface Window {
        email: {
            sendMessage: (options: SendMessageOptions) => Promise<SendMessageReturn>;
        };
    }
}
