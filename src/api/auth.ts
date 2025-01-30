import axios from 'axios';
import { SignUpData, SignInData, AuthResponse, User } from '../types/auth';

const API_URL = 'http://localhost:8000/api/auth';

export const signUp = async (data: SignUpData): Promise<User> => {
  const response = await axios.post(`${API_URL}/register`, data);
  return response.data;
};

export const signIn = async (data: SignInData): Promise<AuthResponse> => {
  const formData = new FormData();
  formData.append('username', data.username);
  formData.append('password', data.password);
  
  const response = await axios.post(`${API_URL}/token`, formData);
  return response.data;
};

export const forgotPassword = async (email: string): Promise<void> => {
  await axios.post(`${API_URL}/forgot-password`, { email });
};

export const getMe = async (token: string): Promise<User> => {
  const response = await axios.get(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}; 