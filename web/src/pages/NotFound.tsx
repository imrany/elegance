import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { FileQuestion } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="container flex min-h-[75vh] flex-col items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md border-none shadow-none bg-transparent">
          <CardHeader className="text-center pb-4">
            {/* Visual Icon Indicator */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FileQuestion className="h-7 w-7" />
            </div>

            <CardTitle className="font-serif text-3xl font-light tracking-tight text-foreground md:text-4xl">
              Page Not Found
            </CardTitle>

            <CardDescription className="mt-3 text-sm text-muted-foreground leading-relaxed">
              The resource you are looking for might have been removed, had its
              name changed, or is temporarily unavailable.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Context block for explicit user feedback regarding the broken path */}
            <div className="rounded-md border bg-muted/40 p-3 text-center text-xs font-mono text-muted-foreground break-all">
              Path: {location.pathname}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
