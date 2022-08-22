import { EmailAccountSettingsInput, flash, FlashMessage, I18nWidget } from '@datenanfragen/components';
import { IntlProvider, Text } from 'preact-i18n';
import { useAppSettingsStore } from './store/settings';

export const Settings = () => {
    const setEmailAccountSetting = useAppSettingsStore((state) => state.setEmailAccountSetting);
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
                <EmailAccountSettingsInput
                    emailAccountSettings={emailAccountSettings}
                    allowInsecureConnection={false}
                    setEmailAccountSetting={setEmailAccountSetting}
                    // TODO!
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
