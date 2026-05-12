import { ApiConfig } from '../app/api/config/api.config';

export const environment = {
  production: false,
  apiConfig: {
    baseUrl: 'http://localhost:3000/dev'
  } as ApiConfig
};

