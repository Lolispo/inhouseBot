import { createPlayer } from '../src/game/player';
import { afterAll, describe, expect, it } from '@jest/globals';
import { getClientReference } from '../src/client';
import { checkMissingSteamIds } from '../src/steamid'; 

 describe('checkMissingSteamIds', () => {
  it('checkMissingSteamIds', async () => {
    const players = [
      createPlayer('Test1', '1'),
      createPlayer('Test2', '2'),
      createPlayer('Test3', '3'),
      createPlayer('Test4', '4'),
    ];
    players[0].setSteamId('123');

    const res = await checkMissingSteamIds(players);
    expect(res.length).toEqual(3);
  });
  afterAll(() => {
    getClientReference().destroy();
  });
});

