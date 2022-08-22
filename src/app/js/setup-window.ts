import { setupWindow, setupWindowForApp, useAppStore } from '@datenanfragen/components';

setupWindow({ supported_languages: { en: undefined, de: undefined }, locale: useAppStore.getState().savedLocale });
setupWindowForApp(useAppStore.getState().savedLocale);
if (process.env.NODE_ENV === 'development')
    (window as typeof window & { BASE_URL: string }).BASE_URL = 'http://localhost:1314/';

// TODO: Error handler.
const logError = (err: ErrorEvent | PromiseRejectionEvent) => {
    console.error('An error occurred:', err);
};

const errorHandler = (err: ErrorEvent) => {
    new Notification('An error occurred.', { body: err.message });
    // TODO: Add onclick handler
    logError(err);
};
window.addEventListener('unhandledrejection', (e) => {
    // Work around annoying Chromium bug, see: https://stackoverflow.com/q/72396527
    if ('defaultPrevented' in e && !e.defaultPrevented) errorHandler(e.reason);
});
window.addEventListener('error', errorHandler);
