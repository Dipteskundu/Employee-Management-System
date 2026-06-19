import Link from "next/link";
import { Home, Compass, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center animate-in fade-in zoom-in duration-500">
        <div className="mx-auto mb-8 w-24 h-24 gradient-primary rounded-2xl flex items-center justify-center animate-bounce">
          <Compass className="h-12 w-12 text-white" />
        </div>

        <h1 className="mb-2 text-7xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          404
        </h1>

        <p className="mb-3 text-xl font-medium">
          Page Not Found
        </p>

        <p className="mb-8 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <Card className="shadow-premium">
          <CardHeader>
            <CardTitle className="text-lg">Quick Navigation</CardTitle>
            <CardDescription>Choose where you&apos;d like to go</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/login">
              <Button className="w-full justify-start gap-3" variant="outline">
                <Search className="h-4 w-4" />
                <span>Back to Login</span>
              </Button>
            </Link>
            <Link href="/">
              <Button className="w-full justify-start gap-3 gradient-primary text-white">
                <Home className="h-4 w-4" />
                <span>Go to Home</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          <span>Or use your browser&apos;s back button</span>
        </div>
      </div>
    </div>
  );
}