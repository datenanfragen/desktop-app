import { ipcMain, shell } from 'electron';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer/index';

// TODO
const transport = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
        user: 'abby.emmerich35@ethereal.email',
        pass: 'GD29BFTPC4MpXxXRc6',
    },
});

const stringOrNodeMailerAddressToString = (address: Mail.Address | string) =>
    typeof address === 'string' ? address : address.address;

export type SendMessageOptions = { from: string; to: string; subject: string; text: string };
export type SendMessageReturn = { accepted: string[]; rejected: string[] };

export const setupIpc = () => {
    ipcMain.handle(
        'email:sendMessage',
        (_, options: SendMessageOptions): Promise<SendMessageReturn> =>
            transport
                .sendMail({ from: options.from, to: options.to, subject: options.subject, text: options.text })
                .then((info) => ({
                    accepted: info.accepted.map(stringOrNodeMailerAddressToString),
                    rejected: info.rejected.map(stringOrNodeMailerAddressToString),
                }))
    );
    ipcMain.handle('email:openMailto', (_, options: SendMessageOptions) =>
        shell.openExternal(
            `mailto:${options.to}?subject=${encodeURIComponent(options.subject)}&body=${encodeURIComponent(
                options.text
            )}`
        )
    );
};
