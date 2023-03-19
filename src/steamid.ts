import * as f from './tools/f';
import { getUser, storeSteamIdDb } from './database/db_sequelize';
import { getClientReference } from './client';
import * as SteamID from 'steamid';
import { Player } from './game/player';
import { Message } from 'discord.js';
import { EmbeddedMessage } from './game/balance';

export const enum SteamProfileMode {
  STEAM2 = 'STEAM2',
  STEAM3 = 'STEAM3',
  STEAM64 = 'STEAM64',
  STEAMURLProfile = 'STEAMURLProfile',
  STEAMURLId = 'STEAMURLId',
}

// Return boolean if valid steam id format or not
export const validateSteamID2 = (msgContent: string) => {
	return msgContent.startsWith('STEAM') && msgContent.match(/STEAM\_\d:\d:\d+/g);
}

export const validateSteamID3 = (msgContent: string) => {
  return msgContent.match(/\[U:\d:\d+\]/g);
}

export const validateSteamID64 = (msgContent: string) => {
  return msgContent.match(/\d+/g) && Number.parseInt(msgContent) > 1000000;
}

export const validateSteamIDURLProfile = (msgContent: string) => {
  return msgContent.match('^(?:https?:\/\/)?steamcommunity\.com\/(?:profiles\/[0-9]{17}.*)$');
}

export const validateSteamIDURLId = (msgContent: string) => {
  return msgContent.match('^(?:https?:\/\/)?steamcommunity\.com\/(?:id\/[a-zA-Z0-9].*)$');
}

/**
 * Returns true if valid with any of the supported formats
 */
export const validateSteamID = (msgContent: string) => {
  if (validateSteamID2(msgContent)) {
    return SteamProfileMode.STEAM2;
  }
  if (validateSteamID3(msgContent)) {
    return SteamProfileMode.STEAM3;
  }
  if (validateSteamID64(msgContent)) {
    return SteamProfileMode.STEAM64;
  }
  if (validateSteamIDURLProfile(msgContent)) {
    return SteamProfileMode.STEAMURLProfile;
  }
  if (validateSteamIDURLId(msgContent)) {
    return SteamProfileMode.STEAMURLId;
  }
  return false;
}

export const setSteamId = async (message: Message, validProfileMode: SteamProfileMode) => {
  const steamId2 = await translateToSteamId2(message.content, validProfileMode);
  console.log('@setSteamId', steamId2);
  if (steamId2) {
    storeSteamId(message.author.id, message, steamId2);
  } else {
    message.author.send(`Failed to translate your steam ID to the expected format: ${message.content}
${validProfileMode === SteamProfileMode.STEAMURLId ? `On this link you can fetch the steamID64 number close to the top, please paste that instead: ${`${message.content}?xml=1`}` : ''}`)
    .then(result => {
      f.deleteDiscMessage(result, 60000);
    });
  }
}


export const storeSteamId = async (uid: string, message: Message, msgContent: string) => {
  // TODO: Utilize SteamId npm lib to store all in same format
  const res = await storeSteamIdDb(uid, msgContent);
  console.log('Store SteamID result:', res); // undefined - res.dataValues);
  message.author.send("Successfully set your SteamID to: " + msgContent)
  .then(result => {
		f.deleteDiscMessage(result, 20000);
	});
}

export const translateToSteamId2 = (msgContent: string, validProfileMode: SteamProfileMode) => {
  if (validProfileMode === SteamProfileMode.STEAM2) {
    return msgContent;
  } else if (validProfileMode === SteamProfileMode.STEAM3) {
    // Translate Steam3 to Steam2
    const { convertedId } = convertIdFrom64(msgContent);
    return convertedId;
  } else if (validProfileMode === SteamProfileMode.STEAM64) {
    const { convertedId } = convertIdFrom64(msgContent); // TODO: Check if it should always be converted or alt
    return convertedId;
  } else if (validProfileMode === SteamProfileMode.STEAMURLProfile) {
    const splitString = 'profiles/';
    const endOfUrl = msgContent.substring(msgContent.indexOf(splitString) + splitString.length)[1];
    const steamId64 = endOfUrl.substring(endOfUrl.indexOf('/'))[0];
    const { convertedId } = convertIdFrom64(steamId64);
    return convertedId;
  } else if (validProfileMode === SteamProfileMode.STEAMURLId) {
    console.log('STEAM PROFILE MODE:', msgContent); // TODO Translate using the ?xml=1 base 64 value
    return false;
  }
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

const enterSteamIdString = `First time playing Inhouse?\nYou need to connect your Steam ID to the discord bot.
*Simply write your URL or SteamId to the bot in this chat*
Examples:
STEAM\_1:0:XXXXXXXX
<https://steamcommunity.com/profiles/XXXXXX/>
\nOptional: Example link to fetch the steamId: https://steamid.io/
The bot uses the steamId2 format: STEAM\_1:0:XXXXXXXX`;

const gifLink = 'res/fetchProfileUrl.gif';
const fetchProfileGif = [{
  attachment: gifLink,
  name: 'FetchSteamProfile.gif',
}];

const enterSteamMessage: EmbeddedMessage = {
  content: '',
  embed: {
    image: { url: `attachment://${fetchProfileGif[0].name}` },
    description: enterSteamIdString
  }, 
  files: fetchProfileGif
}

export const connectSteamEntry = (message) => {
	message.author.send(enterSteamMessage);
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
    message.author.send("You have no SteamID stored!\n")
    .then(result => {
      f.deleteDiscMessage(result, 20000);
    });
    f.deleteDiscMessage(message, 10000, 'connectsteam');
    message.author.send(enterSteamMessage);
  }
}

// Returns users with missing steamids
export const checkMissingSteamIds = (players) => {
  return players.filter((player) => !player.getSteamId());
}

export const notifyPlayersMissingSteamId = async (players: Player[]) => {
  const client = getClientReference();
  players.forEach((player) => {
    const uid = player.uid;
    if (player.userName !== 'Groovy') {
      try {
        client.users.cache.get(uid).send(enterSteamMessage);
      } catch (e) {
        console.error('Unable to send steamid fetch to user with uid' + uid + ':', e);
      }
    }
  });
}