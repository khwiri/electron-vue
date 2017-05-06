const fs = require('fs');
const {ipcRenderer} = require('electron');
const Vue = require('vue');
const compiler = require('vue-template-compiler');

class ElectronVue extends Vue {
    constructor(...args) {
        if(args.length) {
            // make sure we have a data object
            if(!args[0].data)
                args[0].data = {};

            // mix ev object with defaults
            args[0].data.electronVue = Object.assign({
                errorText: 'EV Template Error',
                errorStyles: {
                    color: '#fff',
                    background: '#f50000',
                    textAlign: 'center',
                    padding: '10px',
                    borderRadius: '4px'
                }
            }, args[0].data.electronVue);

            // if there's not already a render method then generate one from
            // the template attribute
            if(!args[0].render)
                Object.assign(args[0], ElectronVue.createRenderer(args[0].template));

            // register local components which just means to convert component
            // template attributes to render functions
            if(args[0].components)
                ElectronVue.registerComponents(args[0].components);

            // register ipc callbacks
            ElectronVue.ipcRegistration(args[0].data.electronVue.ipc);
        }

        super(...args);
    }

    /**
     * This function recusively loops through components and creates
     * render functions for template attributes.
     * @see {@link https://vuejs.org/v2/guide/components.html#Local-Registration}
     * @param {object} components Local registration component object
     */
    static registerComponents(components) {
        for(let name in components) {
            let component = components[name];

            // if there's not a render method then generate one from the
            // template attribute
            if(!component.render)
                Object.assign(component, ElectronVue.createRenderer(component.template));

            // if this component has child components then recursively
            // register them too
            if(component.components)
                ElectronVue.registerComponents(component.components);
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
     * @param {string} ipcCallbacks An object of callback methods to be registered.
     */
    static ipcRegistration(ipc) {
        for(let name in ipc) {
            let callback = ipc[name];
            if(typeof callback == 'object')
                ipcRenderer.on(ElectronVue.toSpinalCase(callback.channel), callback.method);
            else
                ipcRenderer.on(ElectronVue.toSpinalCase(name), callback);
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
