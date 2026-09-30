import type { Metadata } from "next";
import { VerifyEmailForm } from "./VerifyEmailForm";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Enter the verification code sent to your email.",
};

export default function VerifyEmailPage() {
  return <VerifyEmailForm />;
}
