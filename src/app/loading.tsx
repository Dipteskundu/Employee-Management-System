import { Clock } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-premium animate-spin">
          <Clock className="h-7 w-7 text-white" />
        </div>
        <p className="text-muted-foreground font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
}