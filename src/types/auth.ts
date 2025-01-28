export interface SignUpData {
  email: string;
  username: string;
  password: string;
}

export interface SignInData {
  username: string;  // email is used as username
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
} 