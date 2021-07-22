import { describe, it, expect, afterAll, afterEach, jest } from '@jest/globals';
import { Message } from 'discord.js';
import { handleMessageExported } from '../../src/bot';
import { print, deleteDiscMessage } from '../../src/tools/f';

jest.mock('../../src/tools/f');
jest.mock('discord.js');

describe('Test handleMessage', () => {
    const message = ({} as unknown) as Message;

    afterEach(() => {
        jest.clearAllMocks();
    })

    it('should call "f.print" with "( ͡° ͜ʖ ͡°)" if a message is "lenny" and f.deleteDiscordMessage', () => {
        message.content = 'lenny';
        handleMessageExported(message);
        expect(print).toHaveBeenCalledWith(message, "( ͡° ͜ʖ ͡°)");
        expect(deleteDiscMessage).toHaveBeenCalledWith(message, 15000, 'lenny');
    })

    it('should call "f.print" with "( ͡° ͜ʖ ͡°)" if a message is "lennyface" and f.deleteDiscordMessage', () => {
        message.content = 'lennyface';
        handleMessageExported(message);
        expect(print).toHaveBeenCalledWith(message, "( ͡° ͜ʖ ͡°)");
        expect(deleteDiscMessage).toHaveBeenCalledWith(message, 15000, 'lenny');
    })

    it('should call "f.print" with "( ͡° ͜ʖ ͡°)" if a message is "-lenny" and f.deleteDiscordMessage', () => {
        message.content = '-lenny';
        handleMessageExported(message);
        expect(print).toHaveBeenCalledWith(message, "( ͡° ͜ʖ ͡°)");
        expect(deleteDiscMessage).toHaveBeenCalledWith(message, 15000, 'lenny');
    })

    it('should call "f.print" with "( ͡° ͜ʖ ͡°)" if a message is "-lennyface" and f.deleteDiscordMessage', () => {
        message.content = '-lennyface';
        handleMessageExported(message);
        expect(print).toHaveBeenCalledWith(message, "( ͡° ͜ʖ ͡°)");
        expect(deleteDiscMessage).toHaveBeenCalledWith(message, 15000, 'lenny');
    })

    it('should NOT print "( ͡° ͜ʖ ͡°)" if a message is "not lenny"', () => {
        message.content = 'not lenny';
        handleMessageExported(message);
        expect(print).not.toHaveBeenCalled();
        expect(deleteDiscMessage).not.toHaveBeenCalled();
    })

    it('should NOT print "( ͡° ͜ʖ ͡°)" if a message is "lenny not"', () => {
        message.content = 'lenny not';
        handleMessageExported(message);
        expect(print).not.toHaveBeenCalled();
        expect(deleteDiscMessage).not.toHaveBeenCalled();
    })
})