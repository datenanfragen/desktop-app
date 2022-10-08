import { ipcMain, shell } from 'electron';
import * as keytar from 'keytar';
import { legalBaseUrls, LegalBaseUrl } from './consts';
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
    downloadMessage,
    htmlToPdf,
} from './email';
import { setMenu } from './menu';

const isValidProtocol = (protocol: string): protocol is 'imap' | 'smtp' => ['imap', 'smtp'].includes(protocol);
export const setupIpc = () => {
    ipcMain.handle('app:setBaseUrl', (_, baseUrl: LegalBaseUrl) => {
        if (legalBaseUrls.includes(baseUrl)) setMenu(baseUrl);
    });

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
    ipcMain.handle(
        'email:downloadMessage',
        (_, folder: string, seq: number): Promise<Buffer> =>
            downloadMessage(folder, seq).then((stream) =>
                new Promise<Buffer>((resolve, reject) => {
                    if (!stream) reject();
                    const buffers: Buffer[] = [];
                    console.log('download started');

                    stream.on('data', (data) => buffers.push(Buffer.from(data)));
                    stream.on('error', (err) => reject(err));
                    stream.on('end', () => resolve(Buffer.concat(buffers)));
                }).then((buf) => Buffer.from(buf.toString('base64'), 'base64'))
            )
    );

    ipcMain.handle('email:htmlToPdf', (_, html: string, title?: string): Promise<Buffer> => htmlToPdf(html, title));

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
