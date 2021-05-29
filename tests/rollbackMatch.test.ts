'use strict';
// Author: Petter Andersson

import { assert } from 'chai';
const { getConfig } = require('../src/tools/load-environment');
const { getAllUsers, initializeDBSequelize, getPersonalStats } = require("../src/database/db_sequelize");
const player_js = require('../src/game/player');
const rewire = require('rewire');
const db_sequelize = rewire('../src/database/db_sequelize');
const DatabaseSequelize = db_sequelize.__get__('DatabaseSequelize');
const rollbackMatch = db_sequelize.__get__('rollbackMatch');

const foo = (uid, userName, mmr, game, gamesPlayed = 0) => {
  const s = `INSERT INTO ratings (uid, gameName, userName, mmr, gamesPlayed, wins) VALUES ("${uid}","${game}","${userName}",${mmr},${gamesPlayed},0);`;
  // console.log(s);
  return s;
}

const rollbackMatchId = -1;

describe('migration', () => {
  let databaseConnection;
  before(async () => {
    databaseConnection = await initializeDBSequelize(getConfig().db);
    DatabaseSequelize.instance = databaseConnection;
    assert.ok(databaseConnection.Users);
    assert.ok(databaseConnection.Ratings);
  }),
  describe('rollbackMatch', () => {
    it('rollbackMatch', async () => {
      const databaseConnection = DatabaseSequelize.instance;
      assert.ok(databaseConnection);
      if (rollbackMatchId) {
        const rollbackRes = await rollbackMatch(rollbackMatchId);
        console.log(rollbackRes);
      }
    }).timeout(30000);
  })
});