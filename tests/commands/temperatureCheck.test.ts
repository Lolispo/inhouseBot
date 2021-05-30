import { expect } from 'chai';
import * as rewire from 'rewire';

const x = rewire('../../src/commands/game/temperatureCheck.ts');
const generateGameTimeString = x.__GET__('generateGameTimeString');

describe('temperatureCheck', () => {
  it('generateGameTimeString', () => {
    const result = generateGameTimeString();
    console.log('@generateGameTimeString:', result);
    expect(result).to.exist;
  })
})