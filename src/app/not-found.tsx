import Link from "next/link";
import { Package, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/config";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-6">
        <Package className="mx-auto size-16 text-muted-foreground/30" aria-hidden="true" />
      </div>
      <h1 className="text-6xl font-bold text-muted-foreground/30">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Page not found</h2>
      <p className="mt-2 text-muted-foreground max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <Button asChild>
          <Link href="/">
            <Home className="mr-2 size-4" />
            Go home
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/track">
            <Search className="mr-2 size-4" />
            Track shipment
          </Link>
        </Button>
      </div>
      <p className="mt-8 text-xs text-muted-foreground">{APP_NAME}</p>
    </div>
  );
}
