const assert = require('assert');
const {describe, it} = require('mocha');
const ElectronVue = require('../index.js');

describe('ElectronVue Test Suite', function() {
    describe('toSpinalCase Conversion Tests', function() {
        it('a becomes a', function() {
            assert.equal(ElectronVue.toSpinalCase('a'), 'a');
        });

        it('Aa becomes aa', function() {
            assert.equal(ElectronVue.toSpinalCase('Aa'), 'aa');
        });

        it('aA becomes a-a', function() {
            assert.equal(ElectronVue.toSpinalCase('aA'), 'a-a');
        });

        it('aAA becomes a-aa', function() {
            assert.equal(ElectronVue.toSpinalCase('aAA'), 'a-aa');
        });

        it('aAaaa becomes a-aaaa', function() {
            assert.equal(ElectronVue.toSpinalCase('aAaaa'), 'a-aaaa');
        });

        it('aaAaaa becomes aa-aaaa', function() {
            assert.equal(ElectronVue.toSpinalCase('aaAaaa'), 'aa-aaaa');
        });

        it('aaAAAAaaa becomes aa-aaa-aaaa', function() {
            assert.equal(ElectronVue.toSpinalCase('aaAAAAaaa'), 'aa-aaa-aaaa');
        });

        it('onEvent becomes on-event', function() {
            assert.equal(ElectronVue.toSpinalCase('onEvent'), 'on-event');
        });

        it('onHTMLEvent becomes on-html-event', function() {
            assert.equal(ElectronVue.toSpinalCase('onHTMLEvent'), 'on-html-event');
        });

        it('HTMLEvent becomes html-event', function() {
            assert.equal(ElectronVue.toSpinalCase('HTMLEvent'), 'html-event');
        });

        it('EventHTML becomes event-html', function() {
            assert.equal(ElectronVue.toSpinalCase('EventHTML'), 'event-html');
        });
    });
});
