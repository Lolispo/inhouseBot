const axios = require('axios');
const { getToken, getActiveToken } = require('./cs_server_auth');

axios.defaults.timeout = 30000; // Timeout 10 mins

const DATHOST_URL = process.env.DATHOST_URL || 'https://dathost.net/api/0.1/';

const handleResponse = (response, message, rules = {allow: [200]}) => {
  if(message) console.log(message, response.status, response.data);
  if (rules.allow.includes(response.status)) {
    return {
      statusCode: response.status,
      data: response.data
    }
  } else {
    console.error('Invalid statusCode:', response.status, response.data);
    return {
      statusCode: response.status,
      data: response.data
    }
  }
}

const handleError = (error, message) => {
  if(message) console.error(message, 'Error:', error.message, error);
  if (error && error.response && error.response.status) {
    return {
      statusCode: error.response.status,
      data: error
    }
  } else {
    return {
      statusCode: 400,
      data: error
    }
  }
}

const datHostEndpoint = async (endpoint, options = null, printInfo = '') => {
  let token = getActiveToken();
  if (!token || token === '') {
    token = await getToken();
  }
  
  const headers = {
    'Authorization': token,
  };

  const url = DATHOST_URL + endpoint;
  const params = {
    method: (options && options.method ? options.method : (options && options.data ? 'POST' : 'GET')),
    url: url,
    headers: {
      ...headers,
      ...(options && options.headers ? options.headers : { 'Content-Type': 'application/json' }),
    },
    ...(options && options.data && { data: options.data }),
  }

  if (printInfo !== '' && false) console.log('Params:', params);
  try {
    const response = await axios(params);
    console.log('Response:', endpoint, (options && options.data ? JSON.stringify(options.data) : ''));
    return handleResponse(response, printInfo, { 
      allow: [200],
    });
  } catch (error) {
    return handleError(error, 'Failed Response: ' + params.url + ', ' + JSON.stringify(params.data));
  }
}

module.exports = {
  datHostEndpoint : datHostEndpoint,
}