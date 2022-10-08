/* eslint-disable @typescript-eslint/no-var-requires */
const { contextBridge, ipcRenderer } = require('electron');

// TODO: I couldn't figure out how to get Parcel to bundle this properly. Since I anticipate that this file won't get
// noticably more complex than this, that's not too much of a problem.

contextBridge.exposeInMainWorld('app', {
    setBaseUrl: (baseUrl) => ipcRenderer.invoke('app:setBaseUrl', baseUrl),
});
contextBridge.exposeInMainWorld('email', {
    recreateEmailClients: (options) => ipcRenderer.invoke('email:recreateEmailClients', options),
    verifyConnection: () => ipcRenderer.invoke('email:verifyConnection'),
    setEmailAccountPassword: (protocol, password) =>
        ipcRenderer.invoke('email:setEmailAccountPassword', protocol, password),
    sendMessage: (options) => ipcRenderer.invoke('email:sendMessage', options),
    getFolders: () => ipcRenderer.invoke('email:getFolders'),
    getMessages: (options) => ipcRenderer.invoke('email:getMessages', options),
    downloadMessage: (folder, seq) =>
        ipcRenderer.invoke('email:downloadMessage', folder, seq).then((res) => res.buffer),
    htmlToPdf: (html, title, address) =>
        ipcRenderer.invoke('email:htmlToPdf', html, title, address).then((res) => new Blob([res.buffer])),
});
contextBridge.exposeInMainWorld('preact', {
    onSetPage: (callback) => ipcRenderer.on('preact:setPage', (_, page) => callback(page)),
});
/* eslint-enable @typescript-eslint/no-var-requires */
