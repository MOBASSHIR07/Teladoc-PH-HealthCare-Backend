import dotenv from 'dotenv';
import AppError from '../app/ErrorHelpers/AppError';
import status from 'http-status';

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: string;
   DATABASE_URL: string;
   BETTER_AUTH_SECRET: string;
   BETTER_AUTH_URL: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    ACCESS_TOKEN_EXPIRATION: string;
    REFRESH_TOKEN_EXPIRATION: string;
    BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: string;
    BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: string;
}


const loadEnvVariables = (): EnvConfig => {

    const requiredVars = ['PORT', 'DATABASE_URL', 'BETTER_AUTH_SECRET', 
      
      'BETTER_AUTH_URL',
       'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET',
        'ACCESS_TOKEN_EXPIRATION', 'REFRESH_TOKEN_EXPIRATION',
         'BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN', 'BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE'];

    requiredVars.forEach((varName) => { 
        if (!process.env[varName]) {
            // throw new Error(`Environment variable ${varName} is required but not defined.`);
            throw new AppError(status.BAD_REQUEST, `Environment variable ${varName} is required but not defined.`);
        }   
    });
 
  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || '5000',
    DATABASE_URL: process.env.DATABASE_URL || '',
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || '',
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || '',
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || '',
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || '',
    ACCESS_TOKEN_EXPIRATION: process.env.ACCESS_TOKEN_EXPIRATION || '1d',
    REFRESH_TOKEN_EXPIRATION: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
    BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: process.env.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN || '1d',
    BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: process.env.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE || '1d',
  };
};

export const envVars = loadEnvVariables()