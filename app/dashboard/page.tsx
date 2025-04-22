"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Plus, Settings } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/auth/signin");
    },
  });

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="mr-2 h-4 w-4" /> Create New Invoice
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Invoices</CardTitle>
            <CardDescription>Manage your recent invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm font-medium">INV-001</span>
                <span className="text-sm text-muted-foreground">$1,234.00</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm font-medium">INV-002</span>
                <span className="text-sm text-muted-foreground">$567.00</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/invoices">
                <FileText className="mr-2 h-4 w-4" /> View All Invoices
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Account Settings</CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm">
                <div className="font-medium">{session.user?.name}</div>
                <div className="text-muted-foreground">{session.user?.email}</div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" /> Edit Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 