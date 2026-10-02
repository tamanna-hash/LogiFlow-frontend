import type { Metadata } from "next";
import { ProfileEditor } from "@/app/dashboard/customer/profile/ProfileEditor";

export const metadata: Metadata = { title: "Admin Profile" };

export default function AdminProfilePage() {
  return <ProfileEditor />;
}
