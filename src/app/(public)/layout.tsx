import { PublicNav } from "@/components/shared/nav/PublicNav";

function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold">Platform</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="/services" className="hover:text-foreground">Services</a></li>
              <li><a href="/pricing" className="hover:text-foreground">Pricing</a></li>
              <li><a href="/track" className="hover:text-foreground">Track shipment</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="/about" className="hover:text-foreground">About</a></li>
              <li><a href="/contact" className="hover:text-foreground">Contact</a></li>
              <li><a href="/faq" className="hover:text-foreground">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Account</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="/login" className="hover:text-foreground">Log in</a></li>
              <li><a href="/register" className="hover:text-foreground">Sign up</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">LogiFlow</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Bangladesh&apos;s trusted courier and logistics management platform.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} LogiFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
