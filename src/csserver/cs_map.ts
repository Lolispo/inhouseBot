
// TODO: Use same list as in mapveto file
const mapList = [
  'inferno',
  'dust2',
  'mirage',
  'nuke',
  'overpass',
  'train',
  'vertigo',
  'cache',
];

const getTranslatedMap = (map) => {
  for (let i = 0; i < mapList.length; i++) {
    const mapName = map.toLowerCase();
    if (mapName.includes(mapList[i])) {
      return `de_${mapList[i]}`;
    }
  }
  // No translation found in list
  return map;
};

export const translateMap = (map: string) => {
  return `"${map}" \t""`
}

export const getChosenMap = (chosenMap) => {
  if (chosenMap) {
    const map = chosenMap || 'de_inferno';
    const translatedMap = getTranslatedMap(map);
    console.log('Map chosen!', translatedMap);
    return { chosenMap: `"${translatedMap}" \t""`, skipVeto: 1 };
  }
  // TODO: skip_veto 0/1
  console.log('No map chosen');
  return {
    chosenMap: `
      "de_dust2" \t""
      "de_inferno" \t""
      "de_mirage"	\t""
      "de_nuke" \t""
      "de_overpass" \t""
      "de_train" \t""
      "de_vertigo" \t""
      "de_cache" \t""
      "de_ancient" \t""
    `,
    skipVeto: 0,
  };
};
