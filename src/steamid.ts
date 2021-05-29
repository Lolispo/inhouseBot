import * as f from './tools/f';
import { getUser, storeSteamIdDb } from './database/db_sequelize';
import { getClientReference } from './client';
import * as SteamID from 'steamid';

// Return boolean if valid steam id format or not
export const validateSteamID = (msgContent) => {
	return (
		(msgContent.startsWith('STEAM') && msgContent.match(/STEAM\_\d:\d:\d+/g))
		|| 
		(msgContent.match(/\[U:\d:\d+\]/g))
	);
}

export const storeSteamId = async (uid, message) => {
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

export const convertIdFrom64 = (key) => {
  const sid = new SteamID(key);
  const convertedId = sid.getSteam2RenderedID(true);
  const altConvertedId = sid.getSteam2RenderedID();
  return { convertedId, altConvertedId };
}

export const findPlayerWithGivenSteamId = (players, steamid) => {
  const sid = new SteamID(steamid);
  return players.find((player) => {
    const playerSteamID = player?.getSteamId();
    return playerSteamID === sid.getSteam2RenderedID(true) 
        || playerSteamID === sid.getSteam2RenderedID();
  });
}

const enterSteamIdString = "Enter your SteamID (format: STEAM\_1:0:XXXXXXXX)\nLink: https://steamid.io/"; // https://steamidfinder.com/

export const connectSteamEntry = (message) => {
	message.author.send(enterSteamIdString);
	f.deleteDiscMessage(message, 10000, 'connectsteam');
}

export const sendSteamId = async (message) => {
  const users = await getUser([message.author.id]);
  const steamid = users[0]?.dataValues?.steamid;
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
export const checkMissingSteamIds = (players) => {
  return players.filter((player) => !player.getSteamId());
}

export const notifyPlayersMissingSteamId = async (players) => {
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