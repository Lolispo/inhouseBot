import * as dotenv from 'dotenv';

dotenv.config({ path: `${__dirname}/./../../.env` });

export class Config {
  static instance;
}

export const getEnvironment = () => {
  switch (process.env.ENVIRONMENT.toLowerCase()) {
    case 'dev':
    case 'development': {
      return 'DEVELOPMENT';
    }
    case 'prod':
    case 'production':
    default: {
      return 'PRODUCTION';
    }
  }
};

export const getConfig = () => {
  if (Config.instance) return Config.instance;
  if (!process.env.PREFIX || !process.env.DISCORD_TOKEN) {
    console.error('No env variables found!');
    process.exit(1);
  }
  const config = {
    environment: process.env.ENVIRONMENT,
    prefix: process.env.PREFIX,
    token: process.env.DISCORD_TOKEN,
    db: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PW,
      name: process.env.DB_NAME,
      dialect: process.env.DB_DIALECT,
    },
  };
  Config.instance = config;
  return config;
};

export const getPrefix = () => {
  if (!Config.instance) getConfig();
  return Config.instance.prefix;
}

/**
 * Whether a CS (Dathost) server is configured. When false, CS games are
 * balanced without a server automatically (no need to pass `noserver`).
 */
export const isCsServerConfigured = (): boolean =>
  Boolean(process.env.DATHOST_USER && process.env.DATHOST_PW);

/**
 * URL of the local Dota server app (DotesBot, https://github.com/Cronvs/DotesBot).
 * Falls back to the historical hardcoded address for backwards compatibility.
 */
export const getDotaServerUrl = (): string =>
  process.env.DOTA_SERVER_URL || 'http://127.0.0.1:4545';

/**
 * Whether a Dota server is configured. Set DOTA_SERVER_URL in .env (e.g.
 * http://127.0.0.1:4545 when running DotesBot locally) to enable Dota servers.
 * When false, Dota games are balanced without a server automatically.
 */
export const isDotaServerConfigured = (): boolean =>
  Boolean(process.env.DOTA_SERVER_URL);