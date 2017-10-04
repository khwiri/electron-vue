# electron-vue
Vue.js extension for Electron applications

[![Build Status](https://travis-ci.org/nullkeys/electron-vue.svg?branch=feature%2Fdevelop%2Fcode-coverage)](https://travis-ci.org/nullkeys/electron-vue)
[![Coverage Status](https://coveralls.io/repos/github/nullkeys/electron-vue/badge.svg?branch=feature%2Fdevelop%2Fcode-coverage)](https://coveralls.io/github/nullkeys/electron-vue?branch=feature%2Fdevelop%2Fcode-coverage)
[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/nullkeys-electron-vue/Lobby)

## Installation
```
npm install @nullkeys/electron-vue
```

## Getting Started
Since ElectronVue simply extends [Vue.js](https://vuejs.org) with some integration points for building [Electron](https://electron.atom.io) applications, please checkout those projects to help get started.  This document tries to focus on things that have been added by ElectronVue.

## Template Rendering

#### Dead simple example
This is about as simple as it gets when creating a vue.  This example simply associates an ElectronVue instance with an element and renders a bit of data into the output.
```js
new ElectronVue({
    el: '#app',
    template: '<div>{{ message }}</div>',
    data: {
        message: 'This is a template from a string.'
    }
});
```
```html
<!-- input element -->
<div id="app"></div>

<!-- rendered output -->
<div>This is a template from a string.</div>
```

#### External template example
In addition to defining templates as inline strings, you can reference external html files as templates too.  There isn't anything special about the html file in this example, it's just good ol' html.  The only requirement is that the file only has one root element.
```js
new ElectronVue({
    el: '#app',
    template: 'app-template.html'
});
```
```html
<!-- example app-template.html -->
<div>This is a template file.</div>
```
```html
<!-- input element -->
<div id="app"></div>

<!-- rendered output -->
<div>This is a template file.</div>
```


#### Component Registration
You can also register components too.  Here's an example building on ElectronVue's ability to reference external templates.  In this example, a component called ```app-component``` is registered where it produces some content based on an inline template string.

*Note: Only [local registration](https://vuejs.org/v2/guide/components.html#Local-Registration) is currently supported.*
```js
new ElectronVue({
    el: '#app',
    template: 'app-template.html',
    components: {
        'app-component': {
            template: '<div>This is my template.</div>'
        }
    }
});
```
```html
<!-- example app-template.html -->
<app-component></app-component>
```
```html
<!-- input element -->
<div id="app"></div>

<!-- rendered output -->
<div>This is my template.</div>
```

## Electron Messages
ElectronVue attempts to make it easy to pass messages between your Vue in the renderer process and the main process of an Electron application.  Take a look at the [Electron documentation](https://electron.atom.io/docs/api/ipc-main/#sending-messages) to see how this works under the hood.  Here's an example of how it works with an ElectronVue.
```js
// renderer process
const {ipcRenderer} = require('electron');

new ElectronVue({
    el: '#app',
    template: 'app-template.html',
    ipc: {
        pingPong(event, arg) {
            console.log(arg) // prints 'pong'
        }
    }
});

ipcRenderer.send('ping-pong');
```

```js
// main process
const {ipcMain} = require('electron');

ipcMain.on('ping-pong', (event) => {
    event.sender.send('ping-pong', 'pong');
});
```

In the above example, you'll notice that the registered event name on the ipc object is the spinal-case representation of the function name.  ElectronVue attempts to convert functions within this object during the registration process.  If this doesn't work for you, then you can always fallback to the following pattern for a specific event which lets you explicitly define your event name.  It's possible to use both patterns within the same ipc object.
```js
new ElectronVue({
    ipc: {
        tableTennis: {
            channel: 'ping-pong',
            method(event, arg) {
                console.log(arg) // prints 'pong'
            }
        }
    }
});
```

## Running Tests
```
npm test
```
