'use strict';
// Author: Petter Andersson

import { assert } from 'chai';
import { recursiveFor, uniVal, reverseUniqueSum, roundValue, testNormalize } from '../src/game/balance';

describe('balance', function(){
  describe('unival', function(){
    // 0: 0, 1: 10, 2: 200, 3: 3000, 4: 40000, 5: 5, 6: 60, 7: 700, 8: 8000; 9: 90000
    it('should be unival', function(){
      assert.equal(0, uniVal(0));
      assert.equal(10, uniVal(1));
      assert.equal(200, uniVal(2));
      assert.equal(3000, uniVal(3));
      assert.equal(40000, uniVal(4));
      assert.equal(5, uniVal(5));
      assert.equal(60, uniVal(6));
      assert.equal(700, uniVal(7));
      assert.equal(8000, uniVal(8));
      assert.equal(90000, uniVal(9));
      assert.equal(10, uniVal(10));
      assert.equal(110, uniVal(11));
      assert.equal(1200, uniVal(12));
      assert.equal(13000, uniVal(13));
      assert.equal(140000, uniVal(14));
    });
  });
  
  describe('reverseUniqueSum', function(){
    it('should give correct result for reverse', function(){
      let array = [0, 1]; // unival(2) + unival(3)
      assert.equal(3200, reverseUniqueSum(array, array.length * 2));
      array = [2, 3];
      assert.equal(10, reverseUniqueSum(array, array.length * 2));
      array = [0,1,2,3,4];
      assert.equal(98765, reverseUniqueSum(array, array.length * 2));
    });
  });
  
  describe('recursiveFor', function(){
    // Should give half of size/halfsize, 0.5 * choosing 2 from 4 => 3
    // Set size are all unique combinations, contains the double ones from reverseUniqueSum => double amount
    it('should give 3 teamCombs on size 4', function(){
      const array = [];
      const set = new Set();
      recursiveFor(0, [], 4, 0, array, set);
      assert.equal(3, array.length);
      assert.equal(6, set.size);
    });
    it('should give 126 teamCombs on size 10', function(){
      const array = [];
      const set = new Set();
      recursiveFor(0, [], 10, 0, array, set);
      assert.equal(126, array.length);
      assert.equal(252, set.size);
    });
    it('should give 35 teamCombs on size 8', function(){
      const array = [];
      const set = new Set();
      recursiveFor(0, [], 8, 0, array, set);
      assert.equal(35, array.length);
      assert.equal(70, set.size);
    });
  });
  describe('roundValue', () => {
    it('roundValue', () => {
      const num = 5.2342;
      const res = roundValue(num);
      assert.equal(res, '5.23');
    });
    it('roundValue', () => {
      const num = 5;
      const res = roundValue(num);
      assert.equal(res, '5');
    });
    it('roundValue', () => {
      const num = 5.29;
      const res = roundValue(num);
      assert.equal(res, '5.29');
    });
  })
  describe('normalizevalue', () => {
    it('normalize test', () => {
      // TODO
      /*
      const x = testNormalize(2600);
      console.log('@x', x);
      assert.equal(x, '5.23');
      */
    });
  })
});
