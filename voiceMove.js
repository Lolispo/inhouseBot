
const f = require('./f')

exports.unite = function(message, activeMembers){
	var channel = getVoiceChannel(message);
	console.log('DEBUG unite', channel.name);
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
	//console.log('DEBUG ua', channel);
	// Find all users active in a voiceChannel
	var activeUsers = [];
	var guildChannels = message.guild.channels.find(tempChannel => tempChannel.type === 'voice')
	//console.log('DEBUG uniteAll', guildChannels, guildChannels.guild.members);
	guildChannels.guild.members.forEach(function(member){
		activeUsers.push(member);
		//console.log(member);
	});

	activeUsers.forEach(function(member){
		// As long as they are still in some voice chat
		if(!f.isUndefined(member.voiceChannel)){
			member.setVoiceChannel(channel);
			//console.log('DEBUG uniteAll', member);
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
	// If param is given use that
	var res = message.content.split(' ');

	if(res.length == 2 && res[0] === `${prefix}u`){
		var channelName = res[1];
		message.guild.channels.forEach(function(channel) {
			if(channel.type === 'voice' && channel.name === channelName){
				return channel;
			}
		});
	}
	// else use same as we split in
	if(!f.isUndefined(channel1) && !f.isUndefiend(splitChannel)){
		return splitChannel;
	}
	// If this is not defined, take own own or random one
	var channel1 = message.guild.member(message.author).voiceChannel;
	console.log('DEBUG @getVoiceChannel: Own Channel:', channel1.name);
	//console.log('DEBUG: getVoiceChannel', channel1);
	if(f.isUndefined(channel1)){ // TODO: Decide if it should work if not in voice
		var voiceChannels = [];
		message.guild.channels.forEach(function(channel) {
			if(channel.type === 'voice'){
				voiceChannels.push(channel);
			}
		});

		// var guildChannels = message.guild.channels.find(channel => channel.type === 'voice'); // TODO: Filter text channels
		// channel1 = guildChannels.random(1); // TODO Check if works, requires filtering on text channels	


		//console.log('DEBUG: getVoiceChannel', guildChannels);
		channel1 = voiceChannels[1]; // Choose best channel that is not sleeping

	}
	console.log('DEBUG @getVoiceChannel: Channel chosen for unite (not param or splitChannel):', channel1.name); // TODO: Check channel1.name or something
	return channel1;
}

// Test for movement functionality in KTH channel
// TODO: If it works, we can move it. Guarantee that it works as expected
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