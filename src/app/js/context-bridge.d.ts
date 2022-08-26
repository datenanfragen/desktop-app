import type {
    SendMessageOptions,
    SendMessageReturn,
    RecreateEmailClientsOptions,
    RecreateEmailClientsReturn,
    GetMessageOptions,
    GetMessageResult,
} from '../../electron/email';

declare global {
    interface Window {
        email: {
            recreateEmailClients: (options: RecreateEmailClientsOptions) => Promise<RecreateEmailClientsReturn>;
            verifyConnection: () => Promise<boolean>;
            setEmailAccountPassword: (protocol: 'imap' | 'smtp', password: string) => Promise<void>;
            sendMessage: (options: SendMessageOptions) => SendMessageReturn;
            getFolders: () => Promise<string[]>;
            getMessages: (options: GetMessageOptions) => Promise<GetMessageResult[]>;
        };
    }
}
