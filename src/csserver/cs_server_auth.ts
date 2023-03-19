
let activeToken = '';

const setActiveToken = value => activeToken = value;
export const getActiveToken = () => activeToken;

/**
 * getToken
 */
export const getToken = async () => {
  if (activeToken !== '') {
    return activeToken;
  }
  const username = process.env.DATHOST_USER;
  const password = process.env.DATHOST_PW;

  const token = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  setActiveToken(token);
  console.log('Token:', token);
  return token;
};

export const refreshToken = () => {
  console.log(`Invalidated Token. Prev Token: ${activeToken}`);
  setActiveToken('');
  return getToken();
};
