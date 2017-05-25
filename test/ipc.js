const assert = require('assert');
const {describe, it} = require('mocha');
const {Application} = require('spectron');
const electronPrebuilt = require('electron-prebuilt');
const {ipcRenderer} = require('electron');
const ElectronVue = require('../index.js');

describe('IPC Registration Tests', function() {
    this.timeout(10000);

    beforeEach(function() {
        this.app = new Application({
            path: electronPrebuilt,
            args: ['app']
        });

        return this.app.start();
    });

    afterEach(function() {
        if(this.app && this.app.isRunning())
            return this.app.stop();
    });

    it('Simple ipc message from the renderer to the main process', function(done) {
        let app = this.app;
        app.client.waitUntilWindowLoaded().then(function() {
            app.electron.ipcRenderer.on('pong', function(e, p) {
                console.log('pong called');
                done();
            });

            app.electron.ipcRenderer.send('ping');
        });
    });
});
