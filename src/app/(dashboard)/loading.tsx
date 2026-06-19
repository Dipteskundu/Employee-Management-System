import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex h-screen bg-background">
      <div className="w-64 bg-card border-r border-border" />
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center animate-spin">
            <Loader2 className="h-7 w-7 text-white" />
          </div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    </div>
  );
}