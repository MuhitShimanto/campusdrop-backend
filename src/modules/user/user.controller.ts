import type { Request, Response } from 'express';
import { userService } from './user.service.js';
import { UpdateSelfUserInput, UpdateUserByAdminInput } from './user.schema.js';

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
}

export const userController = new UserController();
