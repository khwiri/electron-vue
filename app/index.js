const {app, ipcMain, BrowserWindow, dialog} = require('electron');

let win;

function createWindow() {
    win = new BrowserWindow({width: 800, height: 600});
    win.loadURL(`file://${__dirname}/index.html`);

    win.on('closed', () => {
        win = null;
    });
}

app.on('ready', createWindow);

ipcMain.on('ping', (event) => {
    console.log('ping was called');
    event.sender.send('pong', {meh: 'foo'});
});
