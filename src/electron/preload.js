/* eslint-disable @typescript-eslint/no-var-requires */
const { contextBridge, ipcRenderer } = require('electron');

// TODO: I couldn't figure out how to get Parcel to bundle this properly. Since I anticipate that this file won't get
// noticably more complex than this, that's not too much of a problem.

contextBridge.exposeInMainWorld('email', {
    sendMessage: (options) => ipcRenderer.invoke('email:sendMessage', options),
});
/* eslint-enable @typescript-eslint/no-var-requires */
