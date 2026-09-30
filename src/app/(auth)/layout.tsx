import Link from "next/link";
import { Package } from "lucide-react";
import { APP_NAME } from "@/config";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="flex h-14 items-center px-6 border-b bg-white/80 backdrop-blur">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <Package className="size-5" aria-hidden="true" />
          {APP_NAME}
        </Link>
      </header>

      {/* Main content */}
      <main
        id="main-content"
        className="flex flex-1 items-center justify-center p-4"
      >
        {children}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t bg-white/60">
        <p>
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
