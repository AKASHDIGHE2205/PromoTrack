import api from "../api";
import type { Shop } from "../../pages/global/shop/types";

export interface GetShopsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetShopsResponse {
  success: boolean;
  shops: Shop[];
  total: number;
  page: number;
  totalPages: number;
}

export const getShops = async (params: GetShopsParams = {}) => {
  try {
    const response = await api.get<GetShopsResponse>("/shop/get-shops", { params });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching shops:", error);
    throw error.response?.data?.message ?? error.message;
  }
};

export const getActiveShops = async () => {
  try {
    const response = await api.get("/shop/get-active-shops",);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching shops:", error);
    throw error.response?.data?.message ?? error.message;
  }
};

export const getShopById = async (id: number) => {
  try {
    const response = await api.get(`/shop/get-shop/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching shop:", error);
    throw error.response?.data?.message ?? error.message;
  }
};

export const addShop = async (data: any) => {
  try {
    const response = await api.post("/shop/add-shop", data);
    return response.data;
  } catch (error: any) {
    console.error("Error adding shop:", error);
    throw error.response?.data?.message ?? error.message;
  }
};

export const updateShop = async (id: number, data: any) => {
  try {
    const response = await api.put(`/shop/update-shop/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error("Error updating shop:", error);
    throw error.response?.data?.message ?? error.message;
  }
};

export const toggleShopStatus = async (id: number) => {
  try {
    const response = await api.patch(`/shop/toggle-status/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error toggling shop status:", error);
    throw error.response?.data?.message ?? error.message;
  }
};
