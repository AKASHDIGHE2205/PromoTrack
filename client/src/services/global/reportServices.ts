import api from "../api";
import type { MonthlySalesRow, MonthlySalesTotal } from "../../pages/promote/types";

export interface GetMonthlySalesReportParams {
  from_date?: string;
  to_date?: string;
  user_id?: number | string;
  brand_type?: string;
  item_ids?: string;
}

export interface GetMonthlySalesReportResponse {
  success: boolean;
  months: MonthlySalesRow[];
  grand_total: MonthlySalesTotal;
  from_date: string;
  to_date: string;
}

export const getMonthlySalesReport = async (params: GetMonthlySalesReportParams = {}) => {
  try {
    const response = await api.get<GetMonthlySalesReportResponse>("/report/monthly-sales", { params });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching monthly sales report:", error);
    throw error.response?.data?.message ?? error.message;
  }
};
