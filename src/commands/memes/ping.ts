import { getClientReference } from "../../client";

export const pingAction = async (message, options) => {
  await getClientReference();
  /*
  TODO: DISCORD12 Implementation of Pings since moved from clients
  console.log('PingAlert, user had !ping as command', client.pings);
  f.print(message, 'Time of response ' + client.pings[0] + ' ms');
  */
} 