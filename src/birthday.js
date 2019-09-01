'use strict';
// Author: Petter Andersson

// Main File for discord bot: Handles event for messages

const Discord = require('discord.js');

// Get Instance of discord client
const client = new Discord.Client();

const pool = require('./database');
const { prefix, token, db } = require('../conf.json'); // Load config data from file

// will only do stuff after it's ready
client.on('ready', () => {
	console.log('ready to rumble');
	main();
	// db_sequelize.initDb(db.database, db.user, db.dbpw, db.host, db.dialect); // Initialize db_sequelize database on startup of bot
});

// Login
client.login(token);

const getBirthdays = async () => {
  const sql = 'SELECT * FROM birthdays WHERE DATE(birthday) = CURDATE();';
  try {
    const result = await pool.query(sql);
    console.log('@getBirthdays Records:', result);
    return result;
  } catch (error) {
    console.error('Error getBirthdays', error);
    const result = [{
		uid: '157967049694380032',
		userName: 'Lukas',
		birthday: '2019-09-01',
	}]
    return error;
  }
}

const generalId = '102097104322711552'; // General
const testId = '424309421519142913';  	// robot-playground

const findTextChannel = () => {
	const channel = client.channels.get(testId); // generalId
	console.log('@findTextChannel', channel);
	if(channel) {
		return channel;
	}
	for(let i = 0; i < client.channels.length; i++) {
		const channel = client.channels[i];
		console.log('name:', channel.name)
		if(channel.name === 'kanal_general') {
			console.log('RETURNING GENERAL')
			return channel;
		}
	}
}

const main = async () => {
	const channel = findTextChannel();
	console.log('@main', channel);
	const result = await getBirthdays() || [];
	for(let i = 0; i < result.length; i++) {
		const entry = result[i];
		console.log('Entry', i, ':', entry);
		const { uid, userName, birthday } = entry;
		// console.log('List:', channel.guild.members);
		const members = channel.guild.members;
		const user = members.get(uid);
		// console.log('Hej', uid, channel.guild.members.constructor.name, channel.id, members.get(uid)); //.members[uid]);
		const message = ':birthday: Happy Birthday to ' + user.toString() + '! :birthday: '; // <@' + uid + '>!';
		channel.send(message);
	}
}
