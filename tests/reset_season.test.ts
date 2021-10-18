'use strict';
// Author: Petter Andersson

import { getTruncatedRating } from '../src/database/reset_season';
import {  describe, expect } from '@jest/globals';

describe('truncatedRating', () => {
  it('2475', () => {
    const mmr = 2475;
    const res = getTruncatedRating(mmr);
    expect(res).toEqual(2500); // This pushes it towards middle
  });
  it('2325', () => {
    const mmr = 2325;
    const res = getTruncatedRating(mmr);
    expect(res).toEqual(2425);
  });
  it('2650', () => {
    const mmr = 2650;
    const res = getTruncatedRating(mmr);
    expect(res).toEqual(2575);
  });
  it('3002', () => {
    const mmr = 3002;
    const res = getTruncatedRating(mmr);
    expect(res).toEqual(2750);
  });
  it('2876', () => {
    const mmr = 2876;
    const res = getTruncatedRating(mmr);
    expect(res).toEqual(2675);
  });
  it('2450', () => {
    const mmr = 2450;
    const res = getTruncatedRating(mmr);
    expect(res).toEqual(2475);
  });
  it('2451', () => {
    const mmr = 2451;
    const res = getTruncatedRating(mmr);
    expect(res).toEqual(2500);
  });
  it('2549', () => { // Rounds up if in between
    const mmr = 2549;
    const res = getTruncatedRating(mmr);
    expect(res).toEqual(2525);
  });
  it('2525', () => {
    const mmr = 2525;
    const res = getTruncatedRating(mmr);
    expect(res).toEqual(2500);
  });
  it('2550', () => {
    const mmr = 2550;
    const res = getTruncatedRating(mmr);
    expect(res).toEqual(2525);
  });
  it('2551', () => {
    const mmr = 2551;
    const res = getTruncatedRating(mmr);
    expect(res).toEqual(2525);
  });
})