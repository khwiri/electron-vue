const assert = require('assert');
const {describe, it} = require('mocha');
const ElectronVue = require('../index.js');
const serverRenderer = require('vue-server-renderer');

describe('Template Rendering Tests', function() {
    const renderer = serverRenderer.createRenderer();

    it('Template as string', function() {
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

    it('File as template', function() {
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

    it('Simple component', function() {
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

    it('File template with child components', function() {
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

    it('Template with static content', function() {
        const v = new ElectronVue({
            template: '<div><div>static content</div></div>'
        });

        renderer.renderToString(v, (error, html) => {
            assert.equal(html, '<div data-server-rendered="true"><div>static content</div></div>');
        });
    });

    it('Component with static content', function() {
        const v = new ElectronVue({
            template: '<static-component></static-component>',
            components: {
                'static-component': {
                    template: '<div><div>static content</div></div>'
                }
            }
        });

        renderer.renderToString(v, (error, html) => {
            assert.equal(html, '<div data-server-rendered="true"><div>static content</div></div>');
        });
    });
});
