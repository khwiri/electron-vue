const fs = require('fs');
const {ipcRenderer} = require('electron');
const Vue = require('vue');
const compiler = require('vue-template-compiler');

class ElectronVue extends Vue {
    constructor(...args) {
        if(args.length)
            ElectronVue.processArguments(args[0]);
        super(...args);
    }

    /**
     * This method processes any incoming arguments and supplements them
     * for ElectronVue's needs before any Vue initialization happens.
     * @param {object} args The object defining a Vue as passed into this object's constructor
     */
    static processArguments(args) {
        // This makes sure we have a data object and if
        // it's a function then it's converted to an object.
        // Converting the function to an object might limit the
        // ability of callers to implement more dynamic data setup
        // procedures.  This should probably be addressed in a future
        // release.
        if(!args.data)
            args.data = {};
        else if(typeof args.data != 'object')
            args.data = args.data();

        // mix ev object with defaults
        args.data.electronVue = Object.assign({
            errorText: 'EV Template Error',
            errorStyles: {
                color: '#fff',
                background: '#f50000',
                textAlign: 'center',
                padding: '10px',
                borderRadius: '4px'
            }
        }, args.data.electronVue);

        // if there's not already a render method then generate one from
        // the template attribute
        if(!args.render)
            Object.assign(args, ElectronVue.createRenderer(args.template));

        // register local components which just means to convert component
        // template attributes to render functions
        if(args.components)
            ElectronVue.processComponents(args.components);

        // register a callback to use for ipc registration once the vue has
        // been instantiated
        args.mixins = [{
            created() {
                if(args.ipc)
                    ElectronVue.ipcRegistration(this, args.ipc);
            },
            destroyed() {
                if(args.ipc)
                    ElectronVue.ipcRemoveListeners(this, args.ipc);
            }
        }];
    }

    /**
     * This function recusively loops through components and creates
     * render functions for template attributes.
     * @see {@link https://vuejs.org/v2/guide/components.html#Local-Registration}
     * @param {object} components Local registration component object
     */
    static processComponents(components) {
        for(let name in components) {
            let component = components[name];

            // register callbacks for each component so that their ipc callbacks
            // can be registered once each component has been instantiated
            component.mixins = [{
                created() {
                    if(component.ipc)
                        ElectronVue.ipcRegistration(this, component.ipc);
                },
                destroyed() {
                    if(component.ipc)
                        ElectronVue.ipcRemoveListeners(this, component.ipc);
                }
            }];

            // if there's not a render method then generate one from the
            // template attribute
            if(!component.render)
                Object.assign(component, ElectronVue.createRenderer(component.template));

            // if this component has child components then recursively
            // register them too
            if(component.components)
                ElectronVue.processComponents(component.components);
        }
    }

    /**
     * This function adds the ability to reference html files
     * as templates in addition to the standard vue implementation.
     * @param {string} template Template value
     * @return {function} Vue render method
     */
    static createRenderer(template) {
        if(template && template.endsWith('.html')) {
            try {
                template = fs.readFileSync(template, 'utf-8');
            } catch(err) {
                console.error(err);
                template = '<div v-bind:style="electronVue.errorStyles" v-text="electronVue.errorText"></div>';
            }
        }

        return compiler.compileToFunctions(template);
    }

    /**
     * This registers all functions as callbacks for the main process.
     * @param {object} thisArg A value to bind with callbacks so that they have an appropriate this.
     * @param {string} ipcCallbacks An object of callback methods to be registered.
     */
    static ipcRegistration(thisArg, ipc) {
        thisArg.$electronVue = {
            ipcCallbacks: []
        };

        for(const name in ipc) {
            const callback = ipc[name];
            let channel = ElectronVue.toSpinalCase(name);
            let boundCallback = callback.bind(thisArg);
            if(typeof callback == 'object') {
                channel = ElectronVue.toSpinalCase(callback.channel);
                boundCallback = callback.method.bind(thisArg);
            }

            thisArg.$electronVue.ipcCallbacks.push({channel: channel, method: boundCallback});
            ipcRenderer.on(channel, boundCallback);
        }
    }

    /**
     * This unregisters all ipc callback methods currently registered for this instance.  In other words,
     * this removes all channels previously registered with the ipcRenderer.
     * @param {object} thisArg The vue instance containing registered ipc callbacks.
     */
    static ipcRemoveListeners(thisArg) {
        if(thisArg.$electronVue && thisArg.$electronVue.ipcCallbacks) {
            for(const callback of thisArg.$electronVue.ipcCallbacks) {
                ipcRenderer.removeListener(callback.channel, callback.method);
            }
        }
    }

    /**
     * This function converts camelcase strings into spinalcase
     * by attempting to break the string into words based on
     * capitalization.
     * @param {string} value The camelcase value to convert.
     * @return {string} A spinalcase version of the camelcase value.
     */
    static toSpinalCase(value) {
        let words = [];
        let lower = false;
        let wasLower = lower;

        for(const c of value) {
            if(!words.length) {
                words.push([c]);
                if(c == c.toLowerCase()) {
                    lower = true;
                    wasLower = true;
                }
            } else {
                lower = false;
                if(c == c.toLowerCase())
                    lower = true;

                const lastWordIndex = words.length - 1;
                if(lower != wasLower) {
                    const lastWordLastIndex = words[lastWordIndex].length - 1;
                    const lastChar = words[lastWordIndex][lastWordLastIndex];

                    // Okay, this gets a little dicey.  If the last character of the
                    // last word is uppercase then some things need to be shuffled
                    // around a bit.  Otherwise, just start a new word with the
                    // current character as the first letter in the word.
                    if(lastChar == lastChar.toUpperCase()) {
                        // The last character of the previous word was uppercase.
                        // Therefore, remove it from the previous word and make it
                        // the first character in the new word.
                        words[lastWordIndex].pop();

                        // If the previous word is empty after removing the last
                        // character, then remove it from the list of words so that
                        // we don't end up with a blank word.
                        if(!words[lastWordIndex].length)
                            words.splice(lastWordIndex, 1);

                        // Lastly, push the last character of the previous word and
                        // the current character into a new word as the first two
                        // characters.
                        words.push([lastChar, c]);
                    } else
                        words.push([c]);
                } else
                    words[lastWordIndex].push(c);

                wasLower = lower;
            }
        }

        // This just takes the list of words and smashes them together to
        // produce a lowercase string with hyphens between each word.
        return words.map((word) => {
            return word.join('');
        }).join('-').toLowerCase();
    }
}

module.exports = ElectronVue;
