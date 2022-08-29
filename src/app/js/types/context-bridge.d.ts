import type {
    SendMessageOptions,
    SendMessageReturn,
    RecreateEmailClientsOptions,
    RecreateEmailClientsReturn,
    GetMessageOptions,
    GetMessageResult,
} from '../../../electron/email';
import type { DesktopAppPageId } from '../index';

declare global {
    interface Window {
        app: {
            setBaseUrl: (baseUrl: string) => Promise<void>;
        };
        email: {
            recreateEmailClients: (options: RecreateEmailClientsOptions) => Promise<RecreateEmailClientsReturn>;
            verifyConnection: () => Promise<boolean>;
            setEmailAccountPassword: (protocol: 'imap' | 'smtp', password: string) => Promise<void>;
            sendMessage: (options: SendMessageOptions) => SendMessageReturn;
            getFolders: () => Promise<string[]>;
            getMessages: (options: GetMessageOptions) => Promise<GetMessageResult[]>;
            downloadMessage: (folder: string, seq: number) => Promise<ArrayBuffer>;
            htmlToPdf: (html: string, title?: string, address?: string) => Promise<Blob>;
        };
        preact: {
            onSetPage: (callback: (page: DesktopAppPageId) => void) => void;
        };
    }
}
