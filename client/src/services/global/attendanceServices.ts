import api from "../api";
import type { AttendanceReportRow, TodayAttendance } from "../../pages/attendance/types";

export interface GetTodayAttendanceResponse {
  success: boolean;
  marked: boolean;
  attendance: TodayAttendance | null;
}

export interface GetAttendanceReportParams {
  page?: number;
  limit?: number;
  user_id?: number | string;
  from_date?: string;
  to_date?: string;
}

export interface GetAttendanceReportResponse {
  success: boolean;
  attendance: AttendanceReportRow[];
  total: number;
  page: number;
  totalPages: number;
  from_date: string;
  to_date: string;
}

export interface MarkAttendancePayload {
  selfie: Blob;
  latitude: number;
  longitude: number;
  location: string;
  pincode?: string;
  district?: string;
  state?: string;
}

export const getSelfieUrl = (selfiePath: string) => {
  const base = (import.meta.env.VITE_IMG_URL ?? "").replace(/\/api\/?$/, "");
  return `${base}/uploads/${selfiePath}`;
};

export const getTodayAttendance = async () => {
  try {
    const response = await api.get<GetTodayAttendanceResponse>("/attendance/today");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching today's attendance:", error);
    throw error.response?.data?.message ?? error.message;
  }
};

export const getAttendanceReport = async (params: GetAttendanceReportParams = {}) => {
  try {
    const response = await api.get<GetAttendanceReportResponse>("/attendance/report", { params });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching attendance report:", error);
    throw error.response?.data?.message ?? error.message;
  }
};

export const markAttendance = async (data: MarkAttendancePayload) => {
  try {
    const formData = new FormData();
    formData.append("selfie", data.selfie, "selfie.jpg");
    formData.append("latitude", String(data.latitude));
    formData.append("longitude", String(data.longitude));
    formData.append("location", data.location);
    if (data.pincode) formData.append("pincode", data.pincode);
    if (data.district) formData.append("district", data.district);
    if (data.state) formData.append("state", data.state);

    const response = await api.post("/attendance/check-in", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error marking attendance:", error);
    throw error.response?.data?.message ?? error.message;
  }
};
