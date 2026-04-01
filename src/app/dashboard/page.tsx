import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { redirect } from "next/navigation";

export default async function DashboardIndex() {
  const token = cookies().get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const decoded = await verifyToken(token);

  if (!decoded) {
    redirect("/login");
  }

  // Redirect based on role
  if (decoded.role === "superadmin") {
    redirect("/dashboard/superadmin");
  } else if (decoded.role === "admin") {
    redirect("/dashboard/admin");
  } else if (decoded.role === "user") {
    redirect("/dashboard/user");
  } else {
    redirect("/login");
  }
}
