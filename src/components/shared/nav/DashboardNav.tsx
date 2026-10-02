"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  CreditCard,
  User,
  Bell,
  Truck,
  Warehouse,
  Users,
  BarChart3,
  Settings,
  ClipboardList,
  MapPin,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: Record<Role, NavItem[]> = {
  CUSTOMER: [
    {
      label: "Overview",
      href: "/dashboard/customer",
      icon: <LayoutDashboard className="size-4" />,
    },
    {
      label: "My Shipments",
      href: "/dashboard/customer/shipments",
      icon: <Package className="size-4" />,
    },
    {
      label: "Payments",
      href: "/dashboard/customer/payments",
      icon: <CreditCard className="size-4" />,
    },
    {
      label: "Notifications",
      href: "/dashboard/customer/notifications",
      icon: <Bell className="size-4" />,
    },
    {
      label: "Profile",
      href: "/dashboard/customer/profile",
      icon: <User className="size-4" />,
    },
  ],
  COURIER: [
    {
      label: "Overview",
      href: "/dashboard/courier",
      icon: <LayoutDashboard className="size-4" />,
    },
    {
      label: "Assignments",
      href: "/dashboard/courier/assignments",
      icon: <ClipboardList className="size-4" />,
    },
    {
      label: "Earnings",
      href: "/dashboard/courier/earnings",
      icon: <DollarSign className="size-4" />,
    },
    {
      label: "Notifications",
      href: "/dashboard/customer/notifications",
      icon: <Bell className="size-4" />,
    },
    {
      label: "Profile",
      href: "/dashboard/courier/profile",
      icon: <User className="size-4" />,
    },
  ],
  HUB_MANAGER: [
    {
      label: "Overview",
      href: "/dashboard/hub",
      icon: <LayoutDashboard className="size-4" />,
    },
    {
      label: "Shipments",
      href: "/dashboard/hub/shipments",
      icon: <Package className="size-4" />,
    },
    {
      label: "Couriers",
      href: "/dashboard/hub/couriers",
      icon: <Truck className="size-4" />,
    },
    {
      label: "Transfers",
      href: "/dashboard/hub/transfers",
      icon: <MapPin className="size-4" />,
    },
    {
      label: "Notifications",
      href: "/dashboard/customer/notifications",
      icon: <Bell className="size-4" />,
    },
    {
      label: "Profile",
      href: "/dashboard/hub/profile",
      icon: <User className="size-4" />,
    },
  ], // end HUB_MANAGER
  OPERATIONS_MANAGER: [
    {
      label: "Overview",
      href: "/dashboard/operations",
      icon: <LayoutDashboard className="size-4" />,
    },
    {
      label: "Shipments",
      href: "/dashboard/operations/shipments",
      icon: <Package className="size-4" />,
    },
    {
      label: "Assignments",
      href: "/dashboard/operations/assignments",
      icon: <ClipboardList className="size-4" />,
    },
    {
      label: "Couriers",
      href: "/dashboard/operations/couriers",
      icon: <Truck className="size-4" />,
    },
    {
      label: "Reports",
      href: "/dashboard/operations/reports",
      icon: <BarChart3 className="size-4" />,
    },
    {
      label: "Notifications",
      href: "/dashboard/customer/notifications",
      icon: <Bell className="size-4" />,
    },
    {
      label: "Profile",
      href: "/dashboard/operations/profile",
      icon: <User className="size-4" />,
    },
  ],
  ADMIN: [
    {
      label: "Overview",
      href: "/dashboard/admin",
      icon: <LayoutDashboard className="size-4" />,
    },
    {
      label: "Users",
      href: "/dashboard/admin/users",
      icon: <Users className="size-4" />,
    },
    {
      label: "Shipments",
      href: "/dashboard/admin/shipments",
      icon: <Package className="size-4" />,
    },
    {
      label: "Hubs",
      href: "/dashboard/admin/hubs",
      icon: <Warehouse className="size-4" />,
    },
    {
      label: "Payments",
      href: "/dashboard/admin/payments",
      icon: <CreditCard className="size-4" />,
    },
    {
      label: "Pricing",
      href: "/dashboard/admin/pricing",
      icon: <Settings className="size-4" />,
    },
    {
      label: "Audit Logs",
      href: "/dashboard/admin/audit-logs",
      icon: <ClipboardList className="size-4" />,
    },
    {
      label: "Profile",
      href: "/dashboard/admin/profile",
      icon: <User className="size-4" />,
    },
  ],
};

interface DashboardNavProps {
  role: Role;
  onNavigate?: () => void;
}

export function DashboardNav({ role, onNavigate }: DashboardNavProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role] ?? [];

  return (
    <nav aria-label="Dashboard navigation">
      <ul className="space-y-1">
        {items.map((item) => {
          const isActive =
            item.href === `/dashboard/${role.toLowerCase().replace("_", "-")}`
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-white/10 hover:text-white dark:hover:bg-white/10"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export { NAV_ITEMS };
