import { auth } from "@/lib/auth/auth";
import Home from "@/components/home/Home";
import { redirect } from "next/navigation";

export default async function SignOutButton() {
  /*
    If the user is not authenticated then redirect him to connect page.
    We can't use this check in the middleware because of the authjs db adapter edge compatibility issue
  */
  if (!(await auth())) redirect("/connect");

  return <Home />;
}
