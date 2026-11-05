import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { createError } from "../utils/errorHandler";

type ValidateTarget = "body" | "params" | "query";

export const validate = (schema: ZodSchema, target: ValidateTarget = "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse((req as any)[target]);
      (req as any)[target] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues;
        const messages = details.map((issue) => issue.message).join("; ");
        return res
          .status(400)
          .json(createError("ValidationError", messages || "Dados inválidos.", details));
      }

      return next(error);
    }
  };
};

export const validateBody = (schema: ZodSchema) => validate(schema, "body");
export const validateParams = (schema: ZodSchema) => validate(schema, "params");
export const validateQuery = (schema: ZodSchema) => validate(schema, "query");
