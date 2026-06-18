"use client";

import { motion } from "framer-motion";
import { ChartNoAxesCombined, Users, CalendarDays, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const summaryCards = [
  { label: "Team Members", value: "24", icon: Users },
  { label: "Present Today", value: "21", icon: CalendarDays },
  { label: "Reports", value: "8", icon: FileText },
];

export default function ManagerDashboard() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <ChartNoAxesCombined className="h-10 w-10 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-muted-foreground">Track your team and review attendance.</p>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="shadow-premium">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <CardDescription>Quick team summary</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle>Manager Access Ready</CardTitle>
          <CardDescription>
            You are signed in successfully. Team and report pages can be expanded next.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="gradient-primary text-white">View Team</Button>
        </CardContent>
      </Card>
    </div>
  );
}
