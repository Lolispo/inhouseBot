import { expect } from 'chai';
import { TemperatureCheckAction } from '../../src/commands/game/temperatureCheck';

describe('temperatureCheck', () => {
  it('generateGameTimeString', () => {
    const { generateGameTimeString } = TemperatureCheckAction.instance;
    const result = generateGameTimeString(['dota', 'cs'], 19, 3);
    console.log('@generateGameTimeString:', result);
    expect(result).to.exist;
  })
})