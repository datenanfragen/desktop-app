import { ipcMain, shell } from 'electron';
import * as keytar from 'keytar';
import {
    sendEmail,
    getFolders,
    SendMessageOptions,
    SendMessageReturn,
    recreateEmailClients,
    RecreateEmailClientsOptions,
    RecreateEmailClientsReturn,
    verifyConnections,
    GetMessageOptions,
    getMessages,
    GetMessageResult,
} from './email';

const isValidProtocol = (protocol: string): protocol is 'imap' | 'smtp' => ['imap', 'smtp'].includes(protocol);
export const setupIpc = () => {
    ipcMain.handle(
        'email:recreateEmailClients',
        (_, options: RecreateEmailClientsOptions): RecreateEmailClientsReturn => recreateEmailClients(options)
    );
    ipcMain.handle(
        'email:verifyConnection',
        (): Promise<boolean> =>
            verifyConnections()
                .then(() => true)
                .catch(() => false)
    );
    ipcMain.handle('email:sendMessage', (_, options: SendMessageOptions): SendMessageReturn => sendEmail(options));
    ipcMain.handle('email:getFolders', (): Promise<string[]> => getFolders());
    ipcMain.handle(
        'email:getMessages',
        (_, options: GetMessageOptions): Promise<GetMessageResult[]> => getMessages(options)
    );

    ipcMain.handle('email:openMailto', (_, options: SendMessageOptions) =>
        shell.openExternal(
            `mailto:${options.to}?subject=${encodeURIComponent(options.subject)}&body=${encodeURIComponent(
                options.text
            )}`
        )
    );
    ipcMain.handle('email:setEmailAccountPassword', (_, protocol: 'imap' | 'smtp', password: string) => {
        if (isValidProtocol(protocol)) return keytar.setPassword('Datenanfragen.de', protocol, password);
    });
};
