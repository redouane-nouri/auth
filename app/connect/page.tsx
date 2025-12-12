import Connect from "../../components/connect/Connect";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export default async function ConnectPage() {
  /*
    If the user is authenticated then redirect him to home page, this is only for unauthenticated users
    We can't use this check in the middleware because of the authjs db adapter edge compatibility issue
  */
  if(await auth())
    redirect("/");

  return <Connect />;
}
