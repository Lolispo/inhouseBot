const { createPlayer } = require("../src/game/player");
import { assert } from 'chai';
const { checkMissingSteamIds } = require('../src/steamid'); 

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
    assert.equal(res.length, 3);
  });
});

