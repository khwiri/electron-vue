const assert = require('assert');
const {describe, it} = require('mocha');
const ElectronVue = require('../index.js');
const serverRenderer = require('vue-server-renderer');

describe('Template Rendering Tests', function() {
    const renderer = serverRenderer.createRenderer();

    it('String Template Test', function() {
        const v = new ElectronVue({
            template: '<div>{{ message }}</div>',
            data: {
                message: 'template as string'
            }
        });

        renderer.renderToString(v, (error, html) => {
            assert.equal(html, '<div data-server-rendered="true">template as string</div>');
        });
    });

    it('File Template Test', function() {
        const v = new ElectronVue({
            template: `${__dirname}/data/template.html`,
            data: {
                message: 'template file'
            }
        });

        renderer.renderToString(v, (error, html) => {
            assert.equal(html, '<div data-server-rendered="true">template file</div>');
        });
    });

    it('Simple Component Test', function() {
        const v = new ElectronVue({
            data: {
                app: 'app'
            },
            template: `${__dirname}/data/simple-component.html`,
            components: {
                'child-component-a': {
                    data: () => {
                        return {child: 'child'};
                    },
                    template: `${__dirname}/data/child-component-a.html`
                }
            }
        });

        renderer.renderToString(v, (error, html) => {
            assert.equal(html, '<div data-server-rendered="true">app<div>child</div></div>');
        });
    });

    it('Complex Component Test', function() {
        const v = new ElectronVue({
            data: {
                app: 'app'
            },
            template: `${__dirname}/data/complex-component.html`,
            components: {
                'child-component-a': {
                    data: () => {
                        return {child: 'child'};
                    },
                    template: `${__dirname}/data/child-component-a.html`
                },
                'child-component-b': {
                    template: `${__dirname}/data/child-component-b.html`,
                    data: () => {
                        return {child: 'childb'};
                    },
                    components: {
                        'child-component-bb': {
                            props: ['child'],
                            template: `${__dirname}/data/child-component-bb.html`
                        }
                    }
                }
            }
        });

        renderer.renderToString(v, (error, html) => {
            assert.equal(html, '<div data-server-rendered="true">app<div>child</div><div>childb<div>childb</div></div></div>');
        });
    });
});
