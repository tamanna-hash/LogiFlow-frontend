import Link from "next/link";
import { Package, Phone, Mail, MapPin, ChevronRight, Globe } from "lucide-react";
import { PublicNav } from "@/components/shared/nav/PublicNav";
import { APP_NAME } from "@/config";

function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-bold text-lg mb-4">
              <Package className="size-5 text-primary" />
              {APP_NAME}
            </div>
            <p className="text-sm text-sidebar-foreground/60 leading-relaxed">
              Bangladesh&apos;s trusted courier and logistics management platform — fast, trackable, reliable.
            </p>
            <div className="flex gap-3 mt-6">
              {[Phone, Mail, Globe].map((Icon, i) => (
                <div key={i} className="flex size-9 items-center justify-center rounded-full bg-white/10 hover:bg-primary transition-colors cursor-pointer">
                  <Icon className="size-4" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-sidebar-foreground/80 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-3 text-sm">
              {[["Services", "/services"], ["Pricing", "/pricing"], ["Track Shipment", "/track"], ["Book Now", "/register"]].map(([l, h]) => (
                <li key={h}>
                  <Link href={h} className="text-sidebar-foreground/60 hover:text-primary transition-colors flex items-center gap-1.5">
                    <ChevronRight className="size-3" />{l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-sidebar-foreground/80 uppercase tracking-wider">Company</h4>
            <ul className="space-y-3 text-sm">
              {[["About", "/about"], ["Contact", "/contact"], ["FAQ", "/faq"]].map(([l, h]) => (
                <li key={h}>
                  <Link href={h} className="text-sidebar-foreground/60 hover:text-primary transition-colors flex items-center gap-1.5">
                    <ChevronRight className="size-3" />{l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-sidebar-foreground/80 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm text-sidebar-foreground/60">
              <li className="flex items-center gap-2"><Phone className="size-4 text-primary shrink-0" />+880 1700 000 000</li>
              <li className="flex items-center gap-2"><Mail className="size-4 text-primary shrink-0" />support@logiflow.app</li>
              <li className="flex items-center gap-2"><MapPin className="size-4 text-primary shrink-0" />Dhaka, Bangladesh</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sidebar-foreground/40">
          <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-sidebar-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-sidebar-foreground transition-colors">Terms of Service</a>
          </div>
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
