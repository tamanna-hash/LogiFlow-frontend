import type { Metadata } from "next";
import { Package, Target, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About LogiFlow",
  description: "Learn about LogiFlow, Bangladesh's courier and logistics management platform.",
};

export default function AboutPage() {
  return (
    <div className="py-16 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">About LogiFlow</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A modern courier and logistics management platform built for Bangladesh.
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Package className="size-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold m-0">What we do</h2>
            </div>
            <p className="text-muted-foreground">
              LogiFlow is a full-stack courier and logistics management platform that connects
              customers, couriers, hub managers, and operations teams on a single coordinated system.
              From shipment booking to final delivery confirmation, every step is tracked and manageable.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Target className="size-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold m-0">Our platform</h2>
            </div>
            <p className="text-muted-foreground">
              The platform provides role-specific dashboards for five distinct user types: Customers
              who create and pay for shipments, Couriers who handle pickup and delivery, Hub Managers
              who oversee logistics hubs, Operations Managers who coordinate across hubs, and
              Administrators with platform-wide access.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="size-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold m-0">Technology</h2>
            </div>
            <p className="text-muted-foreground">
              Built on a modern stack: Node.js backend with Express, PostgreSQL, Prisma, and
              Redis for the API; Next.js App Router frontend with TypeScript, Tailwind CSS, and
              TanStack Query for real-time state management. Payments are handled via bKash
              integration with server-side verification.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
