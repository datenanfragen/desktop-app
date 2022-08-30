import type {
    SendMessageOptions,
    SendMessageReturn,
    RecreateEmailClientsOptions,
    RecreateEmailClientsReturn,
    GetMessageOptions,
    GetMessageResult,
} from '../../../electron/email';

declare global {
    interface Window {
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
    }
}
