import { GameModesStandard, GameModeRatings, GameModes1v1, getAllModes, getGameModes } from "../src/game/gameModes";

describe('GameModes', () => {
  describe('Enums', () => {
    it('should work as before', () => {
      const x = getGameModes();
      expect(x[0]).toEqual(GameModesStandard.CS);
    });
    it('should get default option cs', () => {
      const x = getAllModes();
      expect(x.includes(GameModeRatings.TRIVIA)).toBeTruthy;
      expect(x.includes(GameModes1v1.DOTA1v1)).toBeTruthy;
      expect(x[0]).toEqual(GameModesStandard.CS);
    });
  })
})