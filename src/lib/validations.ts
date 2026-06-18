import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, "Please enter your email or username"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm_password: z.string(),
  phone_number: z
    .string()
    .min(10, "Please enter a valid phone number")
    .max(15, "Please enter a valid phone number"),
  department: z.string().min(1, "Please select a department"),
  role: z.enum(["employee", "manager", "admin"]),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

export const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const officeSchema = z.object({
  office_name: z.string().min(1, "Office name is required"),
  static_ip: z.string().min(1, "IP address is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  allowed_radius: z.number().min(10).max(1000),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type OfficeInput = z.infer<typeof officeSchema>;
