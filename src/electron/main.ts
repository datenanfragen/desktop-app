import { app, BrowserWindow, session } from 'electron';
import { join } from 'path';
import electronReloader from 'electron-reloader';

try {
    electronReloader(module, {
        ignore: [/src\/.+/],
        watchRenderer: false, // We are using Parcel's HMR.
    });
} catch {}

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
    });

    win.loadFile(join(__dirname, '..', 'app', 'index.html'));
};

app.enableSandbox();
app.whenReady().then(() => {
    // By default, Electron automatically approves all permission requests (notifications, camera, microphone, etc.). We
    // likely won't need any (or few) of those, so for now, we'll deny them all.
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        callback(false);
    });
    // Set a secure CSP for every request.
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    app.isPackaged
                        ? "default-src 'self'; script-src 'self'"
                        : // Parcel uses `ws://localhost:1234` for HMR.
                          "default-src 'self'; script-src 'self'; connect-src 'self' ws://localhost:1234",
                ],
            },
        });
    });

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
    contents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });
});
