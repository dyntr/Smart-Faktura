import SupplierClient from "./components/supplier";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SuppliersPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/auth/signin");
  }
  
  return <SupplierClient />;
}