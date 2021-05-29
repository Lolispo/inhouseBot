'use strict';
// Author: Petter Andersson

import { assert } from 'chai';
const { getConfig } = require('../src/tools/load-environment');
const { getAllUsers, initializeDBSequelize, getPersonalStats } = require("../src/database/db_sequelize");
const player_js = require('../src/game/player');
const rewire = require('rewire');
const db_sequelize = rewire('../src/database/db_sequelize');
const DatabaseSequelize = db_sequelize.__get__('DatabaseSequelize');
const createRatingForUser = db_sequelize.__get__('createRatingForUser');

const foo = (uid, userName, mmr, game, gamesPlayed = 0) => {
  const s = `INSERT INTO ratings (uid, gameName, userName, mmr, gamesPlayed, wins) VALUES ("${uid}","${game}","${userName}",${mmr},${gamesPlayed},0);`;
  // console.log(s);
  return s;
}

describe('migration', () => {
  let databaseConnection;
  before(async () => {
    databaseConnection = await initializeDBSequelize(getConfig().db);
    DatabaseSequelize.instance = databaseConnection;
    assert.ok(databaseConnection.Users);
    assert.ok(databaseConnection.Ratings);
  }),
  describe('migration', () => {
    it('migration', async () => {
      const databaseConnection = DatabaseSequelize.instance;
      assert.ok(databaseConnection);
      console.log('MIGRATION')
      const allUsers = await getAllUsers();
      // const listOfStrings = await Promise.all(allUsers.map(async (user) => {
      for (let i = 0; i < allUsers.length; i++) {
        const user = allUsers[i];
        const { uid, userName, cs, cs1v1, dota, dota1v1, trivia, gamesPlayed } = user;
        // console.log(' ---- ', userName, uid, cs, cs1v1, dota, dota1v1, trivia, gamesPlayed );
        
        const stringRes = [];

        if (cs !== 2500 && gamesPlayed > 0) {
          stringRes.push(await foo(uid, userName, cs, 'cs', gamesPlayed));
        }
        if (cs1v1 !== 2500) {
          stringRes.push(await foo(uid, userName, cs1v1, 'cs1v1'));
        }
        if (dota !== 2500) {
          stringRes.push(await foo(uid, userName, dota, 'dota'));
        }
        if (dota1v1 !== 2500) {
          stringRes.push(await foo(uid, userName, dota1v1, 'dota1v1'));
        }
        if (trivia !== 0) {
          stringRes.push(await foo(uid, userName, trivia, 'trivia'));
        }
        /*
        const data = await getPersonalStats(uid);
        let s = '';
        if(data.length === 0) {
          console.log('NO DATA FOR ' + userName);
        }
        data.forEach((oneData) => {
          s += `${oneData.userName}(**${oneData.gameName}**): \t**${oneData.mmr} ${player_js.ratingOrMMR(oneData.gameName)}**\t(Games Played: ${oneData.gamesPlayed})\n`;
        });
        return s;
        */
        stringRes.length > 0 ? console.log(stringRes.join("\n")) : '';
      // }));
      }
      //assert.equal(listOfStrings.length, allUsers.length);
      //listOfStrings.forEach((string) => console.log(string));
    }).timeout(30000);
  })
});