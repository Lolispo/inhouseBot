require('dotenv').config({ path: __dirname+'/./../../.env' });

exports.getEnvironment = () => {
  switch(process.env.ENVIRONMENT.toLowerCase()) {
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
}

exports.getConfig = () => {
  if (!process.env.PREFIX || !process.env.DISCORD_TOKEN) {
    console.error('No env variables found!')
    process.exit(1);
  }
  return { 
    environment: process.env.ENVIRONMENT,
    prefix: process.env.PREFIX,
    token: process.env.DISCORD_TOKEN,
    db: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PW,
      name: process.env.DB_NAME,
      dialect: process.env.DB_DIALECT
    }
  }
}