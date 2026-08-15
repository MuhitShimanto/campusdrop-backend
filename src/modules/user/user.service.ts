import { User } from "./user.model.js";
import { userRepository } from "./user.repository.js";
import { UpdateSelfUserInput, UpdateUserByAdminInput } from "./user.schema.js";

class UserService {
  async updateSelf(userId: string, userData: UpdateSelfUserInput): Promise<User | null> {
    const updatedUser = await userRepository.update(userId, userData);
    return updatedUser;
  }
  async updateByAdmin(userId: string, userData: UpdateUserByAdminInput): Promise<User | null> {
    const updatedUser = await userRepository.update(userId, userData);
    return updatedUser;
  }
}

export const userService = new UserService();
