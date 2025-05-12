import { Role } from "./Role";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  role: Role,
  createdAt: string;
  updatedAt: string;
}