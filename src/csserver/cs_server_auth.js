
let activeToken = '';

const setActiveToken = (value) => activeToken = value;
const getActiveToken = () => activeToken;

/**
 * getToken
 */
const getToken = async () => {
  if (process.env.ODIN_TOKEN) {
    return process.env.ODIN_TOKEN;
  } else if (activeToken !== '') {
    return activeToken;
  } else {
    const username = process.env.DATHOST_USER;
    const password = process.env.DATHOST_PW;

    const token = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
    setActiveToken(token);
    console.log('Token:', token);
    return token;
  }
}

exports.refreshToken = () => {
  console.log('Invalidated Token. Prev Token: ' + activeToken);
  setActiveToken('');
  return getToken();
}

module.exports = {
  getToken : getToken,
  getActiveToken : getActiveToken,
}