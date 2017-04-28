# electron-vue
Vue.js extension for Electron applications

## Installation
```
npm install @nullkeys/electron-vue
```

## Getting Started
ElectronVue extends Vue  blah blah blah for integration with an electron application.

#### Dead simple example
```
<!-- html snippet -->
<div id="app"></div>

// js example
new ElectronVue({
    el: '#app',
    template: '<div>{{ message }}</div>',
    data: {
        message: 'template as string'
    }
});
```
That's about as simple as it gets, and here's the rendered html.
```
<div>template as string</div>
```

#### External template example
```
new ElectronVue({
    el: '#app',
    template: 'app-template.html'
});
```
This example loads an external file into our ElectronVue. There's nothing special about the file itself, it's just good ol' html.

#### Using Components
```
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
This is an example of locally registering a component using ElectronVue's ability to reference an external html file.  In this example, the app-template.html file looks simply has the tag ```<app-component></app-component>``` which ultimately renders as the div tag referenced in its template.
