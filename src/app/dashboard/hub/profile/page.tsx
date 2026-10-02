import type { Metadata } from "next";
import { ProfileEditor } from "@/app/dashboard/customer/profile/ProfileEditor";

export const metadata: Metadata = { title: "Hub Manager Profile" };

export default function HubManagerProfilePage() {
  return <ProfileEditor />;
}
