import { render } from 'preact';
import { useMemo } from 'preact/hooks';
import {
    RequestGeneratorProvider,
    createGeneratorStore,
    App,
    useWizard,
    mailto_handlers,
    EmailData,
    t_a,
    AppMenu,
    ProceedingsList,
    miniSearchClient,
    useCacheStore,
    mail2pdf,
    BlobStorage,
    flash,
    FlashMessage,
} from '@datenanfragen/components';
import { useAppSettingsStore } from './store/settings';
import { SetupTutorial } from './setup-tutorial';
import { Settings } from './settings';

const NewRequestsPage = () => {
    const [fromEmail, useOfflineSearch] = useAppSettingsStore((state) => [state.smtpUser, state.useOfflineSearch]);
    const miniSearch = useCacheStore((state) => state.miniSearch);
    const blobStorage = useMemo(() => new BlobStorage(), []);

    const sendMail =
        fromEmail === ''
            ? undefined
            : (data: EmailData) =>
                  window.email
                      .sendMessage({ ...data, from: fromEmail })
                      .then((info) => {
                          flash(<FlashMessage type="success">{t_a('send-email-success', 'generator')}</FlashMessage>);
                          return { content: info.content.buffer, messageId: info.messageId };
                      })
                      .catch((e) => {
                          console.error(e);
                          flash(<FlashMessage type="error">{t_a('send-email-error', 'generator')}</FlashMessage>);
                      });

    return (
        <RequestGeneratorProvider createStore={createGeneratorStore}>
            <App
                pageOptions={{
                    mailtoDropdown: {
                        handlers: sendMail
                            ? ['mailto', 'sendmail' as unknown as keyof typeof mailto_handlers]
                            : ['mailto'],
                        additionalHandlers: {
                            sendmail: {
                                onClick: (d) => sendMail?.(d),
                                countries: [],
                            },
                        },
                    },
                    searchClient: useOfflineSearch ? (params) => miniSearchClient(miniSearch, params) : undefined,
                    actionButton: {
                        createContentBlob: (emailOrPdfBlob, filename?: string) =>
                            (emailOrPdfBlob instanceof ArrayBuffer
                                ? mail2pdf(emailOrPdfBlob)
                                : new Promise<Blob>((resolve) => resolve(emailOrPdfBlob))
                            )
                                .then((pdfBlob) => {
                                    const uuid = crypto.randomUUID();
                                    return blobStorage.setBlob('proceeding-files', uuid, pdfBlob);
                                })
                                .then((uuid) => ({ blobId: uuid, filename: filename || uuid + '.pdf' })),
                    },
                }}
            />
        </RequestGeneratorProvider>
    );
};

const pages = (setPage: SetDesktopAppPageFunction) => ({
    newRequests: {
        title: t_a('new-requests', 'app'),
        component: <NewRequestsPage />,
    },
    proceedings: {
        title: t_a('proceedings', 'app'),
        component: <ProceedingsList setPage={setPage} userEmailRegex={useAppSettingsStore.getState().smtpUser} />,
    },
    settings: {
        title: t_a('settings', 'app'),
        component: <Settings />,
    },
});

export type DesktopAppPageId = keyof ReturnType<typeof pages>;
export type SetDesktopAppPageFunction = (newPage: DesktopAppPageId) => void;

const DesktopApp = () => {
    const [showTutorial, useOfflineSearch] = useAppSettingsStore((state) => [
        state.showTutorial,
        state.useOfflineSearch,
    ]);
    const offlineDataDate = useCacheStore((state) => state.date);
    const updateOfflineData = useCacheStore((state) => state.updateOfflineData);

    // TODO: Allow specifying an actual from email.

    const { Wizard, set, pageId } = useWizard(pages(setPage), {
        initialPageId: 'newRequests',
    });

    function setPage(new_page: DesktopAppPageId) {
        set(new_page);
    }
    window.setPage = setPage;

    return showTutorial ? (
        <SetupTutorial />
    ) : (
        <>
            <AppMenu setPage={setPage} activePage={pageId || 'newRequests'} />
            {useOfflineSearch && new Date(offlineDataDate) < new Date(Date.now() - 1000 * 60 * 60 * 24 * 14) && (
                <div class="box box-warning" style="margin-bottom: 20px;">
                    {t_a('offline-data-outdated', 'settings')}
                    <button class="button button-secondary button-small" onClick={updateOfflineData}>
                        {t_a('offline-search-update', 'settings')}
                    </button>
                </div>
            )}
            <Wizard />
        </>
    );
};

const el = document.getElementById('app');
if (el) render(<DesktopApp />, el);
