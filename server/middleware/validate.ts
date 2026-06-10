import { RequestHandler } from "express";
import { ZodSchema } from "zod";

export function validateBody<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: "Ошибка валидации",
        details: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
