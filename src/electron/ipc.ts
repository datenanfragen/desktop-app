import { ipcMain, shell } from 'electron';
import * as keytar from 'keytar';
import { sendEmail, SendMessageOptions, SendMessageReturn } from './email';

export const setupIpc = () => {
    ipcMain.handle(
        'email:sendMessage',
        (_, options: SendMessageOptions): Promise<SendMessageReturn> => sendEmail(options)
    );
    ipcMain.handle('email:openMailto', (_, options: SendMessageOptions) =>
        shell.openExternal(
            `mailto:${options.to}?subject=${encodeURIComponent(options.subject)}&body=${encodeURIComponent(
                options.text
            )}`
        )
    );
    ipcMain.handle('email:setSmtpPassword', (_, password: string) =>
        keytar.setPassword('Datenanfragen.de', 'smtp', password)
    );
};
