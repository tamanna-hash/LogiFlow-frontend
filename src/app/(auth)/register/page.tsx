import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a free LogiFlow account to send and track shipments.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
