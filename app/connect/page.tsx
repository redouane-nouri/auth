import Connect from "../../components/connect/Connect";
import { redirectIfAuthenticated } from "@/lib/auth/auth";

export default async function ConnectPage() {
  await redirectIfAuthenticated();

  return <Connect />;
}
