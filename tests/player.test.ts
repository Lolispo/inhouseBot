'use strict';
// Author: Petter Andersson

import { assert, expect } from 'chai';
import { sortRating } from '../src/game/player';
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
    describe('sortRating', () => {
        const players = [];
        for (let i = 0; i < 5; i++) {
            const player = player_js.createPlayer('Test' + i, i);
            player.setMMR(10 * i, 'test');
            players.push(player);
        }
        const sortedPlayers = sortRating('test', players);
        console.log('@sortedPlayers:', sortedPlayers);
        expect(sortedPlayers[0].userName).equal('Test4');
    })
})