import { Router } from "express";
import { membersController } from "./members.controller.ts";
import { createMemberSchema, memberIdParamSchema } from "./members.schema.ts";
import { validate } from "../../middleware/validate.ts";
import { authenticate } from "../../middleware/authenticate.ts";
import { asyncHandler } from "../../shared/asyncHandler.ts";

export const membersRoutes = Router();

membersRoutes.use(authenticate);

membersRoutes.get("/", asyncHandler(membersController.list));
membersRoutes.post("/", validate({ body: createMemberSchema }), asyncHandler(membersController.create));
membersRoutes.delete("/:id", validate({ params: memberIdParamSchema }), asyncHandler(membersController.remove));
