export type LocationStatus = "detecting" | "captured" | "error";

export interface LocationDetails {
  lat: number;
  lng: number;
  accuracy: number;
  address: string;
  pincode: string;
  district: string;
  state: string;
  capturedAt: string;
}

export interface TodayAttendance {
  attendance_id: number;
  attendance_date: string;
  check_in: string;
  selfie: string;
  location: string | null;
  pincode: string | null;
  district: string | null;
  state: string | null;
  latitude: number;
  longitude: number;
  status: string;
}

export interface AttendanceReportRow {
  attendance_id: number;
  user_id: number;
  f_name: string;
  l_name: string;
  attendance_date: string;
  check_in: string;
  selfie: string;
  location: string | null;
  pincode: string | null;
  district: string | null;
  state: string | null;
  latitude: number;
  longitude: number;
  status: string;
}
