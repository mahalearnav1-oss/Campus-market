import jwt, { SignOptions } from 'jsonwebtoken';
import { Response } from 'express';
import { config } from '../config';
import { JwtPayload } from '../types/auth.types';

export function generateAccessToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: '15m' };
  return jwt.sign(payload, config.jwtSecret, options);
}

export function generateRefreshToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: '7d' };
  return jwt.sign(payload, config.refreshTokenSecret, options);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, config.refreshTokenSecret) as JwtPayload;
}

export const REFRESH_COOKIE_NAME = 'cm_refresh_token';

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/api/v1/auth',
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.cookie(REFRESH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/api/v1/auth',
  });
}
