import create from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';
import { PrivacyAsyncStorage } from '@datenanfragen/components';

const appSettingsStorage = new PrivacyAsyncStorage(() => true, { name: 'Datenanfragen.de', storeName: 'app-settings' });

export type EmailAccountSettings = {
    imapHost: string;
    imapUser: string;
    imapPassword: string;
    imapPort: number;
    imapUseSsl: boolean;

    smtpHost: string;
    smtpUser: string;
    smtpPassword: string;
    smtpPort: number;
    smtpUseSsl: boolean;
};
type AppSettingsState = {
    showTutorial: boolean;
    receiveNotifications: boolean;

    setShowTutorial: (showTutorial: boolean) => void;
    setReceiveNotifications: (receiveNotifications: boolean) => void;
    setEmailAccountSetting: <KeyT extends keyof EmailAccountSettings>(
        setting: KeyT | 'imapUseStartTls' | 'smtpUseStartTls',
        value: EmailAccountSettings[KeyT]
    ) => void;

    syncEmailAccountSettingsWithNativeCode: () => void;
} & Omit<EmailAccountSettings, 'imapPassword' | 'smtpPassword'>;

export const useAppSettingsStore = create<AppSettingsState>(
    persist(
        (set, get) => ({
            showTutorial: true,
            receiveNotifications: false,

            imapUser: '',
            imapHost: '',
            imapPort: 993,
            imapUseSsl: true,

            smtpUser: '',
            smtpHost: '',
            smtpPort: 587,
            smtpUseSsl: false,

            setShowTutorial: (showTutorial) => set({ showTutorial }),
            setReceiveNotifications: (receiveNotifications) => set({ receiveNotifications }),
            setEmailAccountSetting: async (setting, value) => {
                if (setting === 'imapPassword') await window.email.setEmailAccountPassword('imap', value as string);
                else if (setting === 'smtpPassword')
                    await window.email.setEmailAccountPassword('smtp', value as string);
                else if (!['imapUseStartTls', 'smtpUseStartTls'].includes(setting))
                    set(
                        produce((state) => {
                            state[setting] = value;
                        })
                    );

                return get().syncEmailAccountSettingsWithNativeCode();
            },

            syncEmailAccountSettingsWithNativeCode: () =>
                window.email.recreateEmailClients({
                    imapCredentials: {
                        host: get().imapHost,
                        port: get().imapPort,
                        secure: get().imapUseSsl,
                        auth: { user: get().imapUser },
                    },
                    smtpCredentials: {
                        host: get().smtpHost,
                        port: get().smtpPort,
                        secure: get().smtpUseSsl,
                        auth: { user: get().smtpUser },
                    },
                }),
        }),
        {
            name: 'Datenanfragen.de-app-settings',
            version: 0,
            getStorage: () => appSettingsStorage,
            // This is necessary to communicate the credentials to the native code.
            onRehydrateStorage: () => async (state) => {
                if (!state) return;
                state.syncEmailAccountSettingsWithNativeCode();
            },
        }
    )
);
