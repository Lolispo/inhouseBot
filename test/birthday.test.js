'use strict';
// Author: Petter Andersson

const assert = require('assert');
const rewire = require('rewire');
const teamNameModule = rewire('../src/birthday.js');
const capitalize = teamNameModule.__get__('dailyCheck');

describe('birthday', () => {
  describe('dailyCheck', () => {
    it('dailyCheck', () => {
      
    })
  }),
});