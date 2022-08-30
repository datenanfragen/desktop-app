import { ImapFlow, ImapFlowOptions, Readable } from 'imapflow';
import { getPassword } from 'keytar';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer/index';
import MailComposer from 'nodemailer/lib/mail-composer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { BrowserWindow } from 'electron';

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

export const downloadMessage = (folder: string, seq: number): Promise<Readable> =>
    getImapConnection().then((imapClient) =>
        imapClient
            .getMailboxLock(folder)
            .then(async (lock) => {
                console.log('lock acquired');
                try {
                    return imapClient.download('' + seq).then((download) => download.content);
                } finally {
                    lock.release();
                }
            })
            .finally(() => imapClient.logout())
    );

export const htmlToPdf = (html: string, title?: string, address?: string) => {
    const pdfWindow = new BrowserWindow({
        width: 1000,
        show: false,

        webPreferences: {
            // Explicitly set security preferences to their (secure) defaults, just in case.
            nodeIntegration: false,
            nodeIntegrationInWorker: false,
            nodeIntegrationInSubFrames: false,
            sandbox: true,
            webSecurity: true,
            allowRunningInsecureContent: false,
            experimentalFeatures: false,
            contextIsolation: true,
            webviewTag: false,
            navigateOnDragDrop: false,
        },
    });
    pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    return new Promise<Buffer>((resolve, reject) =>
        pdfWindow.webContents.on('did-finish-load', () =>
            resolve(
                pdfWindow.webContents
                    .printToPDF({
                        pageSize: 'A4',
                        marginsType: 0,
                        headerFooter:
                            title && address
                                ? {
                                      title,
                                      url: address,
                                  }
                                : undefined,
                        printSelectionOnly: false,
                        printBackground: true,
                    })
                    .finally(() => pdfWindow.close())
            )
        )
    );
};

export type SendMessageOptions = { from: string; to: string; subject: string; text: string };
export type SendMessageReturn = Promise<{
    accepted: string[];
    rejected: string[];
    messageId: string;
    content: Buffer;
}>;
export const sendEmail = async (options: SendMessageOptions): SendMessageReturn => {
    return nodemailer
        .createTransport(clients.smtpOptions)
        .sendMail(options)
        .then(async (info) => {
            const sentEmailContent = await new MailComposer({ ...options, headers: { 'Message-ID': info.messageId } })
                .compile()
                .build();

            await getImapConnection().then((imapClient) =>
                getSentFolder(imapClient)
                    .then((sentFolder) => {
                        if (sentFolder) return imapClient.append(sentFolder, sentEmailContent, ['\\Seen']);
                    })
                    .finally(() => imapClient.logout())
            );

            return {
                accepted: info.accepted.map(stringOrNodeMailerAddressToString),
                rejected: info.rejected.map(stringOrNodeMailerAddressToString),
                messageId: info.messageId,
                content: Buffer.from(sentEmailContent.toString('base64'), 'base64'),
            };
        });
};
