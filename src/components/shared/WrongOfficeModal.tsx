"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { logout } from "@/lib/api";

interface WrongOfficeModalProps {
  assignedOffice: string;
  detectedOffice: string;
  message?: string;
}

export default function WrongOfficeModal({ assignedOffice, detectedOffice, message }: WrongOfficeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="max-w-md w-full mx-4 shadow-premium-lg border-amber-500/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Wrong Office Detected</CardTitle>
          <CardDescription className="text-muted-foreground">
            {message || "You are accessing from a different office network."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">You are registered under:</span>
              <span className="font-semibold">{assignedOffice}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">You are currently accessing from:</span>
              <span className="font-semibold text-amber-600">{detectedOffice}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Please connect from your assigned office network to mark attendance.
          </p>
          <Button variant="outline" onClick={logout} className="w-full">
            Go Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
