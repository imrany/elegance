import { useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ServerError() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Force reload the page from the server to re-run setup/API health checks
    window.location.reload();
  };

  return (
    <div className="container flex min-h-[75vh] flex-col items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md border-none shadow-none bg-transparent">
        <CardHeader className="text-center pb-4">
          {/* Visual Indicator Container using theme tokens */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <CardTitle className="font-serif text-2xl font-light tracking-tight text-foreground md:text-3xl">
            Connection Failed
          </CardTitle>

          <CardDescription className="mt-3 text-sm text-muted-foreground leading-relaxed">
            We're having trouble connecting to our core services. This usually
            means the backend server is temporarily down, restarting, or
            experiencing a database timeout.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Helpful admin context block adapting to dark/light surfaces cleanly */}
          <div className="rounded-md border bg-background/60 p-4 text-xs leading-relaxed text-muted-foreground backdrop-blur-sm">
            <p className="font-semibold text-foreground mb-2">
              Troubleshooting for Admins:
            </p>
            <ul className="list-disc pl-4 space-y-1.5">
              <li>
                Verify your Docker containers or Go backend processes are
                actively running.
              </li>
              <li>
                Check network policies, port forwarding rules, or reverse proxy
                settings.
              </li>
              <li>
                Inspect your backend service terminal logs for runtime crashes.
              </li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center pt-2">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="lg"
            className="w-full sm:w-auto min-w-[160px] group gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : "group-hover:rotate-45 transition-transform"}`}
            />
            {isRefreshing ? "Checking..." : "Retry Connection"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
