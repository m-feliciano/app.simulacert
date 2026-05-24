import { ApiConfig } from '../app/api/config/api.config';

// Use localhost:8080 for local development or localhost:3000/dev for Mockoon
export const environment = {
  production: false,
  apiConfig: {
    baseUrl: 'http://localhost:8080'
  } as ApiConfig
};

