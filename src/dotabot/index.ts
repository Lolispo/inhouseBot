
const Steam = require('steam');

const steamClient = new Steam.SteamClient();
const dota2 = require('dota2');

const Dota2 = new dota2.Dota2Client(steamClient, true, false);
