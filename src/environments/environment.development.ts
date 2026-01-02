import { ApiConfig } from '../app/api/config/api.config';

export const environment = {
  production: false,
  apiConfig: {
    baseUrl: 'http://localhost:8080'
  } as ApiConfig
};

