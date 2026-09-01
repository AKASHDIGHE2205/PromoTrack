import axios from "axios";
import api from "../api";

const BASE_URL = import.meta.env.VITE_BASE_URL ?? "";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  status: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string,
  user: AuthUser
}

export const authApi = {
  login: (payload: LoginPayload) =>
    axios.post<LoginResponse>(`${BASE_URL}/auth/login`, payload, {
      headers: { "Content-Type": "application/json" },
    }).then((r) => r.data),
};

export interface Profile {
  user_id: number;
  f_name: string;
  m_name: string | null;
  l_name: string;
  mobile: string | null;
  email: string;
  role: string;
  status: "A" | "I";
  created_at?: string;
}

export interface UpdateProfilePayload {
  f_name: string;
  m_name: string;
  l_name: string;
  mobile: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const getMyProfile = async () => {
  try {
    const response = await api.get<{ success: boolean; data: Profile }>("/auth/me");
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message ?? error.message;
  }
};

export const updateProfile = async (payload: UpdateProfilePayload) => {
  try {
    const response = await api.put<{ success: boolean; message: string; data: Profile }>("/auth/me", payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message ?? error.message;
  }
};

export const changePassword = async (payload: ChangePasswordPayload) => {
  try {
    const response = await api.put<{ success: boolean; message: string }>("/auth/change-password", payload);   
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message ?? error.message;
  }
};
