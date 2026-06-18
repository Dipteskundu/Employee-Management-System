export const ROLES = {
  EMPLOYEE: "employee",
  MANAGER: "manager",
  ADMIN: "admin",
} as const;

export const ATTENDANCE_STATUS = {
  PRESENT: "present",
  LATE: "late",
  ABSENT: "absent",
  OVERTIME: "overtime",
} as const;

export const ATTENDANCE_TYPE = {
  IN: "IN",
  OUT: "OUT",
} as const;

export const STATUS_COLORS = {
  present: "bg-success text-success-foreground",
  late: "bg-warning text-warning-foreground",
  absent: "bg-destructive text-destructive-foreground",
  overtime: "bg-info text-info-foreground",
} as const;

export const STATUS_LABELS = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  overtime: "Overtime",
} as const;

export const DEPARTMENTS = [
  "Engineering",
  "Marketing",
  "Sales",
  "Human Resources",
  "Finance",
  "Operations",
  "Customer Support",
  "Product",
  "Design",
  "Legal",
];

export const WORKING_HOURS = {
  START: 9,
  END: 18,
  LATE_THRESHOLD_MINUTES: 15,
  OVERTIME_THRESHOLD_MINUTES: 30,
};

export const GPS_CONFIG = {
  DEFAULT_RADIUS: 50,
  MAX_RADIUS: 1000,
  HIGH_ACCURACY: true,
  TIMEOUT: 10000,
  MAXIMUM_AGE: 0,
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
  },
  ATTENDANCE: {
    CLOCK_IN: "/api/attendance/clock-in",
    CLOCK_OUT: "/api/attendance/clock-out",
    HISTORY: "/api/attendance/history",
    STATS: "/api/attendance/stats",
  },
  EMPLOYEES: {
    LIST: "/api/employees",
    CREATE: "/api/employees",
    UPDATE: (id: string) => `/api/employees/${id}`,
    DELETE: (id: string) => `/api/employees/${id}`,
  },
  OFFICES: {
    LIST: "/api/offices",
    CREATE: "/api/offices",
    UPDATE: (id: string) => `/api/offices/${id}`,
    DELETE: (id: string) => `/api/offices/${id}`,
  },
  REPORTS: {
    GENERATE: "/api/reports/generate",
    DOWNLOAD: (id: string) => `/api/reports/${id}`,
  },
};
