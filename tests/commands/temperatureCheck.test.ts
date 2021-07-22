import { afterAll, describe, expect, it } from '@jest/globals';
import { getClientReference } from '../../src/client';
import { TemperatureCheckAction } from '../../src/commands/game/temperatureCheck';

describe('temperatureCheck', () => {
  it('generateGameTimeString', () => {
    const { generateGameTimeString } = TemperatureCheckAction.instance;
    const result = generateGameTimeString(['dota', 'cs'], 19, 3);
    console.log('@generateGameTimeString:', result);
    expect(result).toEqual(expect.anything());
  });
  afterAll(() => {
    getClientReference().destroy();
  });
})