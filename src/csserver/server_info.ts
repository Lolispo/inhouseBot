const csDomain = 'kosatupp.datho.st';
const csPort = '28967';
const csPw = 'get';
const csConnectConsole = `connect ${csDomain}:${csPort}; password ${csPw}`; // connect kosatupp.datho.st:27207; password get
const csConnectUrl = `steam://connect/${csDomain}:${csPort}/${csPw}`; 			// steam://connect/kosatupp.datho.st:28967/get

export const updateCsServer = (port = csPort, pw = csPw, domain = csDomain) => {
  csConnectConsole = `connect ${csDomain}:${csPort}; password ${csPw}`;
  csConnectUrl = `steam://connect/${csDomain}:${csPort}/${csPw}`;
};

export const getCsIp = () => csConnectConsole;

export const getCsUrl = () => csConnectUrl;
