import api from "../api";
import type { Promote } from "../../pages/promote/types";

export interface GetPromotesParams {
  page?: number;
  limit?: number;
  search?: string;
  from_date?: string;
  to_date?: string;
}

export interface GetPromotesResponse {
  success: boolean;
  promotes: Promote[];
  total: number;
  page: number;
  totalPages: number;
  from_date: string;
  to_date: string;
}

export const getPromotes = async (params: GetPromotesParams = {}) => {
  try {
    const response = await api.get<GetPromotesResponse>("/promote/get-promotes", { params });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching promotions:", error);
    throw error.response?.data?.message ?? error.message;
  }
};

export const getPromoteById = async (id: number) => {
  try {
    const response = await api.get(`/promote/get-promote/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching promotion:", error);
    throw error.response?.data?.message ?? error.message;
  }
};

export const addPromote = async (data: any) => {
  try {
    const response = await api.post("/promote/add-promote", data);
    return response.data;
  } catch (error: any) {
    console.error("Error adding promotion:", error);
    throw error.response?.data?.message ?? error.message;
  }
};

export const updatePromote = async (id: number, data: any) => {
  try {
    const response = await api.put(`/promote/update-promote/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error("Error updating promotion:", error);
    throw error.response?.data?.message ?? error.message;
  }
};

export const togglePromoteStatus = async (id: number) => {
  try {
    const response = await api.patch(`/promote/toggle-status/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error toggling promotion status:", error);
    throw error.response?.data?.message ?? error.message;
  }
};
