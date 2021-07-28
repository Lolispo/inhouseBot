import { describe, it, expect, afterAll, afterEach, jest } from '@jest/globals';
import { Message, User } from 'discord.js';
import { handleMessageExported } from '../../src/bot';
import { print, deleteDiscMessage } from '../../src/tools/f';

jest.mock('../../src/tools/f');
jest.mock('discord.js');

describe('Test handleMessage', () => {
  const message = ({} as unknown) as Message;

  afterEach(() => {
    jest.clearAllMocks();
  })

  it('should say hi back', () => {
    message.content = 'hej';
    const user = {
      username: 'PetterTest'
    } as User;
    message.author = user;
    handleMessageExported(message);
    expect(print).toHaveBeenCalledWith(message, "Hej PetterTest");
  })
})