import api from "../api";
import type { User } from "../../pages/global/member/types";

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetUsersResponse {
  success: boolean;
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export const getUsers = async (params: GetUsersParams = {}) => {
  try {
    const response = await api.get<GetUsersResponse>("/auth/get-users", { params });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching users:", error);
    throw error.response?.data?.message ?? error.message;
  }
};

export const getUserById = async (id: number) => {
  try {
    const response = await api.get(`/auth/get-user/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching user:", error);
    throw error.response?.data?.message ?? error.message;
  }
};

export const addUser = async (data: any) => {
  try {
    const response = await api.post("/auth/add-user", data);
    return response.data;
  } catch (error: any) {
    console.error("Error adding user:", error);
    throw error.response?.data?.message ?? error.message;
  }
};

export const updateUser = async (id: number, data: any) => {
  try {
    const response = await api.put(`/auth/update-user/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error("Error updating user:", error);
    throw error.response?.data?.message ?? error.message;
  }
};

export const toggleUserStatus = async (id: number) => {
  try {
    const response = await api.patch(`/auth/toggle-status/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error toggling user status:", error);
    throw error.response?.data?.message ?? error.message;
  }
};

export interface BulkUploadUserResult {
  row: number;
  success: boolean;
  message: string;
  name?: string;
  email?: string;
}

export interface BulkUploadUsersResponse {
  success: boolean;
  message: string;
  total: number;
  successCount: number;
  errorCount: number;
  results: BulkUploadUserResult[];
}

export const bulkAddUsers = async (data: { users: any[] }) => {
  try {
    const response = await api.post<BulkUploadUsersResponse>("/auth/bulk-add-users", data);
    return response.data;
  } catch (error: any) {
    console.error("Error bulk adding users:", error);
    throw error.response?.data?.message ?? error.message;
  }
};
