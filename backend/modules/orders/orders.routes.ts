import { Router } from "express";
import { ordersController } from "./orders.controller.ts";
import { advanceStepSchema, createOrderSchema, orderIdParamSchema } from "./orders.schema.ts";
import { validate } from "../../middleware/validate.ts";
import { authenticate } from "../../middleware/authenticate.ts";
import { asyncHandler } from "../../shared/asyncHandler.ts";

export const ordersRoutes = Router();

ordersRoutes.use(authenticate);

ordersRoutes.get("/", asyncHandler(ordersController.list));
ordersRoutes.post("/", validate({ body: createOrderSchema }), asyncHandler(ordersController.create));
ordersRoutes.patch(
  "/:id/step",
  validate({ params: orderIdParamSchema, body: advanceStepSchema }),
  asyncHandler(ordersController.advanceStep),
);
