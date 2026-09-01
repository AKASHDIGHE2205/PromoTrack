import api from "../api";

export interface DashboardDayMarker {
  date: string;
  day_label: string;
  present: boolean;
}

export interface DashboardTrendPoint {
  date: string;
  day_label: string;
  count: number;
}

export interface DashboardRecentPromote {
  promote_id: number;
  shop_id: number;
  shop_name: string;
  promote_date: string;
  cust_mob: string;
  status: "A" | "I";
  item_count: number;
  total_kg: number | string;
}

export interface DashboardTopProduct {
  item_id: number;
  item_name: string;
  brand_name: string;
  uom: string;
  qty: number | string;
  total_kg: number | string;
}

export interface DashboardSummary {
  success: boolean;
  month_label: string;
  today: {
    marked: boolean;
    check_in: string | null;
  };
  attendance: {
    days_present: number;
    days_elapsed: number;
    streak: number;
    last_7_days: DashboardDayMarker[];
  };
  promotions: {
    total: number;
    total_kg: number;
    shops_covered: number;
    daily_trend: DashboardTrendPoint[];
    recent: DashboardRecentPromote[];
  };
  products: {
    total_distinct: number;
    top: DashboardTopProduct[];
  };
}

export const getDashboardSummary = async () => {
  try {
    const response = await api.get<DashboardSummary>("/dashboard/summary");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching dashboard summary:", error);
    throw error.response?.data?.message ?? error.message;
  }
};
