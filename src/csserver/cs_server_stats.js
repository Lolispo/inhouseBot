const { writeConsole, fetchFile } = require("./cs_console")

const vdf = require('simple-vdf');

const fetchStatsFile = async (serverId, matchId = '1') => {

  // let filePath = 'cfg%2Fget5%2Fget5_matchstats_$$XXX$$.cfg';
  let filePath = 'cfg/get5/get5_matchstats_$$XXX$$.cfg';
  filePath = filePath.replace('$$XXX$$', matchId);
  return fetchFile(serverId, filePath);
}

const cleanStatsFile = () => {
  // TODO: Remove locally stored file
}

const getGameStats = async (serverId, gameObject) => {
  // writeConsole(serverId, 'get5_dumpstats');

  // Get match id
  let matchId = '1'; // TODO: Fix
  const statsFile = await fetchStatsFile(serverId, matchId);
  console.log('@getGameStats Raw:', statsFile);
  const data = vdf.parse(statsFile.data);
  console.log(data);
  console.log(data.Stats.map0);

  cleanStatsFile();
}

class PlayerStats {
  // TODO: Should we initialize this data?

  constructor(playerStatsObject) {

  }
}

module.exports = {
  getGameStats : getGameStats,
}