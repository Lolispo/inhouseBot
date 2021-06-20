import { assert } from 'chai';
import { handleMessageExported } from '../src/bot';
import { getTextChannel } from '../src/client';
import { padString, prettifyPercentage } from '../src/tools/f';

describe('f', function(){
  describe('prettifyPercentage', () => {
    it('50.50', function(){
      const x = prettifyPercentage(0.5050);
      assert.equal(x, '51');
    });
    it('50.50', function(){
      const x = prettifyPercentage(0.66666666);
      assert.equal(x, '67');
    });
    it('75', function(){
      const x = prettifyPercentage(0.75);
      assert.equal(x, '75');
    });
  })
  describe('padString', () => {
    it('100', function(){
      const x = padString('100%');
      assert.equal(x, '100%');
    });
    it('50', function(){
      const x = padString('50%');
      assert.equal(x, '50% ');
    });
    it('5', function(){
      const x = padString('5%');
      assert.equal(x, '5%  ');
    });
    it('0', function(){
      const x = padString('0%');
      assert.equal(x, '0%  ');
    });
    it('15', function(){
      const x = padString(15, 3)
      assert.equal(x, '15 ');
    });
    it('100', function(){
      const x = padString(100, 3)
      assert.equal(x, '100');
    });
    it('1', function(){
      const x = padString(1, 3)
      assert.equal(x, '1  ');
    });
  });
})


