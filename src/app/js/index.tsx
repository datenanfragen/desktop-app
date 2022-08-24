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
} from '@datenanfragen/components';
import { useAppSettingsStore } from './store/settings';
import { SetupTutorial } from './setup-tutorial';
import { Settings } from './settings';

const pages = (setPage: SetDesktopAppPageFunction, sendMail?: (data: EmailData) => void) => ({
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
    const showTutorial = useAppSettingsStore((state) => state.showTutorial);
    // TODO: Allow specifying an actual from email.
    const [fromEmail] = useAppSettingsStore((state) => [state.smtpUser]);

    const sendMail =
        fromEmail === ''
            ? undefined
            : (data: EmailData) => {
                  window.email.sendMessage({ ...data, from: fromEmail }).then((info) => {
                      console.log(info);
                      return info;
                  });
              };

    const { Wizard, set, pageId } = useWizard(pages(setPage, sendMail), {
        initialPageId: 'newRequests',
    });

    function setPage(new_page: DesktopAppPageId) {
        set(new_page);
    }

    return showTutorial ? (
        <SetupTutorial />
    ) : (
        <>
            <AppMenu setPage={setPage} activePage={pageId} />
            <Wizard />
        </>
    );
};

const el = document.getElementById('app');
if (el) render(<DesktopApp />, el);
