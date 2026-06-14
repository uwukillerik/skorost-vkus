import { RequestHandler } from "express";
import { ZodSchema } from "zod";

export function validateBody<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message =
        result.error.issues.map((i) => i.message).join(". ") ||
        "Ошибка валидации";
      res.status(400).json({
        error: message,
        details: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
