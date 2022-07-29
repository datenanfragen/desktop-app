import { render } from 'preact';
import { RequestGeneratorProvider, createGeneratorStore, App, useWizard } from '@datenanfragen/components';
import { useAppSettingsStore } from './store/settings';
import { SetupTutorial } from './setup-tutorial';
import { Menu } from './menu';
import { translate } from 'preact-i18n';
import { Settings } from './settings';

const pages = (setPage: SetDesktopAppPageFunction) => ({
    newRequests: {
        title: translate('new-requests', 'app', window.I18N_DEFINITIONS_ELECTRON),
        component: (
            <RequestGeneratorProvider createStore={createGeneratorStore}>
                <App
                    pageOptions={{
                        mailtoDropdown: {
                            handlers: ['mailto', 'sendmail'],
                            sendEmail: (options) =>
                                window.email.sendMessage(options).then((info) => {
                                    console.log(info);
                                    return info;
                                }),
                        },
                    }}
                />
            </RequestGeneratorProvider>
        ),
    },
    proceedings: {
        title: translate('proceedings', 'app', window.I18N_DEFINITIONS_ELECTRON),
        component: (
            <>
                <h1>Proceedings</h1>
                <button
                    onClick={() =>
                        window.email
                            .sendMessage({
                                from: 'hi@example.org',
                                to: 'abby.emmerich35@ethereal.email',
                                subject: 'Hello world',
                                text: 'How is it going?',
                            })
                            .then((info) => console.log(info))
                    }
                >
                    Test
                </button>
            </>
        ),
    },
    settings: {
        title: translate('settings', 'app', window.I18N_DEFINITIONS_ELECTRON),
        component: <Settings />,
    },
});

export type DesktopAppPageId = keyof ReturnType<typeof pages>;
export type SetDesktopAppPageFunction = (newPage: DesktopAppPageId) => void;

const DesktopApp = () => {
    const showTutorial = useAppSettingsStore((state) => state.showTutorial);
    const { Wizard, set, pageId } = useWizard(pages(setPage), {
        initialPageId: 'newRequests',
    });

    function setPage(new_page: DesktopAppPageId) {
        set(new_page);
    }

    return showTutorial ? (
        <SetupTutorial />
    ) : (
        <>
            <Menu setPage={setPage} activePage={pageId} />
            <Wizard />
        </>
    );
};

const el = document.getElementById('app');
if (el) render(<DesktopApp />, el);
