'use strict';
// Author: Petter Andersson

require('dotenv').config({ path: __dirname+'/./../.env' });

const pool = require('mysql-promisify-pool');
let client;

const getBirthdays = async () => {
  const sql = 'SELECT * FROM birthdays WHERE DATE(birthday) = CURDATE();';
  try {
    const result = await pool.query(sql);
    console.log('@getBirthdays Records:', result);
    return result;
  } catch (error) {
    console.error('@getBirthdays Error:', error);
    return error;
  }
}

const generalId = '102097104322711552'; // General
const testId = '424309421519142913';  	// robot-playground

const findTextChannel = () => {
	const channel = client.channels.get(generalId); // generalId
	console.log('@findTextChannel', channel.name);
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

exports.birthdayStart = async (client) => {
	client = client;
	setInterval(() => {
		dailyCheck();
	}, 24 * 1000 * 3600);
}

const dailyCheck = (date) => {
	const channel = findTextChannel();
	console.log('@main TextChannel:', channel.name);
	const result = await getBirthdays(date) || [];
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
