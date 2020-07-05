const f = require('./tools/f');	
const { getUser, storeSteamIdDb } = require('./database/db_sequelize');
const { getClientReference } = require('./client');
const SteamID = require('steamid');

// Return boolean if valid steam id format or not
const validateSteamID = (msgContent) => {
	return (
		(msgContent.startsWith('STEAM') && msgContent.match(/STEAM\_\d:\d:\d+/g))
		|| 
		(msgContent.match(/\[U:\d:\d+\]/g))
	);
}

const storeSteamId = async (uid, message) => {
  const msgContent = message.content;
  console.log('DEBUG Storing SteamID ' + msgContent + ' for user with ID', uid);
  // TODO: Utilize SteamId npm lib to store all in same format
  const res = await storeSteamIdDb(uid, msgContent);
  console.log('Store SteamID result:', res); // undefined - res.dataValues);
  message.author.send("Successfully set your SteamID to: " + msgContent)
  .then(result => {
		f.deleteDiscMessage(result, 20000);
	});
}

const convertIdFrom64 = (key) => {
  const sid = new SteamID(key);
  const convertedId = sid.getSteam2RenderedID(true);
  const altConvertedId = sid.getSteam2RenderedID();
  return { convertedId, altConvertedId };
}

const enterSteamIdString = "Enter your SteamID (format: STEAM\_1:0:XXXXXXXX)\nLink: https://steamid.io/"; // https://steamidfinder.com/

const connectSteamEntry = (message) => {
	message.author.send(enterSteamIdString);
	f.deleteDiscMessage(message, 10000, 'connectsteam');
}

const sendSteamId = async (message) => {
  const users = await getUser([message.author.id]);
  const steamid = users[0].dataValues.steamid;
  if (steamid) {
    message.author.send("Your SteamID: " + steamid)
    .then(result => {
      f.deleteDiscMessage(result, 20000);
    });
    f.deleteDiscMessage(message, 10000, 'connectsteam');
  } else {
    message.author.send("You have no SteamID stored!\n" + enterSteamIdString)
    .then(result => {
      f.deleteDiscMessage(result, 20000);
    });
    f.deleteDiscMessage(message, 10000, 'connectsteam');
  }
}

// Returns users with missing steamids
const checkMissingSteamIds = (players) => {
  return players.filter((player) => !player.getSteamId());
}

const notifyPlayersMissingSteamId = async (players) => {
  const client = getClientReference();
  players.forEach((player) => {
    const uid = player.uid;
    try {
      client.users.get(uid).send(enterSteamIdString);
    } catch (e) {
      console.error('Unable to send steamid fetch to user with uid' + uid + ':', e);
    }
  });
}

module.exports = {
  validateSteamID : validateSteamID,
  storeSteamId : storeSteamId,
  connectSteamEntry : connectSteamEntry,
  sendSteamId : sendSteamId,
  checkMissingSteamIds : checkMissingSteamIds,
  notifyPlayersMissingSteamId : notifyPlayersMissingSteamId,
  convertIdFrom64 : convertIdFrom64,
}