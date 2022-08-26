import { ImapFlow, ImapFlowOptions } from 'imapflow';
import { getPassword } from 'keytar';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer/index';
import MailComposer from 'nodemailer/lib/mail-composer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

const clients: {
    imapOptions: ImapFlowOptions | undefined;
    smtpOptions: SMTPTransport.Options | undefined;
} = {
    imapOptions: undefined,
    smtpOptions: undefined,
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
        clients.imapOptions = {
            ...options.imapCredentials,
            auth: { ...options.imapCredentials.auth, pass: (await getPassword('Datenanfragen.de', 'imap')) || '' },
            // On Windows, the ImapFlow logger throws EBADF errors.
            logger: false,
        };
    }
    if (options.smtpCredentials)
        clients.smtpOptions = {
            ...options.smtpCredentials,
            auth: { ...options.smtpCredentials.auth, pass: (await getPassword('Datenanfragen.de', 'smtp')) || '' },
        };
};

export const verifyConnections = async () => {
    if (!clients.imapOptions) throw new Error('No IMAP options.');
    if (!clients.smtpOptions) throw new Error('Not SMTP options.');

    await new ImapFlow({ ...clients.imapOptions, verifyOnly: true }).connect();
    await nodemailer.createTransport(clients.smtpOptions).verify();
};

export const getImapConnection = async () => {
    if (!clients.imapOptions) throw new Error('No IMAP options.');
    const imapClient = new ImapFlow(clients.imapOptions);
    await imapClient.connect();
    return imapClient;
};

const getSentFolder = (imapClient: ImapFlow) => {
    if (!imapClient.usable) throw new Error('IMAP client not usable.');
    return imapClient?.list().then((folders) => {
        const sentFolder = folders?.filter((folder) => folder.specialUse === '\\Sent');
        return sentFolder && sentFolder.length > 0 ? sentFolder[0].path : undefined;
    });
};

export const getFolders = () =>
    getImapConnection().then((imapClient) =>
        imapClient
            .list()
            .then((folderList) => folderList.map((folder) => folder.path))
            .finally(() => imapClient.logout())
    );

export type GetMessageOptions = {
    folder: string;
    cursor?: number;
    limit?: number;
};
export type GetMessageResult = {
    seq: number;
    uid: number;
    envelope: {
        from?: EmailAddress[];
        to?: EmailAddress[];
        subject?: string;
        messageId?: string;
        inReplyTo?: string;
        date?: Date;
    };
};
type EmailAddress = {
    name?: string;
    address?: string;
};

export const getMessages = (options: GetMessageOptions): Promise<GetMessageResult[]> =>
    getImapConnection().then((imapClient) =>
        imapClient
            .getMailboxLock(options.folder)
            .then(async (lock) => {
                const messages = [];

                try {
                    for await (const msg of imapClient.fetch(
                        `${options.cursor || 1}:${options.limit ? (options.cursor || 1) + options.limit : '*'}`,
                        { envelope: true }
                    )) {
                        console.log(msg);
                        messages.push(msg);
                    }
                } finally {
                    lock.release();
                }

                return messages;
            })
            .finally(() => imapClient.logout())
    );

export type SendMessageOptions = { from: string; to: string; subject: string; text: string };
export type SendMessageReturn = Promise<{ accepted: string[]; rejected: string[] }>;
export const sendEmail = async (options: SendMessageOptions): SendMessageReturn => {
    return nodemailer
        .createTransport(clients.smtpOptions)
        .sendMail(options)
        .then((info) => {
            console.log(info);
            new MailComposer({ ...options, headers: { 'Message-ID': info.messageId } })
                .compile()
                .build()
                .then((sentEmailContent) =>
                    getImapConnection().then((imapClient) =>
                        getSentFolder(imapClient)
                            .then((sentFolder) => {
                                if (sentFolder) return imapClient.append(sentFolder, sentEmailContent, ['\\Seen']);
                            })
                            .finally(() => imapClient.logout())
                    )
                );

            return {
                accepted: info.accepted.map(stringOrNodeMailerAddressToString),
                rejected: info.rejected.map(stringOrNodeMailerAddressToString),
                messageId: info.messageId,
            };
        });
};
