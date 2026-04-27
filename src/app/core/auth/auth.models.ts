export type UserRole = 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresInMs: number;
  refreshExpiresInMs: number;
  username: string;
  role: UserRole;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  username: string;
  role: UserRole;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
}
