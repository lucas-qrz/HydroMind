import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

export class CorrelationIdMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const id = String(req.headers['x-correlation-id'] ?? randomUUID());
    req.headers['x-correlation-id'] = id;
    res.setHeader('x-correlation-id', id);
    next();
  }
}
