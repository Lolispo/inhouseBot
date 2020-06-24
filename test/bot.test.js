'use strict';
// Author: Petter Andersson

var assert = require('assert');
var rewire = require('rewire');

var fileModule = rewire('../src/bot.js');
const bot = require('../src/bot');

// TODO
describe('bot', function(){
    describe('Test', function(){
        it('is 3*3 = 9?', function(){
            assert.equal(9, 3*3);
        });
    });
    describe('handleMessageExported', () => {
        it('handleMessageExported', () => {
            const messageObject = {
                channel: {
                    id: '424309421519142913',
                    name: 'robot-playground',
                    guild: {
                        name: 'Kosa Tupp'
                    }
                },
                author: { 
                    uid: '96293765001519104'
                },
                content: 'hej'
            }
            bot.handleMessageExported(messageObject);
        });
    });
})