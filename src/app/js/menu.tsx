import { DesktopAppPageId, SetDesktopAppPageFunction } from './index';
import { IntlProvider, translate } from 'preact-i18n';

type MenuProps = {
    setPage: SetDesktopAppPageFunction;
    activePage: DesktopAppPageId;
};

const menuItems: Array<{ title: string; pageId: DesktopAppPageId; icon: string }> = [
    {
        title: translate('new-requests', 'app', window.I18N_DEFINITIONS_ELECTRON),
        pageId: 'newRequests',
        icon: 'plus-circle',
    },
    {
        title: translate('proceedings', 'app', window.I18N_DEFINITIONS_ELECTRON),
        pageId: 'proceedings',
        icon: 'conversation',
    },
    { title: translate('settings', 'app', window.I18N_DEFINITIONS_ELECTRON), pageId: 'settings', icon: 'settings' },
];

export const Menu = (props: MenuProps) => (
    <IntlProvider definition={window.I18N_DEFINITIONS_ELECTRON} scope="app">
        <nav id="main-menu">
            <ul>
                {menuItems.map((item) => (
                    <li className={item.pageId === props.activePage ? ' menu-item-active' : ''}>
                        <a
                            href=""
                            className={`menu-link icon icon-${item.icon}`}
                            onClick={(e) => {
                                e.preventDefault();
                                props.setPage(item.pageId);
                            }}
                            title={item.title}
                        />
                    </li>
                ))}
            </ul>
        </nav>
    </IntlProvider>
);
