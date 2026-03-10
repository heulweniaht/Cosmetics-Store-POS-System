export interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

export interface AuthenticationRequest {
  username: string;
  password: string;
}

export interface UserCreationRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthenticationResponse {
  token: string;
  refreshToken: string;
  expiryTime: string;
  authenticated: boolean;
}

export interface IntrospectRequest {
  token: string;
}

export interface IntrospectResponse {
  valid: boolean;
  username?: string;
  roles?: string[];
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  token: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result?: T;
}

// Export các role constants
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  MANAGER: 'MANAGER'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];