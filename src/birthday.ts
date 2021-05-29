
// Author: Petter Andersson

import { getEnvironment, getConfig } from './tools/load-environment';
import {
  getClient,
} from './client';
import { getPool, initializeMySQL } from './database/mysql_pool';
import { Channel, Client } from 'discord.js';
import { getTextGeneralChannel, getTextTestChannel, IKosaTuppChannels } from './channels/channels';

let awaitedClient: Client;

const birthdayStart = async () => {
  awaitedClient = await client;
  let date = new Date();
  dailyCheck(date);
  setInterval(() => {
    date = new Date();
    dailyCheck(date);
  }, 24 * 1000 * 3600);
};

// TODO: Compare to Month & Day instead of CURDATE
const getBirthdays = async (date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  // console.log('@getBirthdays month', month, 'day', day);
  const sql = 'SELECT * FROM birthdays WHERE MONTH(birthday) = ? AND DAY(birthday) = ?;'; // DATE(birthday) = CURDATE();';
  const pool = await getPool();
  try {
    const result = await pool.query(sql, [month, day]);
    if (result.length > 0) console.log('@getBirthdays Records:', result);
    return result;
  } catch (error) {
    console.error('@getBirthdays Error:', error);
    return error;
  }
};

const generalId = getTextGeneralChannel(); // General
const testId = getTextTestChannel(); // robot-playground

const findTextChannel = async () => {
  const channelId = getEnvironment() === 'DEVELOPMENT' ? testId : generalId;
  if (!awaitedClient.channels) {
    console.log('Client not initialized!', client);
    return null;
  }
  const channel = await awaitedClient.channels.fetch(channelId); // generalId
  // console.log('@findTextChannel', channel && channel.name);
  if (channel) {
    return channel;
  }

	// Find requested channel as fallback if function didn't work
	return awaitedClient.channels.cache.find(channel => {
		return channel.id === IKosaTuppChannels.KanalGeneral;
	})
};

const dailyCheck = async (date) => {
  console.log('@dailyCheck:', (date.getMonth() + 1), date.getDate());
  const result = await getBirthdays(date) || [];
  if (result.length > 0) {
    const channel = await findTextChannel();
    if (!channel) return null;
    console.log('@main TextChannel:', channel.id);
    for (let i = 0; i < result.length; i++) {
      const entry = result[i];
      console.log('Entry', i, ':', entry.userName);
      const { uid, userName, birthday } = entry;
      // console.log('List:', channel.guild.members);
			console.log('NEED TO FINISH DISCORD12 OF BIRTHDAY');
			// TODO: Work with text channel to find Guild
			/*
      const { members } = channel.guild;
      const user = members.get(uid);
      // console.log('Hej', uid, channel.guild.members.constructor.name, channel.id, members.get(uid)); //.members[uid]);
      const message = `:birthday: Happy Birthday to ${user.toString()}! :birthday: `; // <@' + uid + '>!';
      channel.send(message);
			*/
    }
  }
};

const client = getClient('birthday', async () => initializeMySQL(getConfig().db), birthdayStart);
