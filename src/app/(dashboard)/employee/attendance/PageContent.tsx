"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, Wifi, CheckCircle2, AlertCircle, XCircle, Mail, Loader2, Timer } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClockIn, useClockOut, useAttendanceHistory } from "@/hooks/useAttendance";
import { useOffices } from "@/hooks/useOffices";
import { getUser, getToken, sendOtp, verifyOtp, apiService } from "@/lib/api";
import { requestNotificationPermission, showNotification } from "@/lib/notifications";
import { toast } from "sonner";
import { format } from "date-fns";

type VerificationStatus = "pending" | "active" | "completed" | "failed";

interface VerificationStep {
  step: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: VerificationStatus;
}

export default function AttendancePage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: historyData } = useAttendanceHistory(`start_date=${today}&end_date=${today}`);
  const { data: officesData } = useOffices();
  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [hadClockOut, setHadClockOut] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpError, setOtpError] = useState("");
  const [otpDeliveryInfo, setOtpDeliveryInfo] = useState("");
  const otpTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [steps, setSteps] = useState<VerificationStep[]>([
    { step: 1, title: "Network Check", description: "Verifying office IP address", icon: Wifi, status: "active" },
    { step: 2, title: "Location Check", description: "Verifying GPS coordinates", icon: MapPin, status: "pending" },
    { step: 3, title: "Identity Verification", description: "Enter OTP sent to your email", icon: Mail, status: "pending" },
  ]);

  const [userOffice, setUserOffice] = useState<any>(null);
  const [userIp, setUserIp] = useState("");
  const [userGps, setUserGps] = useState<{ latitude: number; longitude: number } | null>(null);
  const [clocking, setClocking] = useState(false);
  const [wrongOfficeError, setWrongOfficeError] = useState<{ assigned: string; detected: string } | null>(null);

  useEffect(() => {
    if (historyData?.attendance) {
      const records = historyData.attendance;
      const hasIn = records.some((r: any) => r.type === "IN");
      const hasOut = records.some((r: any) => r.type === "OUT");
      setIsClockedIn(hasIn && !hasOut);
      setHadClockOut(hasOut);
    }
  }, [historyData]);

  useEffect(() => {
    const user = getUser();
    setCurrentUser(user);
    if (officesData?.offices && user?.assigned_office_id) {
      const office = officesData.offices.find((o: any) => o._id === user.assigned_office_id);
      setUserOffice(office);
    }
  }, [officesData]);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((r) => r.json())
      .then((d) => setUserIp(d.ip))
      .catch(() => setUserIp("unknown"));
  }, []);

  useEffect(() => {
    if (!userIp || !currentUser || currentUser.role === "admin") return;
    const checkWrongOffice = async () => {
      try {
        const result = await apiService.auth.checkOffice(userIp);
        if (result.match === false && result.detected_office) {
          setWrongOfficeError({
            assigned: result.assigned_office || "Unknown",
            detected: result.detected_office,
          });
        } else {
          setWrongOfficeError(null);
        }
      } catch {
        // endpoint might not exist yet
      }
    };
    checkWrongOffice();
  }, [userIp, currentUser]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserGps({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const statusConfig = {
    completed: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    active: { icon: AlertCircle, color: "text-primary", bg: "bg-primary/10" },
    pending: { icon: XCircle, color: "text-muted-foreground", bg: "bg-muted" },
    failed: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  };

  const triggerSendOtp = async () => {
    if (otpSending || otpCountdown > 0) return;
    setOtpSending(true);
    setOtpError("");
    setOtpDeliveryInfo("");
    try {
      const result = await sendOtp();
      setOtpCountdown(300);
      setOtpDeliveryInfo(result.message || "");
      if (result.message?.includes("[DEV]")) {
        toast.warning("OTP only logged to server console (check Brevo API key)");
      } else {
        toast.success(result.message || "OTP sent to your email");
      }
    } catch (err: any) {
      setOtpError(err.message || "Failed to send OTP");
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setOtpSending(false);
    }
  };

  useEffect(() => {
    if (steps[2].status === "active" && !otpVerified && !otpSending && otpCountdown === 0) {
      triggerSendOtp();
    }
  }, [steps[2].status]);

  useEffect(() => {
    if (otpCountdown > 0) {
      otpTimerRef.current = setInterval(() => {
        setOtpCountdown((prev) => {
          if (prev <= 1) {
            if (otpTimerRef.current) clearInterval(otpTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (otpTimerRef.current) clearInterval(otpTimerRef.current);
    };
  }, [otpCountdown > 0]);

  const runVerification = async () => {
    setSteps((prev) =>
      prev.map((s) => (s.step === 1 ? { ...s, status: "completed" as VerificationStatus } : s.step === 2 ? { ...s, status: "active" as VerificationStatus } : s))
    );

    setTimeout(() => {
      setSteps((prev) =>
        prev.map((s) => (s.step === 2 ? { ...s, status: "completed" as VerificationStatus } : s.step === 3 ? { ...s, status: "active" as VerificationStatus } : s))
      );
    }, 800);
  };

  const handleClockAction = async () => {
    if (!userIp || !userGps) {
      toast.error("Unable to get device location or IP");
      return;
    }

    setClocking(true);
    try {
      if (isClockedIn) {
        await clockOutMutation.mutateAsync({
          ip: userIp,
          latitude: userGps.latitude,
          longitude: userGps.longitude,
        });
        toast.success("Clock out successful");
        showNotification("Clocked Out", {
          body: `You clocked out at ${format(new Date(), "h:mm a")}`,
        });
        setIsClockedIn(false);
        setHadClockOut(true);
      } else {
        if (!otpVerified) {
          toast.error("Please verify OTP first");
          setClocking(false);
          return;
        }
        await clockInMutation.mutateAsync({
          ip: userIp,
          latitude: userGps.latitude,
          longitude: userGps.longitude,
        });
        toast.success("Clock in successful");
        showNotification("Clocked In", {
          body: `You clocked in at ${format(new Date(), "h:mm a")}`,
        });
        setIsClockedIn(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to record attendance");
    } finally {
      setClocking(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setOtpError("");
    try {
      await verifyOtp(otp);
      setOtpVerified(true);
      setSteps((prev) => prev.map((s) => (s.step === 3 ? { ...s, status: "completed" as VerificationStatus } : s)));
      toast.success("OTP verified successfully");
    } catch (err: any) {
      setOtpError(err.message || "Invalid OTP");
      toast.error(err.message || "Invalid OTP");
    }
  };

  const stepsComplete = isClockedIn || hadClockOut;

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2 sm:gap-3"
      >
        <Clock className="h-7 w-7 sm:h-10 sm:w-10 text-primary" />
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold">Clock In / Out</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Complete the triple-lock verification to mark attendance</p>
        </div>
      </motion.div>

      <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="shadow-premium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Current Status</CardTitle>
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge className={isClockedIn ? "gradient-success text-white" : hadClockOut ? "bg-info text-info-foreground" : "bg-muted text-muted-foreground"}>
                {isClockedIn ? "Clocked In" : hadClockOut ? "Shift Complete" : "Not Clocked In"}
              </Badge>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
                {isClockedIn ? "You are currently on the clock" : hadClockOut ? "Today's shift is complete" : "Ready to start your shift"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="shadow-premium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Today's Shift</CardTitle>
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">9:00 AM - 6:00 PM</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Standard work hours</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="shadow-premium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Office</CardTitle>
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold truncate">{userOffice?.office_name || "Loading..."}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">IP: {userIp || "detecting..."}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {wrongOfficeError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-center"
        >
          <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-amber-700 mb-2">Wrong Office Detected</h3>
          <p className="text-sm text-muted-foreground mb-1">
            You are registered under: <span className="font-semibold">{wrongOfficeError.assigned}</span>
          </p>
          <p className="text-sm text-muted-foreground mb-3">
            You are currently accessing from: <span className="font-semibold text-amber-600">{wrongOfficeError.detected}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Please connect from your assigned office network to mark attendance.
          </p>
        </motion.div>
      )}

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="shadow-premium">
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-sm sm:text-base">Triple-Lock Verification</CardTitle>
              <CardDescription className="text-xs">Complete all verification steps</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 space-y-3 sm:space-y-4">
              {steps.map((step) => {
                const config = statusConfig[step.status];
                const Icon = config.icon;
                return (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: step.step * 0.1 }}
                    className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg ${config.bg}`}
                  >
                    <div className={`p-1.5 sm:p-2 rounded-full ${config.bg} shrink-0`}>
                      <step.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-xs sm:text-sm font-medium ${config.color}`}>
                        Step {step.step}: {step.title}
                      </h3>
                      <p className="text-[10px] sm:text-sm text-muted-foreground">
                        {step.step === 3 && currentUser?.email ? `Enter OTP sent to ${currentUser.email}` : step.description}
                      </p>
                    </div>
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${config.color} shrink-0`} />
                  </motion.div>
                );
              })}

              {steps[2].status === "active" && !stepsComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {otpVerified ? (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm text-emerald-600 font-medium">OTP Verified</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          className="flex-1 text-center text-base sm:text-lg tracking-widest"
                          maxLength={6}
                        />
                        <Button onClick={handleVerifyOtp} disabled={otp.length !== 6} className="shrink-0" size="sm">
                          {otpSending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                        </Button>
                      </div>
                      {otpError && (
                        <p className="text-xs text-destructive">{otpError}</p>
                      )}
                      {otpSending && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" /> Sending OTP...
                        </p>
                      )}
                      {otpDeliveryInfo && (
                        <p className="text-xs text-muted-foreground">{otpDeliveryInfo}</p>
                      )}
                      {otpCountdown > 0 && !otpSending && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Timer className="h-3 w-3" /> OTP expires in {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, "0")}
                        </p>
                      )}
                      {otpCountdown === 0 && !otpSending && !otpVerified && (
                        <Button variant="outline" size="sm" onClick={triggerSendOtp} className="text-xs">
                          Resend OTP
                        </Button>
                      )}
                    </>
                  )}
                </motion.div>
              )}

              {!stepsComplete && !isClockedIn && (
                <Button
                  onClick={otpVerified ? handleClockAction : runVerification}
                  className="w-full gradient-primary text-white"
                  size="lg"
                  disabled={clocking || otpSending || !!wrongOfficeError}
                >
                  {clocking ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</> : otpVerified ? "Clock In" : "Start Verification"}
                </Button>
              )}

              {isClockedIn && (
                <Button
                  onClick={handleClockAction}
                  className="w-full bg-destructive text-destructive-foreground"
                  size="lg"
                  disabled={clocking}
                >
                  {clocking ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</> : "Clock Out"}
                </Button>
              )}

              {hadClockOut && (
                <p className="text-center text-xs sm:text-sm text-muted-foreground">You have completed today's shift.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card className="shadow-premium">
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-sm sm:text-base">Today's Activity</CardTitle>
              <CardDescription className="text-xs">Your attendance timeline</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-2 sm:space-y-4">
                {historyData?.attendance?.length > 0 ? (
                  historyData.attendance.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-background">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${
                          item.status === "present" ? "bg-emerald-500" :
                          item.status === "late" ? "bg-amber-500" : "bg-blue-500"
                        }`} />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium">{item.type === "IN" ? "Clock In" : "Clock Out"}</p>
                          <p className="text-[10px] sm:text-sm text-muted-foreground">{format(new Date(item.timestamp), "h:mm a")}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize text-[10px] sm:text-xs shrink-0">{item.status}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-6 sm:py-8 text-xs sm:text-sm">No activity recorded today</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
