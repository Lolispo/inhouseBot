'use strict';
// Author: Petter Andersson

import { assert } from 'chai';
const rewire = require('rewire');

const fileModule = rewire('../src/bot.js');
import { handleMessageExported } from '../src/bot';
const { getTextChannel } = require('../src/client');

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
                ...getTextChannel(),
                author: { 
                    uid: '96293765001519104'
                },
                content: 'hej'
            }
            handleMessageExported(messageObject);
        });
    });
})