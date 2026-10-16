import { Router } from "express";
import { authController } from "./auth.controller.ts";
import { changePasswordSchema, loginSchema, registerSchema } from "./auth.schema.ts";
import { validate } from "../../middleware/validate.ts";
import { authenticate } from "../../middleware/authenticate.ts";
import { asyncHandler } from "../../shared/asyncHandler.ts";

export const authRoutes = Router();

authRoutes.post("/register", validate({ body: registerSchema }), asyncHandler(authController.register));
authRoutes.post("/login", validate({ body: loginSchema }), asyncHandler(authController.login));
authRoutes.get("/me", authenticate, asyncHandler(authController.me));
authRoutes.post(
  "/change-password",
  authenticate,
  validate({ body: changePasswordSchema }),
  asyncHandler(authController.changePassword),
);
