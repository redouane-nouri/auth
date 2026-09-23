import { redirectIfAuthenticated } from "@/lib/auth/auth";
import ForgotPasswordCard from "@/components/forgotPassword/ForgotPasswordCard";

export default async function ForgotPasswordPage() {
  await redirectIfAuthenticated();

  return <ForgotPasswordCard />;
}
