'use strict';
// Author: Petter Andersson

import { assert, expect } from 'chai';
import { describe, it } from 'mocha';
import { sortRating } from '../src/game/player';
const rewire = require('rewire');

import { createPlayer } from '../src/game/player.js';
const fileModule = rewire('../src/game/player.js');

// TODO
describe('player', function(){
    describe('CreatePlayer', function(){
        const userName = 'TestUser';
        const discId = '1';
        const p = createPlayer(userName, discId);
        it('should store username correctly', function(){
            assert.equal(userName, p.userName);
        });
    });
    describe('sortRating', () => {
        const players = [];
        for (let i = 0; i < 5; i++) {
            const player = createPlayer('Test' + i, i);
            player.setMMR(10 * i, 'test');
            players.push(player);
        }
        const sortedPlayers = sortRating('test', players);
        console.log('@sortedPlayers:', sortedPlayers);
        expect(sortedPlayers[0].userName).equal('Test4');
    })
})