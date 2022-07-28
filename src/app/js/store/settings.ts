import create, { SetState } from 'zustand';
import { persist } from 'zustand/middleware';

type AppSettingsState = {
    showTutorial: boolean;

    setShowTutorial: (showTutorial: boolean) => void;
};
export const useAppSettingsStore = create(
    persist(
        (set: SetState<AppSettingsState>) => ({
            showTutorial: true,

            setShowTutorial: (showTutorial: boolean) => set({ showTutorial }),
        }),
        {
            name: 'Datenanfragen.de-app-settings',
            version: 0,
            // TODO: Use our new PrivacyAsynStorage here once it is available through the package.
            getStorage: () => localStorage,
        }
    )
);
