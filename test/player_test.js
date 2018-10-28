'use strict';
// Author: Petter Andersson

var assert = require('assert');
var rewire = require('rewire');

var player_js = require('../src/player.js');
var fileModule = rewire('../src/player.js');

// TODO
describe('player', function(){
    describe('CreatePlayer', function(){
        var userName = 'TestUser';
        var discId = '1';
        var p = player_js.createPlayer(userName, discId);
        it('should store username correctly', function(){
            assert.equal(userName, p.userName);
        });
    });
})