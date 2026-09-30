import type { Metadata } from "next";
import { ProfileEditor } from "@/app/dashboard/customer/profile/ProfileEditor";

export const metadata: Metadata = { title: "Courier Profile" };

export default function CourierProfilePage() {
  return <ProfileEditor />;
}
