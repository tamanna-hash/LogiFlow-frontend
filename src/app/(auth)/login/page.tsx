import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your LogiFlow account.",
};

export default function LoginPage() {
  return <LoginForm />;
}
