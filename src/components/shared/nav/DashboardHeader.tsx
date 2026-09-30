"use client";

import Link from "next/link";
import { Menu, Bell, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/auth";
import { useLogout } from "@/features/auth/hooks";
import { useUnreadCount } from "@/features/notifications/hooks";
import { getInitials } from "@/lib/utils";
import { APP_NAME } from "@/config";

interface DashboardHeaderProps {
  onMenuToggle: () => void;
}

export function DashboardHeader({ onMenuToggle }: DashboardHeaderProps) {
  const { user } = useAuthStore();
  const { mutate: logout, isPending } = useLogout();
  const { data: unreadCount = 0 } = useUnreadCount();

  if (!user) return null;

  const notifHref = `/dashboard/${
    user.role === "CUSTOMER" ? "customer" : 
    user.role === "COURIER" ? "customer" : 
    "customer"
  }/notifications`;

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b bg-background px-4 gap-4">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuToggle}
        aria-label="Toggle navigation menu"
      >
        <Menu className="size-5" />
      </Button>

      {/* Logo (mobile) */}
      <Link href="/" className="font-semibold text-primary lg:hidden">
        {APP_NAME}
      </Link>

      <div className="flex-1" />

      {/* Notifications */}
      <Button variant="ghost" size="icon" asChild aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}>
        <Link href="/dashboard/customer/notifications">
          <span className="relative">
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground"
                aria-hidden="true"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </span>
        </Link>
      </Button>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2" aria-label="User menu">
            <Avatar className="size-8">
              <AvatarImage src={user.avatarUrl ?? undefined} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback className="text-xs">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-sm font-medium">
              {user.firstName}
            </span>
            <ChevronDown className="size-4 opacity-50" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="font-normal">
            <div className="text-sm font-medium">{user.firstName} {user.lastName}</div>
            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/${user.role === "CUSTOMER" ? "customer" : user.role === "COURIER" ? "courier" : user.role === "ADMIN" ? "admin" : user.role === "HUB_MANAGER" ? "hub" : "operations"}/profile`}>
              <User className="mr-2 size-4" aria-hidden="true" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => logout()}
            disabled={isPending}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 size-4" aria-hidden="true" />
            {isPending ? "Logging out…" : "Log out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
