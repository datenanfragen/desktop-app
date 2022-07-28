import { render } from 'preact';
import { RequestGeneratorProvider, createGeneratorStore, App, useWizard } from '@datenanfragen/components';
import { useAppSettingsStore } from './store/settings';
import { SetupTutorial } from './setup-tutorial';
import { Menu } from './menu';
import { translate } from 'preact-i18n';

const pages = (setPage: SetDesktopAppPageFunction) => ({
    newRequests: {
        title: translate('new-requests', 'app', window.I18N_DEFINITIONS_ELECTRON),
        component: (
            <RequestGeneratorProvider createStore={createGeneratorStore}>
                <App />
            </RequestGeneratorProvider>
        ),
    },
    proceedings: {
        title: translate('proceedings', 'app', window.I18N_DEFINITIONS_ELECTRON),
        component: <h1>Proceedings</h1>,
    },
    settings: {
        title: translate('settings', 'app', window.I18N_DEFINITIONS_ELECTRON),
        component: <h1>Settings</h1>,
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
