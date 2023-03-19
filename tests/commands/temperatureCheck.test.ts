import { afterAll, describe, expect, it } from '@jest/globals';
import { getClientReference } from '../../src/client';
import { GameModesStandard } from '../../src/game/gameModes';
import { TemperatureCheckAction } from '../../src/commands/game/temperatureCheck';

describe('temperatureCheck', () => {
  it('generateGameTimeString', () => {
    const { generateGameTimeString } = TemperatureCheckAction.instance;
    const result = generateGameTimeString([{
      game: GameModesStandard.CS,
      time: 19,
      message: 'id1',
      emoji: { icon: 'icon', title: 'title' }
    }]);
    console.log('@generateGameTimeString:', result);
    expect(result).toEqual(expect.anything());
  });
  afterAll(() => {
    getClientReference().destroy();
  });
})