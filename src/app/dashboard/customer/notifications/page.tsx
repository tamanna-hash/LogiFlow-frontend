import type { Metadata } from "next";
import { NotificationsCenter } from "./NotificationsCenter";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return <NotificationsCenter />;
}
