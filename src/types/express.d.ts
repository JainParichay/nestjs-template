import { User as UserSchema } from '@prisma/client';

declare global {
  namespace Express {
    interface User extends UserSchema {}
    interface Request {
      logout(callback: (err?: any) => void): void;
    }
  }
}
