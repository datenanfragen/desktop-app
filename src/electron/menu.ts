import { Menu, MenuItemConstructorOptions, shell, BrowserWindow } from 'electron';

const url = (baseUrl: string, path: string) => new URL(path, baseUrl).toString();

export const setMenu = (baseUrl = 'https://www.datarequests.org/') => {
    const template: MenuItemConstructorOptions[] = [
        { role: 'fileMenu' },
        { role: 'editMenu' },
        { role: 'viewMenu' },
        { role: 'windowMenu' },
        {
            role: 'help',
            label: 'Help and legal',
            submenu: [
                {
                    label: 'Report an issue',
                    click: () => shell.openExternal('https://github.com/datenanfragen/desktop-app/issues'),
                },
                {
                    label: 'GitHub repository',
                    click: () => shell.openExternal('https://github.com/datenanfragen/desktop-app'),
                },
                { type: 'separator' },
                {
                    label: 'Legal notice and contact',
                    click: () => shell.openExternal(url(baseUrl, '/contact')),
                },
                {
                    label: 'Privacy policy',
                    click: () => shell.openExternal(url(baseUrl, '/privacy')),
                },
                {
                    label: 'License notices',
                    click: () => BrowserWindow.getFocusedWindow()?.webContents.send('preact:setPage', 'notices'),
                },
            ],
        },
    ];
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
};
