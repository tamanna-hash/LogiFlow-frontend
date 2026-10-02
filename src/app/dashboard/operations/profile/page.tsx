import type { Metadata } from "next";
import { ProfileEditor } from "@/app/dashboard/customer/profile/ProfileEditor";

export const metadata: Metadata = { title: "Operations Manager Profile" };

export default function OperationsProfilePage() {
  return <ProfileEditor />;
}
