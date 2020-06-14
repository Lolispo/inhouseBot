'use strict';
// Author: Petter Andersson

const assert = require('assert');
const rewire = require('rewire');
const { createPlayer } = require('../src/game/player');
const { getTeamName } = require('../src/teamNames');
const teamNameModule = rewire('../src/teamNames.js');
const capitalize = teamNameModule.__get__('capitalize');

describe('teamNames', () => {
  describe('capitalize', () => {
    it('capitalize', () => {
      const foo = 'epic gamer';
      const res = capitalize(foo);
      assert.equal(res, 'Epic Gamer');
    })
  }),
  describe('getTeamName', () => {
    it('getTeamName cs random 5', () => {
        const game = 'cs';
        const team = [
            createPlayer('Robert', '123'),
            createPlayer('Michael', '123'),
            createPlayer('Petter', '123'),
            createPlayer('Arvid', '123'),
            createPlayer('Pippin', '123'),
        ];
        team.forEach((player) => player.setMMR('cs', 2500 + (10 * Math.floor(Math.random() * 20) - 10 )));
        const s = team.map((player) => player.userName + ': ' + player.getMMR(game));
        console.log(s.join(', '));
        for(let i = 0; i < 20; i++) {
            const res = getTeamName(team, game);
            console.log('Team Name:', res);
            assert.notEqual(res, '');
            team.forEach((player) => player.setMMR('cs', 2500 + (10 * Math.floor(Math.random() * 20) - 10 )));
        }
    });
    it('getTeamName Uppsala', () => {
      const game = 'cs';
      const team = [
          createPlayer('Petter', '123'),
          createPlayer('Pleb', '123'),
          createPlayer('Robin', '123'),
          createPlayer('Bambi', '123'),
          createPlayer('Simon', '123'),
      ];
      team.forEach((player) => player.setMMR('cs', 2500 + (10 * Math.floor(Math.random() * 20) - 10 )));
      const s = team.map((player) => player.userName + ': ' + player.getMMR(game));
      console.log(s.join(', '));
      const res = getTeamName(team, game);
      console.log('Team Name:', res);
      assert.notEqual(res, '');
      assert.ok(res.includes('Uppsala'))
    });
    it('getTeamName cs random 5', () => {
      const game = 'cs';
      const team = [
          createPlayer('Robert', '123'),
          createPlayer('Michael', '123'),
          createPlayer('Pippin', '123'),
      ];
      team.forEach((player) => player.setMMR('cs', 2500 + (10 * Math.floor(Math.random() * 20) - 10 )));
      const s = team.map((player) => player.userName + ': ' + player.getMMR(game));
      console.log(s.join(', '));
      for(let i = 0; i < 20; i++) {
          const res = getTeamName(team, game);
          console.log('Team Name:', res);
          assert.notEqual(res, '');
          team.forEach((player) => player.setMMR('cs', 2500 + (10 * Math.floor(Math.random() * 20) - 10 )));
      }
  });
  });
});
