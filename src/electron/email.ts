import { ImapFlow } from 'imapflow';
import nodemailer from 'nodemailer';
import { getPassword } from 'keytar';
import Mail from 'nodemailer/lib/mailer/index';

const clients: { imap: ImapFlow | undefined; smtp: nodemailer.Transporter | undefined } = {
    imap: undefined,
    smtp: undefined,
};

const stringOrNodeMailerAddressToString = (address: Mail.Address | string) =>
    typeof address === 'string' ? address : address.address;

export type Credentials = {
    host: string;
    port: number;
    secure: boolean;
    auth: { user: string };
};
export type RecreateEmailClientsOptions = { imapCredentials?: Credentials; smtpCredentials?: Credentials };
export type RecreateEmailClientsReturn = Promise<void>;
export const recreateEmailClients = async (options: RecreateEmailClientsOptions): RecreateEmailClientsReturn => {
    if (options.imapCredentials) {
        clients.imap = new ImapFlow({
            ...options.imapCredentials,
            auth: { ...options.imapCredentials.auth, pass: (await getPassword('Datenanfragen.de', 'imap')) || '' },
        });
        await clients.imap?.connect().catch(() => undefined);
    }
    if (options.smtpCredentials)
        clients.smtp = nodemailer.createTransport({
            ...options.smtpCredentials,
            auth: { ...options.smtpCredentials.auth, pass: (await getPassword('Datenanfragen.de', 'smtp')) || '' },
        });
};

export const ensureConnection = async () => {
    if (!clients.imap) throw new Error('IMAP not logged in.');
    if (!clients.smtp) throw new Error('SMTP not logged in.');

    await clients.imap.connect();
    await clients.smtp.verify();
};

export type SendMessageOptions = { from: string; to: string; subject: string; text: string };
export type SendMessageReturn = Promise<{ accepted: string[]; rejected: string[] }>;
export const sendEmail = async (options: SendMessageOptions): SendMessageReturn => {
    await ensureConnection();

    return clients.smtp!.sendMail(options).then((info) => ({
        accepted: info.accepted.map(stringOrNodeMailerAddressToString),
        rejected: info.rejected.map(stringOrNodeMailerAddressToString),
    }));
};
