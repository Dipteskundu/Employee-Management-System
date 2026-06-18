"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Users, Building2, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const quickStats = [
  { label: "Employees", value: "128", icon: Users },
  { label: "Offices", value: "6", icon: Building2 },
  { label: "Reports", value: "24", icon: FileText },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <ShieldCheck className="h-10 w-10 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, offices, and reporting.</p>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="shadow-premium">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <CardDescription>Live system overview</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle>Admin Access Ready</CardTitle>
          <CardDescription>
            You are signed in successfully. The rest of the admin modules can be
            connected next.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="gradient-primary text-white">Open Employees</Button>
        </CardContent>
      </Card>
    </div>
  );
}
