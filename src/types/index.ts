export type UserRole = "employee" | "manager" | "admin";

export interface User {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  phone_number: string;
  assigned_office_id: string;
  department: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  _id?: string;
  system_name: string;
  timezone: string;
  work_hours_start: string;
  work_hours_end: string;
  late_threshold_minutes: number;
  otp_enabled: boolean;
  gps_enabled: boolean;
  ip_verification_enabled: boolean;
  late_arrival_alerts: boolean;
  absence_reports: boolean;
  weekly_summary: boolean;
}

export interface Office {
  _id: string;
  office_name: string;
  static_ip: string;
  latitude: number;
  longitude: number;
  allowed_radius: number;
  created_at: string;
  updated_at: string;
}

export type AttendanceType = "IN" | "OUT";
export type AttendanceStatus = "present" | "late" | "absent" | "overtime";

export interface Attendance {
  _id: string;
  user_id: string;
  timestamp: string;
  type: AttendanceType;
  verified_ip: string;
  verified_gps: {
    latitude: number;
    longitude: number;
  };
  status: AttendanceStatus;
  otp_verified: boolean;
  ip_verified: boolean;
  gps_verified: boolean;
  created_at: string;
}

export interface VerificationStep {
  step: number;
  title: string;
  description: string;
  status: "pending" | "active" | "completed" | "failed";
}

export interface DashboardStats {
  total_employees: number;
  present_today: number;
  late_today: number;
  absent_today: number;
  overtime_today: number;
}
