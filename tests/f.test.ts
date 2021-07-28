import { jest, describe, it, afterEach, expect } from '@jest/globals';
import { Message, SnowflakeUtil } from 'discord.js';
import { deleteDiscMessage, padString, prettifyPercentage, print } from '../src/tools/f';

jest.mock('discord.js');

const outputMessageContent: string = 'Output message content';

const deleteMock = jest.fn().mockImplementation(() => {
  const dummyMessage = ({
    id: SnowflakeUtil.generate(),
  } as unknown) as Message;
  return Promise.resolve(dummyMessage);
})

describe('f', function(){
  describe('prettifyPercentage', () => {
    it('50.50', function(){
      const x = prettifyPercentage(0.5050);
      expect(x).toEqual(51);
    });
    it('50.50', function(){
      const x = prettifyPercentage(0.66666666);
      expect(x).toEqual(67);
    });
    it('75', function(){
      const x = prettifyPercentage(0.75);
      expect(x).toEqual(75);
    });
  });
  describe('padString', () => {
    it('100', function(){
      const x = padString('100%');
      expect(x).toEqual('100%');
    });
    it('50', function(){
      const x = padString('50%');
      expect(x).toEqual('50% ');
    });
    it('5', function(){
      const x = padString('5%');
      expect(x).toEqual('5%  ');
    });
    it('0', function(){
      const x = padString('0%');
      expect(x).toEqual('0%  ');
    });
    it('15', function(){
      const x = padString(15, 3)
      expect(x).toEqual('15 ');
    });
    it('100', function(){
      const x = padString(100, 3)
      expect(x).toEqual('100');
    });
    it('1', function(){
      const x = padString(1, 3)
      expect(x).toEqual('1  ');
    });
  });
  describe('print', () => {
    const sendMock = jest.fn().mockImplementation((messageContent) => {
      const message = {
        id: SnowflakeUtil.generate(),
        content: messageContent,
        delete: deleteMock,
      };
      return Promise.resolve(message);
    })

    const inputMessage = {
      id: SnowflakeUtil.generate(),
      content: 'Input message content',
      channel: {
        send: sendMock,
      },
    };

    afterEach(() => {
      jest.useRealTimers();
      jest.clearAllMocks();
    })

    it('Should send a message with the outputMessageContent to the channel of the inputMessage and delete the outputMessage', async () =>{
      jest.useFakeTimers();
      await print(inputMessage as unknown as Message, outputMessageContent);
      expect(sendMock).toHaveBeenCalledWith(outputMessageContent);
      jest.advanceTimersByTime(60000);
      expect(deleteMock).toHaveBeenCalled();
    })
  });
  describe('deleteDiscMessage', () => {
    const outputMessage = {
      id: SnowflakeUtil.generate(),
      content: outputMessageContent,
      delete: deleteMock,
    };

    afterEach(() => {
      jest.useRealTimers();
      jest.clearAllMocks();
    })

    it('Should delete a message', () => {
      jest.useFakeTimers();
      deleteDiscMessage(outputMessage);
      jest.advanceTimersByTime(60000);
      expect(deleteMock).toHaveBeenCalled();
    })
  });
})

// TODO: deleteIntervals in f.ts isn't cleared between the different tests ('print', and 'deleteDiscMessage')


