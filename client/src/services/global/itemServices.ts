import api from "../api";
import type { Item } from "../../pages/global/item/types";

export interface GetItemsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetItemsResponse {
  success: boolean;
  items: Item[];
  total: number;
  page: number;
  totalPages: number;
}

export const getItems = async (params: GetItemsParams = {}) => {
  try {
    const response = await api.get<GetItemsResponse>("/item/get-items", { params });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching items:", error);
    throw error.response?.data?.message ?? error.message;
  }
};

export const getActiveItems = async () => {
  try {
    const response = await api.get("/item/get-active-items");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching items:", error);
    throw error.response?.data?.message ?? error.message;
  }
};

export const getItemById = async (id: number) => {
  try {
    const response = await api.get(`/item/get-item/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching item:", error);
    throw error.response?.data?.message ?? error.message;
  }
};

export const addItem = async (data: any) => {
  try {
    const response = await api.post("/item/add-item", data);
    return response.data;
  } catch (error: any) {
    console.error("Error adding item:", error);
    throw error.response?.data?.message ?? error.message;
  }
};

export const updateItem = async (id: number, data: any) => {
  try {
    const response = await api.put(`/item/update-item/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error("Error updating item:", error);
    throw error.response?.data?.message ?? error.message;
  }
};

export const toggleItemStatus = async (id: number) => {
  try {
    const response = await api.patch(`/item/toggle-status/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error toggling item status:", error);
    throw error.response?.data?.message ?? error.message;
  }
};
