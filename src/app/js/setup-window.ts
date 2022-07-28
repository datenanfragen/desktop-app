import { setupWindow } from '@datenanfragen/components';
import en_electron_translations from '../i18n/en.json';

const translations = {
    en: en_electron_translations,
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.LOCALE = 'en';

setupWindow();
if (process.env.NODE_ENV === 'development')
    (window as typeof window & { BASE_URL: string }).BASE_URL = 'http://localhost:1314/';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.I18N_DEFINITIONS_ELECTRON =
    translations[(window as typeof window & { LOCALE: string }).LOCALE as keyof typeof translations];

// TODO: Error handler.
const logError = (err: ErrorEvent | PromiseRejectionEvent) => {
    // Work around annoying Chromium bug, see: https://stackoverflow.com/q/72396527
    if ('defaultPrevented' in err && !err.defaultPrevented) console.error('An error occurred:', err);
};

const errorHandler = (err: Error | ErrorEvent) => {
    const errorNotification = new Notification('An error occured', { body: err.message });
    // TODO: Add onclick handler
    logError(err);
};
window.addEventListener('unhandledrejection', (e) => errorHandler(e.reason));
window.addEventListener('error', errorHandler);
