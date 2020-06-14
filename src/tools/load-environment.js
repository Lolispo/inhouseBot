
exports.getConfig = () => {
  if (!process.env.PREFIX || !process.env.DISCORD_TOKEN) {
    console.error('No env variables found!')
    process.exit(1);
  }
  return { 
    prefix: process.env.PREFIX,
    token: process.env.DISCORD_TOKEN,
    db: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PW,
      database: process.env.DB_DATABASE,
      dialect: process.env.DB_DIALECT
    }
  }
}