import { I18nWidget, useAppStore } from '@datenanfragen/components';
import { IntlProvider, Text } from 'preact-i18n';

export const Settings = () => {
    const country = useAppStore((state) => state.country);
    const changeCountry = useAppStore((state) => state.changeCountry);

    return (
        <IntlProvider definition={window.I18N_DEFINITIONS_ELECTRON} scope="settings">
            <h1>
                <Text id="title" />
            </h1>

            <div>
                <I18nWidget
                    minimal={true}
                    showLanguageOnly={false}
                    saveLanguagesToStore={true}
                    onSavedLanguage={() => window.location.reload()}
                />
            </div>
        </IntlProvider>
    );
};
