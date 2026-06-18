"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, Wifi, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const verificationSteps = [
  {
    step: 1,
    title: "Network Check",
    description: "Verifying office IP address",
    icon: Wifi,
    status: "completed" as const,
  },
  {
    step: 2,
    title: "Location Check",
    description: "Verifying GPS coordinates",
    icon: MapPin,
    status: "active" as const,
  },
  {
    step: 3,
    title: "Identity Verification",
    description: "Enter OTP sent to your phone",
    icon: CheckCircle2,
    status: "pending" as const,
  },
];

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
  },
  active: {
    icon: AlertCircle,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  pending: {
    icon: XCircle,
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
};

export default function EmployeeDashboard() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Welcome back, John!</h1>
        <p className="text-muted-foreground">
          Here&apos;s your attendance status for today
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="shadow-premium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge className="gradient-success text-white">Present</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Clocked in at 9:00 AM</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-premium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Work Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6h 30m</div>
              <p className="text-xs text-muted-foreground">Until 6:00 PM</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="shadow-premium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4/5</div>
              <p className="text-xs text-muted-foreground">Days present</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="shadow-premium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18/22</div>
              <p className="text-xs text-muted-foreground">Days present</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="shadow-premium">
            <CardHeader>
              <CardTitle>Triple-Lock Verification</CardTitle>
              <CardDescription>Complete all steps to clock in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {verificationSteps.map((step) => {
                const config = statusConfig[step.status];
                const Icon = config.icon;
                return (
                  <div
                    key={step.step}
                    className={`flex items-center gap-4 p-4 rounded-lg ${config.bg}`}
                  >
                    <div className={`p-2 rounded-full ${config.bg}`}>
                      <step.icon className={`h-6 w-6 ${config.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${config.color}`}>
                        Step {step.step}: {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                );
              })}

              <Button className="w-full gradient-primary text-white" size="lg">
                Clock In
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="shadow-premium">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: "Today", time: "9:00 AM", type: "Clock In", status: "present" },
                  { date: "Yesterday", time: "9:05 AM", type: "Clock In", status: "late" },
                  { date: "Yesterday", time: "6:15 PM", type: "Clock Out", status: "overtime" },
                  { date: "Jun 15", time: "8:55 AM", type: "Clock In", status: "present" },
                  { date: "Jun 15", time: "5:30 PM", type: "Clock Out", status: "present" },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-background"
                  >
                    <div>
                      <p className="font-medium">{activity.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.date} at {activity.time}
                      </p>
                    </div>
                    <Badge
                      className={
                        activity.status === "present"
                          ? "gradient-success text-white"
                          : activity.status === "late"
                          ? "gradient-warning text-white"
                          : "bg-info text-info-foreground"
                      }
                    >
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
