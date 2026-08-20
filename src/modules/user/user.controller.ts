import type { Request, Response } from 'express';
import { userService } from './user.service.js';
import {
  CheckUsernameAvailabilityInput,
  UpdateSelfUserInput,
  UpdateUserByAdminInput,
} from './user.schema.js';
import { sendResponse } from '../../utils/response/sendResponse.js';

class UserController {
  // const input = req.validatedBody as CreateUserInput;
  // const { id } = req.validatedParams as UserIdParams;
  // const query = req.validatedQuery as ListUsersQuery;

  async updateSelfUser(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
    }
    const input = req.validatedBody as UpdateSelfUserInput;
    const result = await userService.updateSelf(req.user?.id as string, input);
    if (result) {
      res.status(200).json({ message: 'User updated successfully', user: result });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  }
  async updateUserByAdmin(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as UpdateUserByAdminInput;
    const { id } = req.validatedParams as { id: string };
    const result = await userService.updateByAdmin(id, input);
    if (result) {
      res.status(200).json({ message: 'User updated successfully', user: result });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  }
  async checkUsernameAvailability(req: Request, res: Response): Promise<void> {
    const { username } = req.validatedQuery as CheckUsernameAvailabilityInput;
    const isAvailable = await userService.isUsernameAvailable(username);
    if (isAvailable) {
      sendResponse(res, 200, 'success', 'Username is available', { available: true });
    } else {
      sendResponse(res, 200, 'success', 'This username is already taken. Please choose a different one.', { available: false });
    }
  }
}

export const userController = new UserController();
