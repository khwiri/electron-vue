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
            assert.equal(html, '<div server-rendered="true">template as string</div>');
        });
    });

    it('Html Template File Test', function() {
        const v = new ElectronVue({
            template: `${__dirname}/data/template.html`,
            data: {
                message: 'template file'
            }
        });

        renderer.renderToString(v, (error, html) => {
            assert.equal(html, '<div server-rendered="true">template file</div>');
        });
    });
});
