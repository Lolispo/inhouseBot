
import { handleError, handleResponse, IResponse } from '../csserver/cs_server_http';
import axios from 'axios';

export const getTriviaQuestions = async (url: string): Promise<IResponse> => {
  const params = {
    url
  };
  try {
    const response = await axios(params);
    console.log('Response:', params.url);
    return handleResponse(response, 'TriviaQuestions', {
      allow: [200],
    });
  } catch (error) {
    return handleError(error, `Failed TriviaQuestions Response: ${params.url} ${error}`);
  }
}

export const getTokenRequest = async (): Promise<IResponse> => {
  const params = {
    url: 'https://opentdb.com/api_token.php?command=request'
  };
  try {
    const response = await axios(params);
    console.log('Response:', params.url);
    return handleResponse(response, 'Get Token', {
      allow: [200],
    });
  } catch (error) {
    return handleError(error, `Failed TriviaToken Response: ${params.url} ${error}`);
  }
}


export interface TokenResponse {
  response_code: number,
  response_message: string // 'Token Generated Successfully!',
  token: string // 'dc37007c5a66109c4e9e0c0aa659a6216e724f37f53e9236ba296f91b6379b39'
}

