import type { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

export type RequestWithCurrentUser = Request & {
  currentUser?: JwtPayload;
};
