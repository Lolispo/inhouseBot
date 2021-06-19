import { expect } from 'chai';
import * as rewire from 'rewire';
import { generateGameTimeString } from '../../src/commands/game/temperatureCheck';

describe('temperatureCheck', () => {
  it('generateGameTimeString', () => {
    const result = generateGameTimeString(['dota', 'cs'], 19, 3);
    console.log('@generateGameTimeString:', result);
    expect(result).to.exist;
  })
})