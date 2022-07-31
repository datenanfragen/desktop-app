import create from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';

type AppSettingsState = {
    showTutorial: boolean;

    setShowTutorial: (showTutorial: boolean) => void;
    setSmtpSetting: (setting: keyof SmtpSettings, value: string | number | boolean) => void;
} & SmtpSettings;

export type SmtpSettings = {
    fromEmail?: string;
    smtpPort: number;
    smtpHost: string;
    smtpSecure: boolean;
};
export const useAppSettingsStore = create<AppSettingsState>(
    persist(
        (set, get) => ({
            showTutorial: true,
            // I would've wanted those to reside in their own object, but apparently zustand can't handles this here properly and it breaks referential euqality causing unwanted rerenders, so we have to accept this ugly prefix.
            smtpPort: 587,
            smtpSecure: true,
            smtpHost: 'example.com',

            setShowTutorial: (showTutorial) => set({ showTutorial }),
            setSmtpSetting: (smtpSetting, value) =>
                set(
                    produce((state) => {
                        state[smtpSetting] = value;
                    })
                ),
        }),
        {
            name: 'Datenanfragen.de-app-settings',
            version: 0,
            // TODO: Use our new PrivacyAsynStorage here once it is available through the package.
            getStorage: () => localStorage,
        }
    )
);
