"use client";

import Link from "next/link";
import { X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DashboardNav } from "./DashboardNav";
import { useAuthStore } from "@/lib/auth";
import type { Role } from "@/types";
import { APP_NAME } from "@/config";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: "Customer",
  COURIER: "Courier",
  HUB_MANAGER: "Hub Manager",
  OPERATIONS_MANAGER: "Operations",
  ADMIN: "Admin",
};

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const { user } = useAuthStore();
  if (!user) return null;

  const role = user.role as Role;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r sidebar-surface transition-transform duration-300 ease-in-out",
          "lg:relative lg:translate-x-0 lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Sidebar navigation"
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-primary"
            onClick={onClose}
          >
            <Package className="size-5" aria-hidden="true" />
            {APP_NAME}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Role badge */}
        <div className="px-4 pt-4 pb-2">
          <Badge variant="secondary" className="text-xs">
            {ROLE_LABELS[role]}
          </Badge>
        </div>

        <Separator />

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <DashboardNav role={role} onNavigate={onClose} />
        </div>
      </aside>
    </>
  );
}
