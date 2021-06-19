'use strict';
// Author: Petter Andersson


import { assert } from 'chai';
const { initializeMySQL } = require('../src/database/mysql_pool');
import { getConfig } from '../src/tools/load-environment';
import { getBirthdays } from '../src/birthday.js';

initializeMySQL(getConfig().db);

/*
describe('birthday', () => {
  it('getBirthdays', async () => {
    const res = await getBirthdays(new Date('1995-09-28'));
    assert.equal(res[0].userName, 'Petter');
  })
  it('getBirthdays any year', async () => {
    const res = await getBirthdays(new Date('2018-09-28'));
    assert.equal(res[0].userName, 'Petter');
  })
})
*/