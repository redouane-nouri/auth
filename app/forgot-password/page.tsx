import { auth } from "@/lib/auth/auth";
import ForgotPasswordCard from "@/components/forgotPassword/ForgotPasswordCard";
import { redirect } from "next/navigation";

export default async function ForgotPasswordPage() {
  /*
    If the user is already authenticated then redirect him to home page, this is only for unauthenticated users
    We can't use this check in the middleware because of the authjs db adapter edge compatibility issue
  */
  if (await auth()) redirect("/");

  return <ForgotPasswordCard />;
}
