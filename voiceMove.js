'use strict';
// Author: Petter Andersson and Robert Wörlund

// Handles changing voice channel logic for users: unite and split methods

const f = require('./f')

var splitChannel;		// Channel we split in latest

exports.unite = function(message, activeMembers){
	var channel = getVoiceChannel(message);
	console.log('DEBUG unite on channel', channel.name); // TODO Check if work as wanted
	if(f.isUndefined(activeMembers)){
		console.log('Error: activeMembers not initialized in @unite (Test case = ok)'); // Since it is assumed to always be initialized, throw error otherwise
	}else{
		activeMembers.forEach(function(member){
			// As long as they are still in some voice chat
			if(!f.isUndefined(member.voiceChannel)){
				member.setVoiceChannel(channel);
			}
		});
	}
}

exports.uniteAll = function(message){
	var channel = getVoiceChannel(message);
	// TODO: Find all users active in a voiceChannel, currently iterates over all members of guild
	// client.voiceConnections (need to access bot.getClient() <- needs to be made)
	//console.log('DEBUG uniteAll', channel);
	message.guild.members.forEach(function(member){
		// As long as they are still in some voice chat
		if(!f.isUndefined(member.voiceChannel) && member.voiceChannelID !== message.guild.afkChannelID){ // As long as user is in a voiceChannel (Should be)
			member.setVoiceChannel(channel);
		}
	});
}

exports.split = function(message, balanceInfo, activeMembers){
	var guildChannels = Array.from(message.guild.channels);
	splitChannel = message.guild.member(message.author).voiceChannel;

	/**TEST CODE FOR KTH SERVER ONLY**/
	if(message.guild.name === 'KTH') {
		KTHChannelSwapTest(message, guildChannels);
	}

	// Get team players as GuildMember objects
	var t1players = f.teamToGuildMember(balanceInfo.team1, activeMembers); // Might give empty on test case (activeMember == undefined)
	var t2players = f.teamToGuildMember(balanceInfo.team2, activeMembers);

	// Find channels to swap to -> Change conditions for other desired channels or to randomly take 2
	// Currently hardcoded 'Team1' and 'Team2'
	var channel1 = guildChannels.find(channel => channel[1].name === 'Team1');
	var channel2 = guildChannels.find(channel => channel[1].name === 'Team2');
	if(!f.isUndefined(channel1) && !f.isUndefined(channel2)) {
		setTeamVoice(t1players, channel1[1].id);
		setTeamVoice(t2players, channel2[1].id);
	} else {
		f.print(message, 'Channels: Team1 & Team2 does not exist');
		// TODO: Choose two random voice channels available as long as total EMPTY voiceChannels > 2
		// 			else: Create 'Team1' and 'Team2' voice channel for server in its own voicechannel-category called Inhouse
		// 		guild.createChannel
	}
}

// Set VoiceChannel for an array of GuildMembers
function setTeamVoice(team, channel){
	team.forEach(function(player){
		player.setVoiceChannel(channel);
	})
}

// Return voice channel for uniting
function getVoiceChannel(message){
	// Get correct channel
	var res = message.content.split(' ');
	var channel1 = undefined;

	if(res.length == 2){ // TODO: Doesn't support channel names with name with spaces, fix
		var channelName = res[1];
		message.guild.channels.forEach(function(channel) { // TODO: Redo since forEach doesn't break on return
			console.log(channel.name, channel.type, channelName, channel.type === 'voice' && channel.name === channelName);
			if(channel.type === 'voice' && channel.name === channelName && channel.id !== message.guild.afkChannelID){
				channel1 = channel;
			}
		});
	}
	if(!f.isUndefined(channel1)){ // If param is given use that
		return channel1;
	}else if(f.isUndefined(channel1) && !f.isUndefined(splitChannel)){ // Otherwise use same voiceChannel as we split in
		return splitChannel;
	}
	// If this is not defined, take own own voiceChannel or an available one
	channel1 = message.guild.member(message.author).voiceChannel;
	
	//console.log('DEBUG: getVoiceChannel', channel1);
	if(f.isUndefined(channel1) || channel1.id === message.guild.afkChannelID){
		message.guild.channels.forEach(function(channel) { // TODO: Find way to break foreach / Change this to for loop instead (wont break)
			if(channel.type === 'voice' && channel.id !== message.guild.afkChannelID){
				channel1 = channel;
			}
		});
	}
	//console.log('DEBUG @getVoiceChannel: Channel chosen for unite (not param or splitChannel):', channel1.name);
	return channel1;
}

// Test for movement functionality in KTH channel OLD
function KTHChannelSwapTest(message, guildChannels){
	var myVoiceChannel = message.guild.member(message.author).voiceChannel;
	var testChannel = guildChannels.find(channel => channel[1].name === 'General')
	var testChannel2 = guildChannels.find(channel => channel[1].name === 'UberVoice')
	//console.log('testChannel: ', testChannel);
	if(myVoiceChannel.name === 'General'){
		message.guild.member(message.author).setVoiceChannel(testChannel2[1].id);
		f.print(message, 'Moved '+message.author.username+' from channel: '+
			message.guild.member(message.author).voiceChannel.name+' to: '+testChannel2[1].name);
	}else if(myVoiceChannel.name === 'UberVoice'){
		message.guild.member(message.author).setVoiceChannel(testChannel[1].id);
		f.print(message, 'Moved '+message.author.username+' from channel: '+
			message.guild.member(message.author).voiceChannel.name+' to: '+testChannel[1].name);
	}
}