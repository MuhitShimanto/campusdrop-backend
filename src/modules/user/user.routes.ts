import { Router } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { userController } from './user.controller.js';
import { requireAuth, requireRole } from '../../middleware/require-auth.js';
import { validateBody } from '../../middleware/validate.js';
import { updateSelfUserSchema, updateUserByAdminSchema } from './user.schema.js';
import { UserRole } from './user.types.js';

const userRouter = Router();

userRouter.patch(
  '/profile',
  requireAuth,
  validateBody(updateSelfUserSchema),
  asyncHandler(userController.updateSelfUser),
);


// Admin Routes
userRouter.patch(
  '/admin/profile/:id',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  asyncHandler(validateBody(updateUserByAdminSchema)),
  asyncHandler(userController.updateUserByAdmin),
);

export default userRouter;
