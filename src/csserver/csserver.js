import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { handleError, handleResponse, AxiosResponseInterface } from './comm-helper';
import { getToken, getActiveToken } from './odin-auth';
import { DefaultProcurement } from '@tendium/vish-odin-translator/models/default/procurement/procurement';
import { log } from './logger';

axios.defaults.timeout = 12 * 60000; // Timeout 10 mins

const url = '';

export const insertOdinData = async (endpoint, data, dbName, printInfo = '') => {
  let token = getActiveToken();
  if (!token || token === '') {
    token = await getToken();
  }
  
  const headers = {
    'Content-Type': 'application/json', // x-www-form-urlencoded',
    'Authorization': 'Bearer ' + token,
  };

  const url = process.env.ODIN_ENDPOINT + 'data/' + dbName + '/' + endpoint;
  const params = {
    method: 'POST',
    url: url,
    headers: headers,
    data: data
  }

  try {
    const response = await axios(params);
    log('inserted data to odin:', JSON.stringify(data))
    return handleResponse(response, 'Insert ' + printInfo + 'Check:', { 
      allow: [200],
    });
  } catch (error) {
    return handleError(error, 'Insert Failed with params: ' + params.url + ', ' + JSON.stringify(params.data));
  }
}

export const healthCheck = async () => {
  let token = getActiveToken();
  if (!token) {
    token = await getToken();
  }
  
  const headers = {
    'Authorization': 'Bearer ' + token,
  };

  const url = process.env.ODIN_ENDPOINT + 'healthcheck';
  const params = {
    method: 'GET',
    headers: headers,
    url: url
  }

  try {
    const response = await axios(params)
    return handleResponse(response, 'Healthcheck Check:', {
      allow: [200],
    });
  } catch (error) {
    return handleError(error, 'Healthcheck Failed');
  }
}