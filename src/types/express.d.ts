import { Request, Response, NextFunction } from 'express';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | Promise<Response> | void;

declare module 'express' {
  interface RequestHandler {
    (req: Request, res: Response, next: NextFunction): Promise<void> | Promise<Response> | void;
  }
}