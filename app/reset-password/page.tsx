import { auth } from "@/lib/auth/auth";
import ResetPasswordCard from "@/components/resetPassword/ResetPasswordCard";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function ResetPasswordPage() {
  /*
    If the user is already authenticated then redirect him to home page, this is only for unauthenticated users
    We can't use this check in the middleware because of the authjs db adapter edge compatibility issue
  */
  if (await auth()) redirect("/");

  return (
    /*
      `useSearchParams` inside `ResetPasswordCard` needs a Suspense boundary, otherwise Next.js bails out the whole page to client side rendering.
    */
    <Suspense>
      <ResetPasswordCard />
    </Suspense>
  );
}
