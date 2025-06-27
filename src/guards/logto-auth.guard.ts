import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { withLogto } from '@logto/express';
import { logtoConfig } from '../configs/logto';

@Injectable()
export class LogtoAuthGuard implements CanActivate {
  private readonly logtoMiddleware = withLogto(logtoConfig);

  canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    return new Promise((resolve, reject) => {
      this.logtoMiddleware(req, res, (err?: any) => {
        if (err) {
          reject(false);
        } else if (req.user && req.user.isAuthenticated) {
          resolve(true);
        } else {
          res.redirect('/logto/sign-in');
          resolve(false);
        }
      });
    });
  }
}
