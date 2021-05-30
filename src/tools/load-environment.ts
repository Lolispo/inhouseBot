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
  return Config.instance.prefix;
}