import {
    getGeneratedMessage,
    getNameFromMesssage,
    setupWindow,
    setupWindowForApp,
    t,
    t_a,
    useAppStore,
} from '@datenanfragen/components';
import { useAppSettingsStore } from './store/settings';

useAppStore.getState().setPreference('saveRequestContent', true);
setupWindow({ supported_languages: { en: undefined, de: undefined }, locale: useAppStore.getState().savedLocale });
setupWindowForApp(useAppStore.getState().savedLocale);
if (process.env.NODE_ENV === 'development')
    (window as typeof window & { BASE_URL: string }).BASE_URL = 'http://localhost:1314/';

window.ON_PROCEEDING_STATUS_CHANGE = (proceeding) => {
    if (!useAppSettingsStore.getState().receiveNotifications) return;

    if (proceeding.status === 'overdue') {
        const originalRequest = getGeneratedMessage(proceeding, 'request')!;
        const summaryLine = t('request-summary-line', 'my-requests', {
            type: t(originalRequest.type, 'my-requests'),
            recipient: getNameFromMesssage(originalRequest) || '',
            date: originalRequest.date.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
            reference: proceeding.reference,
        });

        new Notification(summaryLine, { body: t_a('overdue-notification-body', 'proceedings') }).onclick = () =>
            window.setPage?.('proceedings');
    }
};

// TODO: Error handler.
const logError = (err: ErrorEvent | PromiseRejectionEvent) => {
    console.error('An error occurred:', err);
};
window.addEventListener('unhandledrejection', (e) => {
    // Work around annoying Chromium bug, see: https://stackoverflow.com/q/72396527
    if ('defaultPrevented' in e && !e.defaultPrevented) logError(e.reason);
});
window.addEventListener('error', logError);
