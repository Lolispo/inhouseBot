import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import {
  getDotaServerUrl,
  isCsServerConfigured,
  isDotaServerConfigured,
} from '../src/tools/load-environment';

describe('Server configuration detection', () => {
  const envKeys = ['DATHOST_USER', 'DATHOST_PW', 'DOTA_SERVER_URL'];
  let saved: Record<string, string | undefined>;

  beforeEach(() => {
    saved = {};
    envKeys.forEach((key) => {
      saved[key] = process.env[key];
      delete process.env[key];
    });
  });

  afterEach(() => {
    envKeys.forEach((key) => {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    });
  });

  describe('isCsServerConfigured', () => {
    it('is false when Dathost credentials are missing', () => {
      expect(isCsServerConfigured()).toBe(false);
    });

    it('is false when only one credential is set', () => {
      process.env.DATHOST_USER = 'user';
      expect(isCsServerConfigured()).toBe(false);
    });

    it('is true when both Dathost credentials are set', () => {
      process.env.DATHOST_USER = 'user';
      process.env.DATHOST_PW = 'pw';
      expect(isCsServerConfigured()).toBe(true);
    });
  });

  describe('isDotaServerConfigured', () => {
    it('is false when DOTA_SERVER_URL is missing', () => {
      expect(isDotaServerConfigured()).toBe(false);
    });

    it('is true when DOTA_SERVER_URL is set', () => {
      process.env.DOTA_SERVER_URL = 'http://127.0.0.1:4545';
      expect(isDotaServerConfigured()).toBe(true);
    });
  });

  describe('getDotaServerUrl', () => {
    it('falls back to the historical local address', () => {
      expect(getDotaServerUrl()).toBe('http://127.0.0.1:4545');
    });

    it('uses DOTA_SERVER_URL when set', () => {
      process.env.DOTA_SERVER_URL = 'http://192.168.1.50:4545';
      expect(getDotaServerUrl()).toBe('http://192.168.1.50:4545');
    });
  });
});
