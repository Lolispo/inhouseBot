'use strict';
// Author: Petter Andersson

import { assert } from 'chai';
const rewire = require('rewire');

const player_js = require('../src/game/player.js');
const fileModule = rewire('../src/game/player.js');

// TODO
describe('player', function(){
    describe('CreatePlayer', function(){
        const userName = 'TestUser';
        const discId = '1';
        const p = player_js.createPlayer(userName, discId);
        it('should store username correctly', function(){
            assert.equal(userName, p.userName);
        });
    });
})