const teamNameCombination = [
	"$player1$'s $plural-lul$",
	"$player1$ + 4 $plural-lul$",
  "4 $plural-lul$ and $adjective$ $player5$",
  // "$player1$ & $player2$'s $plural-lul$",
  "The $adjectiveC$ $plural-lul$",
  "5 $adjectiveC$ $plural-lul$"
];

const adjective = [
  'adorable',
  'confused',
  'tiny',
  'edgy',
  'spawn camping',
  '',
  //'ugly',
  //'filthy',
]

const pluralLuls = [
	'pepegas',
	'lads',
	'bois',
	'friends',
	'memers',
	'cats',
	'elephants',
	'idiots',
	'virgins',
	'epic gamers',
	'princesses',
  'angels',
  'bots',
  'plebs',
  'weebs',
  'trainwrecks',
  'mamacitas',
  'pool noodles',
  'villians',
  'trash cans',
  'kiddos',
  'ducks',
  'avocados',
  'queens',
  '1337 h4xx0rz',
  'goblins',
  'pp-bizons',
  'spicy meatballs',
  'grillz',
  'cornflakes',
  'coconuts',
  'coffin fillers',
  'alpacas',
  'helicopters',
  'gunners',
  'boys on the edge',
  'chicken sandwiches',
  'gatekeepers',
  'paddle players',
  'stealth assassins',
  'npcs',
  'hot men',
  'b-site rushers',
  'pandas',
  'foxes',
  'dogs',
  'doggos'
];


const specialNames = [
	'Petter',
	'Pippin',
	'Robin'
]

class Team {
  constructor(name, teamMembers)  {
    this.teamMembers = teamMembers;
    this.name = name;
  }
}

const getRndInt = (num) => {
  return Math.floor(Math.random() * num);
}

const capitalize = (selectedOption) => {
  const list = selectedOption.split(/\s+/g);
  return list.map((s) => s.charAt(0).toUpperCase() + (s.length > 1 ? s.substring(1) : '')).join(' ');
}

const stringReplace = (s, pattern, collection, capital = true) => {
  const randomNumber = Math.floor(Math.random() * collection.length);
  let selectedOption = collection[randomNumber];
  if (capital) {
    selectedOption = capitalize(selectedOption)
  }
  // console.log('Option chosen:', selectedOption, randomNumber)
  return s.replace(pattern, selectedOption);
}


const specialTeams = [
  new Team(stringReplace('$plural-lul$ of Stockholm', '$plural-lul$', pluralLuls, true), [
    'Knas',
    'Petter',
    'Pippin',
    'Von Dobbeln',
    'Morgan',
    'Lester',
    'Obtained',
    'CATKNIFE',
    'Ciffe'
  ]), 
  new Team(stringReplace('$plural-lul$ of Uppsala', '$plural-lul$', pluralLuls, true), [
    'Petter',
    'Bambi',
    'Robin',
    'Lacktjo',
    'Senpai',
    'Pleb',
    'Simon',
    'Gaggg',
    'Banza1',
    'ErjanDaMan',
    'WTHX',
  ]),
  new Team('Birdie Squad', [
    'Petter',
    'Bambi',
    'PARaflaXet', // Check capital
    'Senpai',
    'Pleb',
  ])
];

// If every individual in team is part of this group
const special5Squad = (team, specialgroup) => {
  return team.every((player) => specialgroup.includes(player.userName));
}

/*
const almostSpecial5Squad = (team, specialgroup) => {
  const filteredTeam = team.filter((player) => specialgroup.includes(player.userName));
  if (filteredTeam.length === team.length - 1) {

  }
}
*/


// Generate a team name based on the teamnames
exports.getTeamName = (team, game) => {
	const sortedTeam = team.sort((el1, el2) => el1.getMMR(game) < el2.getMMR(game));
	if (sortedTeam.length === 1) {
		return 'Team ' + sortedTeam[0].userName;
	}
	if (sortedTeam.length === 2) {
		return sortedTeam[0].userName + ' and ' + sortedTeam[1].userName; 
	}

  // Decide either random combination or based on special person
  const matching = specialTeams.map((specTeam) => {
    const name = specTeam.name;
    const teamMembers = specTeam.teamMembers;
    if (special5Squad(team, teamMembers)) return name;
    return null;
  }).filter((el) => el); // Remove null

  // Special squad
  if (matching.length >= 1) {
    if (matching.length === 1) return matching[0]
    else return matching[getRndInt(matching.length)]
  }

  // If special person exist, 25% chance it is used
  const specialRnd = Math.random();
  const specialExists = team.some((player) => specialNames.includes(player.userName));
	if (specialExists && specialRnd <= 0.12) {
    // console.log('Special Time:', specialExists, specialRnd);
    let specialOptions = [];
    if(team.some((player) => player.userName === 'Petter')) specialOptions.push('Petter och hans fyra getter');
		if(team.some((player) => player.userName === 'Pippin')) specialOptions.push('El Banditos');
    if(team.some((player) => player.userName === 'Robin')) specialOptions.push('Knife Squad');
    return specialOptions.length === 1 ? specialOptions[0] : specialOptions[getRndInt(specialOptions.length)];
	}

	let randomTeamOption = teamNameCombination[getRndInt(teamNameCombination.length)];
	// console.log('Option chosen:', randomTeamOption, randomNumber)
	for(let i = 0; i < sortedTeam.length; i++){
		randomTeamOption = randomTeamOption.replace(`$player${(i+1)}$`, sortedTeam[i].userName);
	}
	if (randomTeamOption.includes('$plural-lul$')) {
    randomTeamOption = stringReplace(randomTeamOption, '$plural-lul$', pluralLuls);
  }
  
  if (randomTeamOption.includes('$adjective$')) {
    randomTeamOption = stringReplace(randomTeamOption, '$adjective$', adjective, false);
  }
  
  if (randomTeamOption.includes('$adjectiveC$')) {
    randomTeamOption = stringReplace(randomTeamOption, '$adjectiveC$', adjective, true);
	}
	return randomTeamOption;
}