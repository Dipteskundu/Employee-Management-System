"use client";

import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { logout } from "@/lib/api";

export default function UnauthorizedIpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full shadow-premium-lg border-destructive/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Unauthorized IP</CardTitle>
          <CardDescription className="text-muted-foreground">
            Your IP address is not authorized to access this application.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Please contact your administrator to get your IP address whitelisted.
          </p>
          <Button variant="outline" onClick={logout} className="w-full">
            Go Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
