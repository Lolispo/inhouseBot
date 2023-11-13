import { Message } from "discord.js";
import { IEmbeddedMessageInput } from "./types";
import * as f from './tools/f';

const noop = (message: Message) => { // callback used when no operation is wanted
	// Doesn't delete the message
}

export const printMessage = (message: string | IEmbeddedMessageInput, channelMessage: Message, callback = noop) => { // Default: NOT removing message
	f.print(channelMessage, message, callback);
}