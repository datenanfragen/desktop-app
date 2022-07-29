import { join } from 'path';
import { app, BrowserWindow, session, shell } from 'electron';
import { setupIpc } from './ipc';

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

    win.loadFile(join(__dirname, '..', '..', 'dist', 'app', 'index.html'));

    if (!app.isPackaged) win.webContents.openDevTools();
};

app.enableSandbox();
app.whenReady().then(() => {
    // By default, Electron automatically approves all permission requests (notifications, camera, microphone, etc.). We
    // likely won't need any (or few) of those, so for now, we'll deny them all.
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => callback(false));

    // Set a secure CSP for every request.
    // TODO: Make it possible to completely disable requests to us.
    const dade_origins =
        'https://www.datenanfragen.de https://www.datarequests.org https://www.demandetesdonnees.fr https://www.pedidodedados.org https://www.solicituddedatos.es https://www.osobnipodaci.org https://www.gegevensaanvragen.nl';
    session.defaultSession.webRequest.onHeadersReceived((details, callback) =>
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    `default-src 'self'; script-src 'self'; connect-src 'self'${
                        // Parcel uses `ws://localhost:1234` for HMR.
                        app.isPackaged ? '' : ' ws://localhost:1234 http://localhost:1314'
                    } ${dade_origins} https://static.dacdn.de https://search.datenanfragen.de; font-src 'self' data:; worker-src blob:; img-src 'self' data:;`,
                ],
            },
        })
    );

    setupIpc();
    createWindow();

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
        if (parsedUrl.protocol !== 'file:') {
            console.log('Blocking navigation to', parsedUrl);
            event.preventDefault();
        }
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
