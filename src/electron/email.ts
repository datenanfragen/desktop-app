import { getPassword } from 'keytar';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer/index';

const stringOrNodeMailerAddressToString = (address: Mail.Address | string) =>
    typeof address === 'string' ? address : address.address;

export type SendMessageOptions = {
    from: string;
    to: string;
    subject: string;
    text: string;

    smtpOptions: {
        host: string;
        account: string;
        port: number;
        secure: boolean;
    };
};
export type SendMessageReturn = { accepted: string[]; rejected: string[] };

export const sendEmail = (options: SendMessageOptions) => {
    return getPassword('Datenanfragen.de', 'smtp').then((password) => {
        if (!password) {
            throw new RangeError('Missing credentials');
        }

        console.log(options.smtpOptions);
        const transport = nodemailer.createTransport({
            host: options.smtpOptions.host,
            port: options.smtpOptions.port, // 587
            secure: options.smtpOptions.secure,
            auth: {
                user: options.smtpOptions.account, // 'abby.emmerich35@ethereal.email'
                pass: password, // 'GD29BFTPC4MpXxXRc6'
            },
        });
        return transport.sendMail(options).then((info) => ({
            accepted: info.accepted.map(stringOrNodeMailerAddressToString),
            rejected: info.rejected.map(stringOrNodeMailerAddressToString),
        }));
    });
};
