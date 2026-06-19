import { Loader2 } from "lucide-react";

export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mx-auto mb-6 w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center animate-spin">
          <Loader2 className="h-8 w-8 text-white" />
        </div>
        <p className="text-center text-muted-foreground font-medium animate-pulse">Loading...</p>
        <div className="mt-4 flex justify-center gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-2 h-2 gradient-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}