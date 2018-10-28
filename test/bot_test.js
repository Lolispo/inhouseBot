'use strict';
// Author: Petter Andersson

var assert = require('assert');
var rewire = require('rewire');

var fileModule = rewire('../src/bot.js');

// TODO
describe('bot', function(){
    describe('Test', function(){
        it('is 3*3 = 9?', function(){
            assert.equal(9, 3*3);
        });
    });
})