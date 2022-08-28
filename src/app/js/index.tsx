import { render } from 'preact';
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
} from '@datenanfragen/components';
import { useAppSettingsStore } from './store/settings';
import { SetupTutorial } from './setup-tutorial';
import { Settings } from './settings';

const pages = (
    setPage: SetDesktopAppPageFunction,
    offlineSearch: false | Parameters<typeof miniSearchClient>[0],
    sendMail?: (data: EmailData) => void
) => ({
    newRequests: {
        title: t_a('new-requests', 'app'),
        component: (
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
                        searchClient: offlineSearch ? (params) => miniSearchClient(offlineSearch, params) : undefined,
                    }}
                />
            </RequestGeneratorProvider>
        ),
    },
    proceedings: {
        title: t_a('proceedings', 'app'),
        component: <ProceedingsList setPage={setPage} />,
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
    // TODO: Allow specifying an actual from email.
    const [fromEmail] = useAppSettingsStore((state) => [state.smtpUser]);

    const [miniSearch, offlineDataDate] = useCacheStore((state) => [state.miniSearch, state.date]);
    const updateOfflineData = useCacheStore((state) => state.updateOfflineData);

    const sendMail =
        fromEmail === ''
            ? undefined
            : (data: EmailData) => {
                  window.email.sendMessage({ ...data, from: fromEmail }).then((info) => {
                      console.log(info);
                      return info;
                  });
              };

    const { Wizard, set, pageId } = useWizard(pages(setPage, useOfflineSearch ? miniSearch : false, sendMail), {
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
            <AppMenu setPage={setPage} activePage={pageId} />
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
