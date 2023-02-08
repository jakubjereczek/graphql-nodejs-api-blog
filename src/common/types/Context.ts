import { Request, Response } from 'express';
import { UserIdentifier } from './User';

interface Context {
  req: Request;
  res: Response;
  user: UserIdentifier | null;
}

export default Context;
