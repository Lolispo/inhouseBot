// MMR struct - holding information about mmr for a game, used in map to map game with struct
export class MMRStruct {
  mmr: number;
  prevMMR: number; // MMR at previous instance
  latestUpdate?: number; // How much mmr was changed
  latestUpdatePrefix: string; // A '+' or ''?

  constructor(mmr, prevMMR, latestUpdate?, latestUpdatePrefix?) {
    this.mmr = mmr;
    this.prevMMR = prevMMR;
    this.latestUpdate = latestUpdate;
    this.latestUpdatePrefix = latestUpdatePrefix;
  }

  static generateMmrStruct = (startMmr): MMRStruct => {
    return new MMRStruct(startMmr, startMmr, 0, ''); 
  }
}