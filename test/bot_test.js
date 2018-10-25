'use strict';
// Author: Petter Andersson

var assert = require('assert');
var rewire = require("rewire");

var myModule = rewire("../src/balance.js");
// Test method 

var recursiveFor = myModule.__get__('recursiveFor')
var unival = myModule.__get__('uniVal');

describe('balance', function(){
    describe('unival', function(){
        // 0: 0, 1: 10, 2: 200, 3: 3000, 4: 40000, 5: 5, 6: 60, 7: 700, 8: 8000; 9: 90000
        it('should be unival', function(){
            assert.equal(0, unival(0));
            assert.equal(10, unival(1));
            assert.equal(200, unival(2));
            assert.equal(3000, unival(3));
            assert.equal(40000, unival(4));
            assert.equal(5, unival(5));
            assert.equal(60, unival(6));
            assert.equal(700, unival(7));
            assert.equal(8000, unival(8));
            assert.equal(90000, unival(9));
            assert.equal(10, unival(10));
            assert.equal(110, unival(11));
            assert.equal(1200, unival(12));
            assert.equal(14000, unival(13));
            assert.equal(150000, unival(14));
        });
    });
    /*
    describe('recursiveFor', function(){
        it('should give  on size 4', function(){
            var array = [];
            var set = new Set();
            recursiveFor(0, [], 10, 0, array, set);
            //assert.equal(array, array.length === 4);
            console.log(array);
            //console.log(set);
        });
    });
    */
});
describe('Test', function(){
    it('is 3*3 = 9?', function(){
        assert.equal(9, 3*3);
    });
});