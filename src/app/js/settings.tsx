import {
    EmailAccountSettingsInput,
    flash,
    FlashMessage,
    I18nWidget,
    useCacheStore,
    useAppStore,
} from '@datenanfragen/components';
import hardcodedOfflineData from '@datenanfragen/components/dist/offline-data.json';
import { IntlProvider, Text } from 'preact-i18n';
import { useAppSettingsStore } from './store/settings';

export const Settings = () => {
    const [setEmailAccountSetting, setReceiveNotifications, setUseOfflineSearch] = useAppSettingsStore((state) => [
        state.setEmailAccountSetting,
        state.setReceiveNotifications,
        state.setUseOfflineSearch,
    ]);
    const [receiveNotifications, useOfflineSearch] = useAppSettingsStore((state) => [
        state.receiveNotifications,
        state.useOfflineSearch,
    ]);
    const emailAccountSettings = useAppSettingsStore((state) => ({
        imapUser: state.imapUser,
        imapHost: state.imapHost,
        imapPort: state.imapPort,
        imapUseSsl: state.imapUseSsl,
        imapUseStartTls: true,

        smtpUser: state.smtpUser,
        smtpHost: state.smtpHost,
        smtpPort: state.smtpPort,
        smtpUseSsl: state.smtpUseSsl,
        smtpUseStartTls: true,
    }));

    const savedLocale = useAppStore((state) => state.savedLocale);

    const [offlineData, updateOfflineData] = useCacheStore((state) => [state.offlineData, state.updateOfflineData]);
    const offlineDataDate = offlineData ? JSON.parse(offlineData).date : hardcodedOfflineData.date;

    return (
        <IntlProvider definition={window.I18N_DEFINITION_APP} scope="settings">
            <h1>
                <Text id="title" />
            </h1>

            <div>
                <fieldset style="margin-bottom: 20px;">
                    <legend>
                        <Text id="i18n" />
                    </legend>

                    <I18nWidget
                        minimal={true}
                        showLanguageOnly={false}
                        saveLanguagesToStore={true}
                        onSavedLanguage={() => window.location.reload()}
                    />
                </fieldset>

                <fieldset style="margin-bottom: 20px;">
                    <legend>
                        <Text id="features" />
                    </legend>

                    <label>
                        <input
                            checked={receiveNotifications}
                            type="checkbox"
                            className="form-element"
                            onChange={(e) => setReceiveNotifications(e.currentTarget.checked)}
                        />
                        <Text id="receive-notifications" />
                    </label>
                    <br />
                    <label>
                        <input
                            checked={useOfflineSearch}
                            type="checkbox"
                            className="form-element"
                            onChange={(e) => setUseOfflineSearch(e.currentTarget.checked)}
                        />
                        <Text id="use-offline-search" />
                    </label>
                    {useOfflineSearch && (
                        <>
                            <br />
                            <Text
                                id="offline-search-updated-at"
                                fields={{
                                    date: new Date(offlineDataDate).toLocaleString(savedLocale, {
                                        dateStyle: 'long',
                                        timeStyle: 'medium',
                                    }),
                                }}
                            />{' '}
                            <button className="button button-secondary button-small" onClick={updateOfflineData}>
                                <Text id="offline-search-update" />
                            </button>
                        </>
                    )}
                </fieldset>

                <EmailAccountSettingsInput
                    emailAccountSettings={emailAccountSettings}
                    allowInsecureConnection={false}
                    setEmailAccountSetting={setEmailAccountSetting}
                    verifyConnection={() =>
                        window.email.verifyConnection().then((valid) => {
                            if (valid)
                                flash(
                                    <FlashMessage type="success">
                                        <IntlProvider definition={window.I18N_DEFINITION_APP} scope="settings">
                                            <Text id="smtp-connection-success" />
                                        </IntlProvider>
                                    </FlashMessage>
                                );
                            else
                                flash(
                                    <FlashMessage type="error">
                                        <IntlProvider definition={window.I18N_DEFINITION_APP} scope="settings">
                                            <Text id="smtp-connection-error" />
                                        </IntlProvider>
                                    </FlashMessage>
                                );
                        })
                    }
                />
            </div>
        </IntlProvider>
    );
};
