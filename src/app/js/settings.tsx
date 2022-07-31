import { I18nWidget } from '@datenanfragen/components';
import { IntlProvider, Text } from 'preact-i18n';
import { useAppSettingsStore } from './store/settings';
import { useState } from 'preact/hooks';

export const Settings = () => (
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
            <SmtpSettingsInput key="email-settings-component" />
        </div>
    </IntlProvider>
);

const SmtpSettingsInput = () => {
    const setSmtpSetting = useAppSettingsStore((state) => state.setSmtpSetting);
    const [port, host, fromEmail, secure] = useAppSettingsStore((state) => [
        state.smtpPort,
        state.smtpHost,
        state.fromEmail,
        state.smtpSecure,
    ]);
    const [showPassword, setShowPassword] = useState(false);

    // TODO: For some reason that I do not understand at all, this is rerendered on every change breaking
    return (
        <fieldset className="label-only-fieldset" key="email-settings">
            <legend>
                <Text id="email-settings" />
            </legend>
            <Text id="email-settings-explanation" />

            <div className="form-group" key="email-from-container">
                <label htmlFor="from-email">
                    <Text id="from-email" />
                </label>
                <input
                    type="email"
                    className="form-element"
                    id="from-email"
                    value={fromEmail}
                    key="email-from-input"
                    onChange={(e) => setSmtpSetting('fromEmail', e.currentTarget.value)}
                />
            </div>
            <div className="form-group" key="email-password-container">
                <label htmlFor="email-password">
                    <Text id="email-password" />
                </label>
                <button
                    className="button button-secondary button-small icon icon-access"
                    onClick={() => setShowPassword(!showPassword)}
                />
                <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-element"
                    id="email-password"
                    key="email-password-input"
                    onChange={(e) =>
                        void e.currentTarget.value !== '' && window.email.setSmtpPassword(e.currentTarget.value)
                    }
                />
            </div>
            <div className="form-group" key="email-host-container">
                <label htmlFor="email-host">
                    <Text id="email-host" />
                </label>
                <input
                    type="text"
                    className="form-element"
                    id="email-host"
                    value={host}
                    onChange={(e) => setSmtpSetting('smtpHost', e.currentTarget.value)}
                    key="email-host-input"
                />
            </div>
            <div className="form-group" key="email-port-container">
                <label htmlFor="email-port">
                    <Text id="email-port" />
                </label>
                <input
                    type="number"
                    className="form-element"
                    id="email-port"
                    value={port}
                    onChange={(e) => {
                        const parsedPort = parseInt(e.currentTarget.value);
                        setSmtpSetting(
                            'smtpPort',
                            !isNaN(parsedPort) && parsedPort > 0 && parsedPort < 65535 ? parsedPort : 587
                        );
                    }}
                    min={1}
                    max={65535}
                    key="email-port-input"
                />
            </div>
            <div className="form-group" key="email-secure-container">
                <input
                    type="checkbox"
                    className="form-element"
                    id="email-secure"
                    checked={secure}
                    onChange={(e) => setSmtpSetting('smtpSecure', e.currentTarget.checked)}
                    key="email-secure-input"
                />
                <label htmlFor="email-secure">
                    <Text id="email-secure" />
                </label>
            </div>
        </fieldset>
    );
};
