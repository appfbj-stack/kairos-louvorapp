/**
 * env.ts — Variáveis de ambiente validadas.
 */

import 'dotenv/config';

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória: ${key}`);
  }
  return value;
};

const optional = (key: string, fallback: string): string => {
  return process.env[key] || fallback;
};

export const env = {
  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET: required('JWT_SECRET'),
  PORT: parseInt(optional('PORT', '3000'), 10),
  NODE_ENV: optional('NODE_ENV', 'development'),
  APP_URL: optional('APP_URL', 'http://localhost:3000'),
  ADMIN_URL: optional('ADMIN_URL', 'http://localhost:3000'),
  GEMINI_API_KEY: optional('GEMINI_API_KEY', ''),
};
