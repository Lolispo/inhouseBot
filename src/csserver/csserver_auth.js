import axios, { AxiosRequestConfig } from 'axios';
import { handleError, handleResponse, AxiosResponseInterface } from './comm-helper';
import { AxiosError } from 'axios';
import { errorPrint, log } from "./logger";

let activeToken = '';

export const setActiveToken = (value) => activeToken = value;
export const getActiveToken = () => activeToken;

const urlPrefix = '';

/**
 * Returns if input contains valid authentication or not
 * Dependency on Odin project
 * @param {Object} input
 * @return {Object} Response code and token or error
 */
const checkAuth = async (input) => {
  log('@checkAuth input:', input);
  if (input.token) {
    // Check valid token
    log('Authorization: token');
    const url = urlPrefix + 'authenticate/validate';
    const headers = {
      // "Content-Type": "application/x-www-form-urlencoded",
      Authorization: 'Bearer ' + input.token
    }
    const params = {
      method: 'GET',
      headers: headers,
      url: url,
    }
    log('Console: Param', params);

    try {
      const response = await axios(params)
      return handleResponse(response, 'Token Check:', {
        allow: [200],
      });
    } catch (error) {
      return handleError(error, 'Token Failed');
    }
  } else if (input.username && input.password) {
    // Check valid credentials
    const form = `username=${encodeURIComponent(input.username)}`
      + `&password=${encodeURIComponent(input.password)}`;

    /* Sets header, read more information about headers here https://developer.mozilla.org/en-US/docs/Web/API/Headers/ */
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    log('Authorization: username and password');
    const url = urlPrefix + 'authenticate/login';
    const params = {
      method: 'POST',
      headers: headers,
      url: url,
      data: form // querystring.stringify(data)
    }
    log('DEBUG: Auth user/pass:', input, params);
    try {
      const response = await axios(params)
      return handleResponse(response, 'User/Pass Check:', {
        allow: [200],
      });
    } catch (error) {
      errorPrint('DEBUG: Error:', error);
      return handleError(error, 'User/Pass Failed');
    }
  } else {
    // No valid credentials found
    log('No authorization method');
    return false;
  }
}

/**
 * getToken
 */
export const getToken = async () => {
  if (process.env.ODIN_TOKEN) {
    return process.env.ODIN_TOKEN;
  } else if (getActiveToken() !== '') {
    return getActiveToken();
  } else {
    // Auth Odin
    const result = await checkAuth({
      username: process.env.ODIN_USERNAME,
      password: process.env.ODIN_PASSWORD,
    });

    // log('CheckAuth Result:', result)

    if (!result || (result.data as AxiosError).isAxiosError) {
      return undefined;
    }
    
    const TOKEN = (result.data as OdinToken).accessToken.token;
    setActiveToken(TOKEN);
    log('Token:', TOKEN);
    return TOKEN;
  }
}

export const refreshToken = (): void => {
  log('Invalidated Token. Prev Token: ' + getActiveToken());
  setActiveToken('');
  getToken();
}