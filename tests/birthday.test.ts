'use strict';
// Author: Petter Andersson

import { beforeAll, describe, it, expect } from '@jest/globals';
const { initializeMySQL } = require('../src/database/mysql_pool');
import { getConfig } from '../src/tools/load-environment';
//import { getBirthdays } from '../src/birthday.js';

describe.skip('birthday', () => {
  beforeAll(() => {
    initializeMySQL(getConfig().db);
  })
  it('getBirthdays', async () => {
    const res = null; //await getBirthdays(new Date('1995-09-28')); Removed as test is disabled and birthday.js import doesn't work 
    expect(res[0].userName).toEqual('Petter');
  })
  it('getBirthdays any year', async () => {
    const res = null; //await getBirthdays(new Date('2018-09-28')); Removed as test is disabled and birthday.js import doesn't work 
    expect(res[0].userName).toEqual('Petter');
  })
})
