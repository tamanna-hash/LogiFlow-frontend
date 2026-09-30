import type { Metadata } from "next";
import { ProfileEditor } from "./ProfileEditor";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return <ProfileEditor />;
}
