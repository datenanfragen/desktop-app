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
    Reactor,
    MailtoDropdownProps,
} from '@datenanfragen/components';
import { useAppSettingsStore } from './store/settings';
import { SetupTutorial } from './setup-tutorial';
import { Settings } from './settings';
import { NoticesPage } from './Components/NoticesPage';

const useMailtoDropdownProps = () => {
    const fromEmail = useAppSettingsStore((state) => state.smtpUser);
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
    const props: Partial<MailtoDropdownProps> = {
        handlers: sendMail ? ['mailto', 'sendmail' as unknown as keyof typeof mailto_handlers] : ['mailto'],
        additionalHandlers: {
            sendmail: {
                onClick: (d) => sendMail?.(d),
                countries: [],
            },
        },
    };
    return props;
};

const NewRequestsPage = (props: { setPage: SetDesktopAppPageFunction }) => {
    const useOfflineSearch = useAppSettingsStore((state) => state.useOfflineSearch);
    const miniSearch = useCacheStore((state) => state.miniSearch);
    const blobStorage = useMemo(() => new BlobStorage(), []);

    const mailtoDropdown = useMailtoDropdownProps();

    return (
        <RequestGeneratorProvider createStore={createGeneratorStore}>
            <App
                pageOptions={{
                    mailtoDropdown,
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
                    onViewRequests: () => props.setPage('proceedings'),
                }}
            />
        </RequestGeneratorProvider>
    );
};
const ReactorPage = () => {
    const mailtoDropdown = useMailtoDropdownProps();
    return (
        <>
            {window.PARAMETERS.reference && (
                <Reactor reference={window.PARAMETERS.reference} pageOptions={{ mailtoDropdown }} />
            )}
        </>
    );
};

const pages = (setPage: SetDesktopAppPageFunction) => ({
    newRequests: {
        title: t_a('new-requests', 'app'),
        component: <NewRequestsPage setPage={setPage} />,
    },
    reactor: {
        component: <ReactorPage />,
    },
    proceedings: {
        title: t_a('proceedings', 'app'),
        component: <ProceedingsList setPage={setPage} userEmailRegex={useAppSettingsStore.getState().smtpUser} />,
    },
    settings: {
        title: t_a('settings', 'app'),
        component: <Settings setPage={setPage} />,
    },
    notices: {
        component: <NoticesPage />,
    },
});

export type DesktopAppPageId = keyof ReturnType<typeof pages>;
export type SetDesktopAppPageFunction = (newPage: DesktopAppPageId, params?: Record<string, string>) => void;

const DesktopApp = () => {
    const [showTutorial, useOfflineSearch] = useAppSettingsStore((state) => [
        state.showTutorial,
        state.useOfflineSearch,
    ]);
    const offlineDataDate = useCacheStore((state) => state.date);
    const updateOfflineData = useCacheStore((state) => state.updateOfflineData);

    // TODO: Allow specifying an actual from email.

    const { Wizard, set, pageId } = useWizard(pages(setPage), {
        initialPageId: (window.PARAMETERS.page as DesktopAppPageId) || 'newRequests',
    });

    function setPage(newPage: DesktopAppPageId, params?: Record<string, string>) {
        // TODO: Wizard *really* isn't meant to be a router. :| We should replace this with a proper router soon.
        if (params) {
            window.location.hash = `!page=${newPage}${Object.entries(params || {})
                .map(([k, v]) => `&${k}=${v}`)
                .join('')}`;
            setTimeout(() => window.location.reload(), 0);
        } else set(newPage);
    }
    window.setPage = setPage;
    window.preact.onSetPage(setPage);

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
