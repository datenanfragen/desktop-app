import { join } from 'path';
import { app, BrowserWindow, session, shell } from 'electron';
import { setupIpc } from './ipc';
import { setMenu } from './menu';
import { legalBaseUrlHostnames, legalBaseUrls } from './consts';

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1920,
        height: 900,

        webPreferences: {
            preload: join(__dirname, 'preload.js'),

            devTools: !app.isPackaged,

            // Explicitly set security preferences to their (secure) defaults, just in case.
            nodeIntegration: false,
            nodeIntegrationInWorker: false,
            nodeIntegrationInSubFrames: false,
            sandbox: true,
            webSecurity: true,
            allowRunningInsecureContent: false,
            experimentalFeatures: false,
            contextIsolation: true,
            webviewTag: false,
            navigateOnDragDrop: false,
        },
    });
    setMenu();

    win.loadFile(join(__dirname, '..', '..', 'parcel_dist', 'app', 'index.html'));

    if (!app.isPackaged) win.webContents.openDevTools();

    return win;
};

app.enableSandbox();
app.whenReady().then(() => {
    // By default, Electron automatically approves all permission requests (notifications, camera, microphone, etc.). We
    // only need notifications, so we deny the rest.
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        if (permission === 'notifications') callback(true);
        else callback(false);
    });

    // Set a secure CSP for every request.
    // TODO: Make it possible to completely disable requests to us.
    session.defaultSession.webRequest.onHeadersReceived((details, callback) =>
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    `default-src 'self'; script-src 'self'; connect-src 'self'${
                        // Parcel uses `ws://localhost:1234` for HMR.
                        app.isPackaged ? '' : ' ws://localhost:1234 http://localhost:1314'
                    } ${legalBaseUrls
                        .map((u) => u.substring(0, -1))
                        .join(
                            ' '
                        )} https://static.dacdn.de https://search.datenanfragen.de blob:; font-src 'self' data:; worker-src blob:; img-src 'self' data:; style-src 'self' 'unsafe-inline';`,
                ],
            },
        })
    );

    setupIpc();

    // OS-specific behaviour.
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit();
    });
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('web-contents-created', (event, contents) => {
    // Disable navigation to remote sites.
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        // Allow file: navigation.
        if (parsedUrl.protocol === 'file:') return;
        // Open links to our domains in the browser. Important: We still need to `preventDefault()` below!
        else if (parsedUrl.protocol === 'https:' && legalBaseUrlHostnames.includes(parsedUrl.hostname))
            shell.openExternal(parsedUrl.toString());
        // Everything else gets outright blocked.
        else console.log('Blocking navigation to', parsedUrl);

        event.preventDefault();
    });

    // Disable opening additional windows.
    contents.setWindowOpenHandler((details) => {
        const parsedUrl = new URL(details.url);
        if (parsedUrl.protocol === 'mailto:') {
            shell.openExternal(details.url);
        }
        return { action: 'deny' };
    });
});
