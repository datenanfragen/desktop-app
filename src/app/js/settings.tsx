import { EmailAccountSettingsInput, flash, FlashMessage, I18nWidget } from '@datenanfragen/components';
import { IntlProvider, Text } from 'preact-i18n';
import { useAppSettingsStore } from './store/settings';

export const Settings = () => {
    const [setEmailAccountSetting, setReceiveNotifications] = useAppSettingsStore((state) => [
        state.setEmailAccountSetting,
        state.setReceiveNotifications,
    ]);
    const receiveNotifications = useAppSettingsStore((state) => state.receiveNotifications);
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

    return (
        <IntlProvider definition={window.I18N_DEFINITION_APP} scope="settings">
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

                <hr style="margin: 15px 0;" />

                <label>
                    <input
                        checked={receiveNotifications}
                        type="checkbox"
                        className="form-element"
                        onChange={(e) => setReceiveNotifications(e.currentTarget.checked)}
                    />
                    <Text id="receive-notifications" />
                </label>

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
