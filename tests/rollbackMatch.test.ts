'use strict';
// Author: Petter Andersson

import { beforeAll, describe, it, expect } from '@jest/globals';
import { getClientReference } from '../src/client';
const { getConfig } = require('../src/tools/load-environment');
const { initializeDBSequelize } = require("../src/database/db_sequelize");
import { DatabaseSequelize, rollbackMatch } from '../src/database/db_sequelize';

export const helperFunctionInsertSQLCommand = (uid, userName, mmr, game, gamesPlayed = 0) => {
  const s = `INSERT INTO ratings (uid, gameName, userName, mmr, gamesPlayed, wins) VALUES ("${uid}","${game}","${userName}",${mmr},${gamesPlayed},0);`;
  // console.log(s);
  return s;
}

const rollbackMatchId = -1;

describe.skip('migration', () => {
  let databaseConnection;
  beforeAll(async () => {
    databaseConnection = await initializeDBSequelize(getConfig().db);
    DatabaseSequelize.instance = databaseConnection;
    expect(databaseConnection.Users).toBeTruthy();
    expect(databaseConnection.Ratings).toBeTruthy();
  }),
  describe('rollbackMatch', () => {
    it('rollbackMatch', async () => {
      const databaseConnection = DatabaseSequelize.instance;
      expect(databaseConnection).toBeTruthy();
      if (rollbackMatchId) {
        const rollbackRes = await rollbackMatch(rollbackMatchId);
        console.log(rollbackRes);
      }
    })//.timeout(30000);
  })
});

getClientReference().destroy();