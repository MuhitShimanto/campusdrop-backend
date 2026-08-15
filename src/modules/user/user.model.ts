import {
  AccountStatus,
  UserRole,
} from './user.types.js';

export interface User {
  userId: string;

  sid: string | null;
  name: string;
  avatar: string | null;
  universityEmail: string | null;
  
  slug: string | null;

  accountStatus: AccountStatus;
  role: UserRole;
  isVerified: boolean;

  createdAt: Date;
  updatedAt: Date;
}