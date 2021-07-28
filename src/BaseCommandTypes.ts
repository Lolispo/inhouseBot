
export enum MatchMode {
  EXACT_MATCH = 0,
  STARTS_WITH // Autoincremented
}

export enum IMessageType {
  SERVER_MESSAGE = 0,
  DIRECT_MESSAGE
}

export enum HelpMode {
  NORMAL = 0,
  DETAILED
}

const adminUids = ['96293765001519104', '107882667894124544']; // Admin ids, get access to specific admin rights

export const getAdminUids = function(){
	return adminUids;
}
