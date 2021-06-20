import { expect } from 'chai';
import { TeammateAction } from '../../src/commands/stats/teammates';
import { Statistics } from '../../src/database/db_sequelize';

describe('teammates', () => {
  it('playerString', () => {
    const { playerString } = TeammateAction.instance;
    const data: Statistics = {
      losses: 5,
      wins: 10,
      winRate: 2 / 3,
      gamesPlayed: 15,
      uid: 'test',
      userName: 'Petter'
    }
    const result = playerString(data);
    console.log('@generateGameTimeString:', result);
    expect(result).to.exist;
    expect(result).to.be.eq('GamesPlayed: 15  WinRate: 67%  (Wins: 10, Losses: 5 ) Petter')
  })
})