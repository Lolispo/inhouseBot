'use strict';
// Author: Petter Andersson

import { afterAll, describe, expect, it } from '@jest/globals';
import { getClientReference } from '../src/client';
import { recursiveFor, uniVal, reverseUniqueSum, roundValue } from '../src/game/balance';

describe('balance', function(){
  describe('unival', function(){
    // 0: 0, 1: 10, 2: 200, 3: 3000, 4: 40000, 5: 5, 6: 60, 7: 700, 8: 8000; 9: 90000
    it('should be unival', function(){
      expect(0).toEqual(uniVal(0));
      expect(10).toEqual(uniVal(1));
      expect(200).toEqual(uniVal(2));
      expect(3000).toEqual(uniVal(3));
      expect(40000).toEqual(uniVal(4));
      expect(5).toEqual(uniVal(5));
      expect(60).toEqual(uniVal(6));
      expect(700).toEqual(uniVal(7));
      expect(8000).toEqual(uniVal(8));
      expect(90000).toEqual(uniVal(9));
      expect(10).toEqual(uniVal(10));
      expect(110).toEqual(uniVal(11));
      expect(1200).toEqual(uniVal(12));
      expect(13000).toEqual(uniVal(13));
      expect(140000).toEqual(uniVal(14));
    });
  });
  
  describe('reverseUniqueSum', function(){
    it('should give correct result for reverse', function(){
      let array = [0, 1]; // unival(2) + unival(3)
      expect(3200).toEqual(reverseUniqueSum(array, array.length * 2));
      array = [2, 3];
      expect(10).toEqual(reverseUniqueSum(array, array.length * 2));
      array = [0,1,2,3,4];
      expect(98765).toEqual(reverseUniqueSum(array, array.length * 2));
    });
  });
  
  describe('recursiveFor', function(){
    // Should give half of size/halfsize, 0.5 * choosing 2 from 4 => 3
    // Set size are all unique combinations, contains the double ones from reverseUniqueSum => double amount
    it('should give 3 teamCombs on size 4', function(){
      const array = [];
      const set = new Set();
      recursiveFor(0, [], 4, 0, array, set);
      expect(3).toEqual(array.length);
      expect(6).toEqual(set.size);
    });
    it('should give 126 teamCombs on size 10', function(){
      const array = [];
      const set = new Set();
      recursiveFor(0, [], 10, 0, array, set);
      expect(126).toEqual(array.length);
      expect(252).toEqual(set.size);
    });
    it('should give 35 teamCombs on size 8', function(){
      const array = [];
      const set = new Set();
      recursiveFor(0, [], 8, 0, array, set);
      expect(35).toEqual(array.length);
      expect(70).toEqual(set.size);
    });
  });
  describe('roundValue', () => {
    it('roundValue', () => {
      const num = 5.2342;
      const res = roundValue(num);
      expect(res).toEqual('5.23');
    });
    it('roundValue', () => {
      const num = 5;
      const res = roundValue(num);
      expect(res).toEqual('5');
    });
    it('roundValue', () => {
      const num = 5.29;
      const res = roundValue(num);
      expect(res).toEqual('5.29');
    });
  })
  describe('normalizevalue', () => {
    it('normalize test', () => {
      // TODO
      /*
      const x = testNormalize(2600);
      console.log('@x', x);
      expect(x).toEqual('5.23');
      */
    });
  })
  afterAll(() => {
    getClientReference().destroy();
  });
});
