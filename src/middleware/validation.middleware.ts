import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors.js';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        const fieldName = firstError.path.join('.').replace(/^(body|query|params)\./, '');
        const message = `${fieldName}: ${firstError.message}`;
        next(new BadRequestError(message, 'VALIDATION_ERROR'));
      } else {
        next(error);
      }
    }
  };
};
