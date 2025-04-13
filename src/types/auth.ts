export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  user: {
    id: string;
    email: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: string;
  };
}

export interface RegisterDto {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthError {
  message: string;
  errors?: Record<string, string[]>;
}
