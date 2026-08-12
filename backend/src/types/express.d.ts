import { UserContext } from './auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: UserContext;
    }
  }
}
