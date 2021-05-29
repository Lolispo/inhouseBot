import { Player } from "./game/player";

const teamNameCombination = [
  "$player1$'s $plural-lul$",
  '$player1$ + $num-1$ $plural-lul$',
  '$num-1$ $plural-lul$ and $adjective$ $playerlast$',
  // "$player1$ & $player2$'s $plural-lul$",
  'The $adjectiveC$ $plural-lul$',
  '$num$ $adjectiveC$ $plural-lul$',
];

const adjective = [
  'adorable',
  'confused',
  'tiny',
  'edgy',
  'spawn camping',
  // '', // Need to handle space to work
  // 'ugly',
  // 'filthy',
];

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
  'doggos',
];


const specialNames = [
  'Petter',
  'Pippin',
  'Robin',
];

class Team {
  name;
  teamMembers;

  constructor(name, teamMembers) {
    this.teamMembers = teamMembers;
    this.name = name;
  }
}

const getRndInt = num => Math.floor(Math.random() * num);

const capitalize = (selectedOption) => {
  const list = selectedOption.split(/\s+/g);
  return list.map(s => s.charAt(0).toUpperCase() + (s.length > 1 ? s.substring(1) : '')).join(' ');
};

const stringReplace = (s, pattern, collection, capital = true) => {
  const randomNumber = Math.floor(Math.random() * collection.length);
  let selectedOption = collection[randomNumber];
  if (capital) {
    selectedOption = typeof selectedOption === 'string' ? capitalize(selectedOption) : selectedOption;
  }
  // console.log('Option chosen:', selectedOption, randomNumber)
  return s.replace(pattern, selectedOption);
};


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
    'ciffelindholm',
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
  ]),
];

// If every individual in team is part of this group
const special5Squad = (team, specialgroup) => team.every(player => specialgroup.includes(player.userName));

/*
const almostSpecial5Squad = (team, specialgroup) => {
  const filteredTeam = team.filter((player) => specialgroup.includes(player.userName));
  if (filteredTeam.length === team.length - 1) {

  }
}
*/


// Generate a team name based on the teamnames
export const getTeamName = (team: Player[], game) => {
  const sortedTeam = team.sort((el1, el2) => {
    return el1.getMMR(game) - el2.getMMR(game);
  });
  console.log('@SortedTeam DEBUG:', team.map(player => player.mmrs[game]), sortedTeam.map(player => player.mmrs[game]));
  if (sortedTeam.length === 1) {
    return `Team ${sortedTeam[0].userName}`;
  }
  if (sortedTeam.length === 2) {
    return `${sortedTeam[0].userName} and ${sortedTeam[1].userName}`;
  }

  // Decide either random combination or based on special person
  const matching = specialTeams.map((specTeam) => {
    const { name } = specTeam;
    const { teamMembers } = specTeam;
    if (special5Squad(team, teamMembers)) return name;
    return null;
  }).filter(el => el); // Remove null

  // Special squad
  if (matching.length >= 1) {
    if (matching.length === 1) return matching[0];
    return matching[getRndInt(matching.length)];
  }

  // If special person exist, 25% chance it is used
  const specialRnd = Math.random();
  const specialExists = team.some(player => specialNames.includes(player.userName));
  if (specialExists && specialRnd <= 0.12) {
    // console.log('Special Time:', specialExists, specialRnd);
    const specialOptions = [];
    if (team.some(player => player.userName === 'Petter')) specialOptions.push('Petter och hans fyra getter');
    if (team.some(player => player.userName === 'Pippin')) specialOptions.push('El Banditos');
    if (team.some(player => player.userName === 'Robin')) specialOptions.push('Knife Squad');
    // if(team.some((player) => player.userName === 'Lacktjo')) specialOptions.push(''); // Axel meme
    return specialOptions.length === 1 ? specialOptions[0] : specialOptions[getRndInt(specialOptions.length)];
  }

  let randomTeamOption = teamNameCombination[getRndInt(teamNameCombination.length)];
  // console.log('Option chosen:', randomTeamOption, randomNumber)
  for (let i = 0; i < sortedTeam.length; i++) {
    randomTeamOption = randomTeamOption.replace(`$player${(i + 1)}$`, sortedTeam[i].userName);
    if (i === sortedTeam.length - 1) randomTeamOption = randomTeamOption.replace('$playerlast$', sortedTeam[i].userName);
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

  if (randomTeamOption.includes('$num-1$')) {
    const num = sortedTeam.length - 1;
    randomTeamOption = randomTeamOption.replace('$num-1$', String(num));
  }

  if (randomTeamOption.includes('$num$')) {
    randomTeamOption = randomTeamOption.replace('$num$', String(sortedTeam.length));
  }
  return randomTeamOption;
};
