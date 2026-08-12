import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function getEnvVariable(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`CRITICAL STARTUP ERROR: Environment variable ${key} is missing.`);
  }
  return value;
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  frontendUrl: getEnvVariable('FRONTEND_URL', 'http://localhost:5173'),
  databaseUrl: getEnvVariable('DATABASE_URL', 'mysql://root:root@localhost:3306/campusmarket'),
  jwtSecret: getEnvVariable('JWT_SECRET', 'development_secret_key_campusmarket_2026_min32'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'development_refresh_secret_key_campusmarket_2026_min32',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
};
