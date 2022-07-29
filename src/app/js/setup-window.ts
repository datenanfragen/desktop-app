import { setupWindow, useAppStore } from '@datenanfragen/components';
import en_electron_translations from '../i18n/en.json';

const translations = {
    en: en_electron_translations,
};

console.log(useAppStore.getState().savedLocale);
setupWindow({ supported_languages: { en: undefined, de: undefined }, locale: useAppStore.getState().savedLocale });
if (process.env.NODE_ENV === 'development')
    (window as typeof window & { BASE_URL: string }).BASE_URL = 'http://localhost:1314/';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.I18N_DEFINITIONS_ELECTRON =
    translations[(window as typeof window & { LOCALE: string }).LOCALE as keyof typeof translations];

// TODO: Error handler.
const logError = (err: ErrorEvent | PromiseRejectionEvent) => {
    console.error('An error occurred:', err);
};

const errorHandler = (err: ErrorEvent) => {
    const errorNotification = new Notification('An error occured', { body: err.message });
    // TODO: Add onclick handler
    logError(err);
};
window.addEventListener('unhandledrejection', (e) => {
    // Work around annoying Chromium bug, see: https://stackoverflow.com/q/72396527
    if ('defaultPrevented' in e && !e.defaultPrevented) errorHandler(e.reason);
});
window.addEventListener('error', errorHandler);
