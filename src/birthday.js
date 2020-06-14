'use strict';
// Author: Petter Andersson

const { getEnvironment, getConfig } = require('./tools/load-environment');

const { getClient, noop } = require('./client');
const { getPool, initializeMySQL } = require('./database/mysql_pool');

const birthdayStart = async () => {
	client = await client;
	let date = new Date();
	dailyCheck(date);
	setInterval(() => {
		date = new Date();
		dailyCheck(date);
	}, 24 * 1000 * 3600);
}

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
}

const generalId = '102097104322711552'; // General
const testId = '424309421519142913';  	// robot-playground

const findTextChannel = () => {
	const channelId = getEnvironment() === 'DEVELOPMENT' ? testId : generalId;
	if (!client.channels) {
		console.log('Client not initialized!', client)
		return null;
	}
	const channel = client.channels.get(channelId); // generalId
	// console.log('@findTextChannel', channel && channel.name);
	if(channel) {
		return channel;
	}
	for(let i = 0; i < client.channels.length; i++) {
		const channel = client.channels[i];
		if(channel.name === 'kanal_general') {
			console.log('RETURNING GENERAL')
			return channel;
		}
	}
}

const dailyCheck = async (date) => {
	console.log('@dailyCheck:', (date.getMonth() + 1), date.getDate());
	const result = await getBirthdays(date) || [];
	if(result.length > 0) {
		const channel = findTextChannel();
		if (!channel) return null;
		console.log('@main TextChannel:', channel.name);
		for(let i = 0; i < result.length; i++) {
			const entry = result[i];
			console.log('Entry', i, ':', entry.userName);
			const { uid, userName, birthday } = entry;
			// console.log('List:', channel.guild.members);
			const members = channel.guild.members;
			const user = members.get(uid);
			// console.log('Hej', uid, channel.guild.members.constructor.name, channel.id, members.get(uid)); //.members[uid]);
			const message = ':birthday: Happy Birthday to ' + user.toString() + '! :birthday: '; // <@' + uid + '>!';
			channel.send(message);
		}
	}
}

let client = getClient('birthday', async () => initializeMySQL(getConfig().db), birthdayStart);
